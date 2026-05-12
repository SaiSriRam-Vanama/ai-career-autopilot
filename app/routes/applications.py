from fastapi import APIRouter, Depends, HTTPException, status, Body
from typing import List, Optional
from pydantic import BaseModel
from app.services.auth_service import get_current_user
from app.services.application_service import (
    get_my_applications,
    create_application,
    update_application_status,
    delete_application
)

router = APIRouter(prefix="/applications", tags=["Applications"])

class ApplicationCreate(BaseModel):
    company: str
    position: str
    location: Optional[str] = None
    salary: Optional[str] = None
    status: str = "wishlist" # wishlist, applied, interviewing, offer, rejected
    url: Optional[str] = None
    notes: Optional[str] = None

class ApplicationStatusUpdate(BaseModel):
    status: str

@router.get("/", response_model=List[dict])
async def get_applications(current_user: dict = Depends(get_current_user)):
    """Get all applications for current user."""
    return await get_my_applications(str(current_user["_id"]))

@router.post("/", response_model=dict)
async def add_application(
    application: ApplicationCreate,
    current_user: dict = Depends(get_current_user)
):
    """Add a new job application to track."""
    app_data = application.dict()
    app_data["user_id"] = str(current_user["_id"])
    return await create_application(app_data)

@router.put("/{app_id}/status", response_model=dict)
async def update_status(
    app_id: str,
    update: ApplicationStatusUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update application status."""
    updated_app = await update_application_status(
        app_id, 
        update.status,
        str(current_user["_id"])
    )
    
    if not updated_app:
        raise HTTPException(status_code=404, detail="Application not found")
        
    return updated_app

@router.delete("/{app_id}")
async def remove_application(
    app_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete an application."""
    success = await delete_application(app_id, str(current_user["_id"]))
    if not success:
        raise HTTPException(status_code=404, detail="Application not found")
    return {"message": "Application deleted"}
