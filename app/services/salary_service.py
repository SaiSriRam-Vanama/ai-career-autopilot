"""
Salary insights service using Adzuna API.
"""
import httpx
from typing import Optional
from datetime import datetime
from app.config import settings
from app.database import get_salary_trends_collection


async def get_salary_insights(
    job_title: str,
    location: Optional[str] = None
) -> dict:
    """
    Get salary insights and market demand using Adzuna API.
    
    Args:
        job_title: Job title to search for
        location: Location (optional)
    """
    salary_collection = get_salary_trends_collection()
    
    # Adzuna API endpoint for salary statistics
    country = settings.ADZUNA_COUNTRY
    url = f"{settings.ADZUNA_BASE_URL}/jobs/{country}/history"
    
    params = {
        "app_id": settings.ADZUNA_APP_ID,
        "app_key": settings.ADZUNA_APP_KEY,
        "what": job_title,
        "content-type": "application/json"
    }
    
    if location:
        params["where"] = location
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
        
        # Extract salary data
        month_data = data.get("month", {})
        
        # Get average salary
        avg_salary = month_data.get("average_salary", 0)
        
        # Calculate demand score based on job count
        job_count = sum([item.get("count", 0) for item in month_data.get("histogram", [])])
        demand_score = min(job_count / 100, 10.0)  # Normalize to 0-10 scale
        
        # Get salary range
        histogram = month_data.get("histogram", [])
        salaries = [item.get("salary", 0) for item in histogram if item.get("salary")]
        
        min_salary = min(salaries) if salaries else 0
        max_salary = max(salaries) if salaries else 0
        
        # Store in database
        salary_data = {
            "job_title": job_title,
            "location": location or "All Locations",
            "avg_salary": avg_salary,
            "min_salary": min_salary,
            "max_salary": max_salary,
            "currency": "USD",
            "demand_score": round(demand_score, 2),
            "job_count": job_count,
            "source": "adzuna",
            "fetched_at": datetime.utcnow(),
        }
        
        await salary_collection.insert_one(salary_data)
        
        return {
            "job_title": job_title,
            "location": location or "All Locations",
            "salary_insights": {
                "average": avg_salary,
                "min": min_salary,
                "max": max_salary,
                "currency": "USD"
            },
            "market_demand": {
                "score": round(demand_score, 2),
                "job_count": job_count,
                "interpretation": get_demand_interpretation(demand_score)
            }
        }
    
    except httpx.HTTPError as e:
        print(f"Adzuna API error: {e}")
        # Return fallback data
        return {
            "job_title": job_title,
            "location": location or "All Locations",
            "salary_insights": {
                "average": 0,
                "min": 0,
                "max": 0,
                "currency": "USD",
                "note": "Data unavailable from Adzuna API"
            },
            "market_demand": {
                "score": 0,
                "job_count": 0,
                "interpretation": "Data unavailable"
            }
        }
    except Exception as e:
        print(f"Salary insights error: {e}")
        raise


def get_demand_interpretation(score: float) -> str:
    """Interpret demand score."""
    if score >= 8:
        return "Very High Demand"
    elif score >= 6:
        return "High Demand"
    elif score >= 4:
        return "Moderate Demand"
    elif score >= 2:
        return "Low Demand"
    else:
        return "Very Low Demand"
