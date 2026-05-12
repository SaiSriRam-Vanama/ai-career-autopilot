"""
Salary insights routes.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional
from app.services.auth_service import get_current_user
from app.services.salary_service import get_salary_insights


router = APIRouter(prefix="/salary", tags=["Salary"])


@router.get("/insights")
async def salary_insights_endpoint(
    job_title: str = Query(..., description="Job title to get salary insights for"),
    location: Optional[str] = Query(None, description="Location (optional)"),
    current_user: dict = Depends(get_current_user)
):
    """
    Get salary insights and market demand for a job title.
    
    - **job_title**: Job title to analyze (required)
    - **location**: Location filter (optional)
    
    Returns salary statistics and market demand score.
    """
    try:
        insights = await get_salary_insights(job_title, location)
        return insights
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get salary insights: {str(e)}"
        )
