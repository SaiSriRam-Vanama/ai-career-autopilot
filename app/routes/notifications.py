from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
from datetime import datetime
from bson import ObjectId

from app.database.connection import get_database
from app.database.models import NotificationModel
from app.services.auth_service import get_current_user

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)

@router.get("/", response_model=List[NotificationModel])
async def get_notifications(
    skip: int = 0,
    limit: int = 50,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db=Depends(get_database)
):
    """Get all notifications for the current user."""
    notifications = await db["notifications"].find(
        {"user_id": str(current_user["_id"])}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(length=limit)
    
    return notifications

@router.get("/unread-count", response_model=Dict[str, int])
async def get_unread_count(
    current_user: Dict[str, Any] = Depends(get_current_user),
    db=Depends(get_database)
):
    """Get count of unread notifications."""
    count = await db["notifications"].count_documents({
        "user_id": str(current_user["_id"]),
        "read": False
    })
    return {"count": count}

@router.post("/", response_model=NotificationModel, status_code=status.HTTP_201_CREATED)
async def create_notification(
    notification: NotificationModel,
    db=Depends(get_database)
    # Internal use only, usually called by other services
):
    """Create a new notification (Internal/Admin use)."""
    notif_dict = notification.model_dump(by_alias=True, exclude=["id"])
    if not notif_dict.get("created_at"):
        notif_dict["created_at"] = datetime.utcnow()
        
    new_notif = await db["notifications"].insert_one(notif_dict)
    created_notif = await db["notifications"].find_one({"_id": new_notif.inserted_id})
    return created_notif

@router.patch("/{notification_id}/read", response_model=NotificationModel)
async def mark_as_read(
    notification_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db=Depends(get_database)
):
    """Mark a notification as read."""
    if not ObjectId.is_valid(notification_id):
        raise HTTPException(status_code=400, detail="Invalid notification ID")
        
    result = await db["notifications"].find_one_and_update(
        {"_id": ObjectId(notification_id), "user_id": str(current_user["_id"])},
        {"$set": {"read": True}},
        return_document=True
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    return result

@router.patch("/read-all", response_model=Dict[str, int])
async def mark_all_as_read(
    current_user: Dict[str, Any] = Depends(get_current_user),
    db=Depends(get_database)
):
    """Mark all notifications as read for current user."""
    result = await db["notifications"].update_many(
        {"user_id": str(current_user["_id"]), "read": False},
        {"$set": {"read": True}}
    )
    
    return {"updated": result.modified_count}

@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notification(
    notification_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db=Depends(get_database)
):
    """Delete a notification."""
    if not ObjectId.is_valid(notification_id):
        raise HTTPException(status_code=400, detail="Invalid notification ID")
        
    result = await db["notifications"].delete_one({
        "_id": ObjectId(notification_id),
        "user_id": str(current_user["_id"])
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
