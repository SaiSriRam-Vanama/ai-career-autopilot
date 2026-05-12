"""
Job search service using JSearch API.
"""
import httpx
from typing import List, Optional
from datetime import datetime
from app.config import settings
from app.database import get_jobs_collection
import re


async def search_jobs(
    query: str,
    location: Optional[str] = None,
    num_pages: int = 1,
    employment_types: Optional[str] = None
) -> List[dict]:
    """
    Search for jobs using JSearch API.
    
    Args:
        query: Job title or keywords
        location: Location (e.g., "New York, NY")
        num_pages: Number of pages to fetch (default: 1)
        employment_types: Comma-separated employment types (e.g., "FULLTIME,PARTTIME")
    """
    jobs_collection = get_jobs_collection()
    
    url = f"{settings.JSEARCH_API_URL}/search"
    headers = {
        "X-RapidAPI-Key": settings.JSEARCH_API_KEY,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com"
    }
    
    params = {
        "query": f"{query} in {location}" if location else query,
        "num_pages": num_pages,
        "date_posted": "week" # Ensure freshness
    }
    
    # JSearch handles 'employment_types' parameter differently, usually part of query or separate
    if employment_types:
        params["employment_types"] = employment_types
        
    # Remove explicit location param if JSearch prefers it in query
    # if location:
    #    params["location"] = location
    
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.get(url, headers=headers, params=params)
            response.raise_for_status()
            data = response.json()
        
        jobs = data.get("data", [])
        processed_jobs = []
        
        for job in jobs:
            # Extract skills from job description
            required_skills = extract_skills_from_job_description(
                job.get("job_description", "")
            )
            
            # Process job data - Match Frontend Interface
            job_data = {
                "job_id": job.get("job_id", ""),
                "job_title": job.get("job_title", ""),
                "employer_name": job.get("employer_name", ""),
                "employer_logo": job.get("employer_logo", None),
                "job_city": job.get("job_city", ""),
                "job_state": job.get("job_state", ""),
                "job_country": job.get("job_country", ""),
                "job_description": job.get("job_description", ""),
                "required_skills": required_skills,
                "job_min_salary": job.get("job_min_salary"),
                "job_max_salary": job.get("job_max_salary"),
                "job_salary_currency": job.get("job_salary_currency", "USD"),
                "job_apply_link": job.get("job_apply_link", ""),
                "job_employment_type": job.get("job_employment_type", "FULLTIME"),
                "job_posted_at_datetime_utc": job.get("job_posted_at_datetime_utc", None),
                "source": "jsearch",
                "fetched_at": datetime.utcnow(),
            }
            
            # Construct display salary if available
            if job_data["job_min_salary"] and job_data["job_max_salary"]:
                job_data["job_salary"] = f"{job_data['job_min_salary']} - {job_data['job_max_salary']} {job_data['job_salary_currency']}"
            elif job_data["job_max_salary"]:
                 job_data["job_salary"] = f"Up to {job_data['job_min_salary']} {job_data['job_salary_currency']}"
            
            # Store in database
            await jobs_collection.update_one(
                {"job_id": job_data["job_id"]},
                {"$set": job_data},
                upsert=True
            )
            
            processed_jobs.append(job_data)
        
        return processed_jobs
    
    except httpx.HTTPError as e:
        print(f"JSearch API error: {e}")
        return []
    except Exception as e:
        print(f"Job search error: {e}")
        return []


def extract_skills_from_job_description(description: str) -> List[str]:
    """Extract technical skills from job description."""
    skills = set()
    
    # Common tech skills to look for
    tech_keywords = [
        'Python', 'Java', 'JavaScript', 'TypeScript', 'C++', 'C#', 'Ruby', 'Go', 'Rust',
        'PHP', 'Swift', 'Kotlin', 'Scala', 'R', 'SQL', 'HTML', 'CSS',
        'React', 'Angular', 'Vue', 'Django', 'Flask', 'FastAPI', 'Spring', 'Node.js',
        'Express', 'TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn', 'Pandas', 'NumPy',
        'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Cassandra', 'DynamoDB',
        'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'Git',
        'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision', 'Data Science',
        'REST API', 'GraphQL', 'Microservices', 'Agile', 'Scrum', 'CI/CD'
    ]
    
    description_lower = description.lower()
    for keyword in tech_keywords:
        if keyword.lower() in description_lower:
            skills.add(keyword)
    
    return sorted(list(skills))


async def get_job_by_id(job_id: str) -> Optional[dict]:
    """Get job details by ID."""
    jobs_collection = get_jobs_collection()
    job = await jobs_collection.find_one({"job_id": job_id})
    return job


async def get_salary_trends(job_title: str, location: str) -> Optional[dict]:
    """
    Get salary trends for a job title in a location.
    Uses Adzuna API via salary_service.
    """
    from app.services.salary_service import get_salary_insights
    
    print(f"Fetching salary trends for {job_title} in {location}")
    
    try:
        return await get_salary_insights(job_title, location)
    except Exception as e:
        print(f"Error fetching salary trends: {e}")
        # Return fallback if API fails
        return {
            "salary_insights": {
                "average": 0,
                "min": 0,
                "max": 0,
                "currency": "USD",
                "note": "Data unavailable"
            },
            "market_demand": {
                "interpretation": "Unknown",
                "growth_rate": "Unknown"
            }
        }
