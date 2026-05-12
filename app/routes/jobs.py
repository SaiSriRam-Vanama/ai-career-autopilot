"""
Job search routes.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional
from app.services.auth_service import get_current_user
from app.services.job_service import search_jobs, get_job_by_id


router = APIRouter(prefix="/jobs", tags=["Jobs"])


@router.get("/search")
async def search_jobs_endpoint(
    query: str = Query(..., description="Job title or keywords"),
    location: Optional[str] = Query(None, description="Location (e.g., 'New York, NY')"),
    num_pages: int = Query(3, ge=1, le=5, description="Number of pages to fetch"),
    employment_types: Optional[str] = Query(None, description="Employment types (e.g., 'FULLTIME,PARTTIME')"),
    current_user: dict = Depends(get_current_user)
):
    """
    Search for jobs using JSearch API.
    
    - **query**: Job title or keywords (required)
    - **location**: Location filter (optional)
    - **num_pages**: Number of pages to fetch (1-5, default: 1)
    - **employment_types**: Employment type filter (optional)
    
    Returns list of job listings with extracted skills.
    """
    try:
        jobs = await search_jobs(query, location, num_pages, employment_types)
        
        return {
            "query": query,
            "location": location,
            "total_jobs": len(jobs),
            "jobs": jobs
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Job search failed: {str(e)}"
        )


@router.get("/{job_id}")
async def get_job_details(
    job_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get detailed information about a specific job.
    
    - **job_id**: Job ID from search results
    """
    try:
        job = await get_job_by_id(job_id)
        
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job not found"
            )
        
        # Convert ObjectId to string
        job["_id"] = str(job["_id"])
        
        return job
    
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve job: {str(e)}"
        )
