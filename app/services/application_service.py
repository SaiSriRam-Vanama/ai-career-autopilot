from datetime import datetime
from typing import List, Optional
from bson import ObjectId
from app.database import get_database

def get_applications_collection():
    return get_database()["applications"]

async def get_my_applications(user_id: str) -> List[dict]:
    """Get all applications for a user."""
    collection = get_applications_collection()
    cursor = collection.find({"user_id": user_id}).sort("updated_at", -1)
    
    applications = []
    async for app in cursor:
        app["_id"] = str(app["_id"])
        applications.append(app)
        
    return applications

async def create_application(application_data: dict) -> dict:
    """Create a new job application entry."""
    collection = get_applications_collection()
    
    application_data["created_at"] = datetime.utcnow()
    application_data["updated_at"] = datetime.utcnow()
    # Ensure status is valid, default to 'wishlist'
    if "status" not in application_data:
        application_data["status"] = "wishlist"
        
    result = await collection.insert_one(application_data)
    application_data["_id"] = str(result.inserted_id)
    
    return application_data

async def update_application_status(app_id: str, new_status: str, user_id: str) -> Optional[dict]:
    """Update the status of an application."""
    collection = get_applications_collection()
    
    result = await collection.find_one_and_update(
        {"_id": ObjectId(app_id), "user_id": user_id},
        {"$set": {
            "status": new_status,
            "updated_at": datetime.utcnow()
        }},
        return_document=True
    )
    
    if result:
        result["_id"] = str(result["_id"])
        return result
    return None

async def delete_application(app_id: str, user_id: str) -> bool:
    """Delete an application."""
    collection = get_applications_collection()
    result = await collection.delete_one({"_id": ObjectId(app_id), "user_id": user_id})
    return result.deleted_count > 0
