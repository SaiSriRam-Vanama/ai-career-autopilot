"""
Course recommendation service using Coursera API.
"""
import httpx
from typing import List
from app.config import settings
from app.database.models import CourseRecommendation


async def get_course_recommendations(missing_skills: List[str]) -> List[CourseRecommendation]:
    """
    Get course recommendations from Coursera for missing skills.
    
    Args:
        missing_skills: List of skills to find courses for
    
    Returns:
        List of recommended courses
    """
    recommendations = []
    
    for skill in missing_skills[:10]:  # Limit to top 10 skills
        courses = await search_coursera_courses(skill)
        recommendations.extend(courses)
    
    # Remove duplicates and limit results
    unique_courses = {}
    for course in recommendations:
        if course.course_id not in unique_courses:
            unique_courses[course.course_id] = course
    
    return list(unique_courses.values())[:20]  # Return top 20 courses


async def search_coursera_courses(skill: str) -> List[CourseRecommendation]:
    """
    Search Coursera for courses related to a skill.
    
    Note: Coursera API v1 has limited public access.
    This implementation uses a fallback approach with common courses.
    """
    url = settings.COURSERA_API_URL
    
    params = {
        "q": "search",
        "query": skill,
        "fields": "name,description,photoUrl,workload,averageFiveStarRating",
        "limit": 5
    }
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, params=params)
            
            if response.status_code == 200:
                data = response.json()
                courses = []
                
                for item in data.get("elements", []):
                    course = CourseRecommendation(
                        course_id=item.get("id", ""),
                        course_name=item.get("name", ""),
                        provider="Coursera",
                        url=f"https://www.coursera.org/learn/{item.get('slug', '')}",
                        rating=item.get("averageFiveStarRating"),
                        duration=item.get("workload", "Self-paced"),
                        skills_covered=[skill]
                    )
                    courses.append(course)
                
                return courses
    
    except Exception as e:
        print(f"Coursera API error: {e}")
    
    # Fallback: Return curated course recommendations
    return get_fallback_courses(skill)


def get_fallback_courses(skill: str) -> List[CourseRecommendation]:
    """
    Fallback course recommendations when API is unavailable.
    Returns curated courses based on skill category.
    """
    skill_lower = skill.lower()
    
    # Curated course database
    course_database = {
        "python": [
            CourseRecommendation(
                course_id="python-for-everybody",
                course_name="Python for Everybody Specialization",
                provider="Coursera",
                url="https://www.coursera.org/specializations/python",
                rating=4.8,
                duration="8 months",
                skills_covered=["Python"]
            )
        ],
        "machine learning": [
            CourseRecommendation(
                course_id="machine-learning-stanford",
                course_name="Machine Learning by Stanford",
                provider="Coursera",
                url="https://www.coursera.org/learn/machine-learning",
                rating=4.9,
                duration="11 weeks",
                skills_covered=["Machine Learning"]
            )
        ],
        "data science": [
            CourseRecommendation(
                course_id="data-science-specialization",
                course_name="Data Science Specialization",
                provider="Coursera",
                url="https://www.coursera.org/specializations/jhu-data-science",
                rating=4.6,
                duration="11 months",
                skills_covered=["Data Science", "R", "Python"]
            )
        ],
        "aws": [
            CourseRecommendation(
                course_id="aws-fundamentals",
                course_name="AWS Fundamentals Specialization",
                provider="Coursera",
                url="https://www.coursera.org/specializations/aws-fundamentals",
                rating=4.7,
                duration="4 months",
                skills_covered=["AWS", "Cloud Computing"]
            )
        ],
        "react": [
            CourseRecommendation(
                course_id="react-specialization",
                course_name="Full-Stack Web Development with React",
                provider="Coursera",
                url="https://www.coursera.org/specializations/full-stack-react",
                rating=4.7,
                duration="4 months",
                skills_covered=["React", "JavaScript", "Node.js"]
            )
        ],
        "docker": [
            CourseRecommendation(
                course_id="docker-kubernetes",
                course_name="Docker and Kubernetes: The Complete Guide",
                provider="Udemy",
                url="https://www.udemy.com/course/docker-and-kubernetes-the-complete-guide/",
                rating=4.6,
                duration="22 hours",
                skills_covered=["Docker", "Kubernetes"]
            )
        ],
    }
    
    # Find matching courses
    for key, courses in course_database.items():
        if key in skill_lower:
            return courses
    
    # Generic course recommendation
    return [
        CourseRecommendation(
            course_id=f"generic-{skill.replace(' ', '-')}",
            course_name=f"Learn {skill}",
            provider="Multiple Platforms",
            url=f"https://www.coursera.org/search?query={skill.replace(' ', '+')}",
            rating=4.5,
            duration="Varies",
            skills_covered=[skill]
        )
    ]
