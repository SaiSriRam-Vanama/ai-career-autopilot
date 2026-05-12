from fastapi import APIRouter, Depends, HTTPException, status, Body
from typing import Dict, Any, List
from bson import ObjectId

from app.database.connection import get_database
from app.database.models import UserUpdate, UserModel
from app.services.auth_service import get_current_user, get_password_hash, verify_password

router = APIRouter(
    prefix="/settings",
    tags=["Settings"]
)

@router.put("/profile", response_model=Dict[str, Any])
async def update_profile(
    profile_data: UserUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db=Depends(get_database)
):
    """Update user profile information."""
    update_data = profile_data.model_dump(exclude_unset=True)
    
    # Filter out empty fields if needed, but Pydantic handles unsets well.
    if not update_data:
        raise HTTPException(status_code=400, detail="No data provided for update")
        
    result = await db["users"].find_one_and_update(
        {"_id": current_user["_id"]},
        {"$set": update_data},
        return_document=True
    )
    
    # Return updated user stats or profile
    return {
        "message": "Profile updated successfully",
        "user": {
            "full_name": result.get("full_name"),
            "headline": result.get("headline"),
            "location": result.get("location"),
            "about": result.get("about"),
            "skills": result.get("skills")
        }
    }

@router.post("/password")
async def change_password(
    password_data: Dict[str, str] = Body(...),
    current_user: Dict[str, Any] = Depends(get_current_user),
    db=Depends(get_database)
):
    """Change user password."""
    current_password = password_data.get("current_password")
    new_password = password_data.get("new_password")
    
    if not current_password or not new_password:
        raise HTTPException(status_code=400, detail="Current and new password required")
        
    # Verify current password
    # We need to fetch the user with password field (it might not be in current_user dep if we stripped it)
    user_in_db = await db["users"].find_one({"_id": current_user["_id"]})
    
    if not verify_password(current_password, user_in_db["hashed_password"]):
        raise HTTPException(status_code=400, detail="Incorrect current password")
        
    # Hash new password
    hashed_new = get_password_hash(new_password)
    
    await db["users"].update_one(
        {"_id": current_user["_id"]},
        {"$set": {"hashed_password": hashed_new}}
    )
    
    return {"message": "Password changed successfully"}

@router.delete("/account", status_code=status.HTTP_204_NO_CONTENT)
async def delete_account(
    current_user: Dict[str, Any] = Depends(get_current_user),
    db=Depends(get_database)
):
    """Delete user account and all associated data."""
    user_id = str(current_user["_id"])
    
    # Cancel any scheduled tasks if needed (omitted for now)
    
    # Delete related data
    await db["resumes"].delete_many({"user_id": user_id})
    await db["notifications"].delete_many({"user_id": user_id})
    await db["career_paths"].delete_many({"user_id": user_id})
    await db["applications"].delete_many({"user_id": user_id})
    await db["chat_history"].delete_many({"user_id": user_id})
    
    # Delete user
    result = await db["users"].delete_one({"_id": current_user["_id"]})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
