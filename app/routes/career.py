"""
Career and Roadmap API Routes.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional
import traceback
from datetime import datetime
from app.services.auth_service import get_current_user
from app.services import career_service
from app.database import get_career_paths_collection
from bson import ObjectId

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks

from pydantic import BaseModel

class BioRequest(BaseModel):
    keywords: str

router = APIRouter(prefix="/career", tags=["Career"])

# ...

@router.post("/generate")
async def generate_career_roadmap_endpoint(
    target_role: str,
    background_tasks: BackgroundTasks,
    location: Optional[str] = None,
    duration: str = "12 weeks",
    current_user: dict = Depends(get_current_user)
):
    """
    Generate a new career roadmap for the user (Async Background).
    Returns immediately with a 'generating' status roadmap.
    """

    try:
        with open("debug_career.log", "a") as f:
            f.write(f"{datetime.utcnow()} - Received generate request: {target_role}, {location}, {duration}\n")

        user_id = str(current_user["_id"])

        # 1. Initialize Skeleton (Fast)
        career_path = await career_service.initialize_skeleton_path(
            user_id=user_id,
            target_role=target_role,
            location=location,
            duration=duration
        )
        
        # 2. Schedule Heavy Lifting
        background_tasks.add_task(
            career_service.populate_roadmap_background,
            user_id,
            career_path["_id"],
            target_role,
            location,
            duration
        )
        
        return {"message": "Roadmap generation started", "career_path": career_path}
    
    except Exception as e:
        with open("debug_career.log", "a") as f:
            f.write(f"{datetime.utcnow()} - Error in endpoint: {e}\n")
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to initiate roadmap generation: {str(e)}"
        )


def calculate_roadmap_progress(roadmap_weeks):
    """Helper to calculate progress percentage from roadmap tasks."""
    if not roadmap_weeks:
        return {"percentage": 0}
        
    total_tasks = 0
    completed_tasks = 0
    
    for week in roadmap_weeks:
        tasks = week.get("tasks", [])
        total_tasks += len(tasks)
        completed_tasks += sum(1 for t in tasks if t.get("completed", False))
        
    if total_tasks == 0:
        return {"percentage": 0}
        
    return {"percentage": round((completed_tasks / total_tasks) * 100)}

@router.get("/me")
async def get_my_roadmap(current_user: dict = Depends(get_current_user)):
    """
    Get the current user's active career roadmap.
    """
    try:
        user_id = str(current_user["_id"])
        career_path = await career_service.get_user_career_path(user_id)
        
        if not career_path:
            return None
            
        # Convert ObjectId to string and map to id
        if "_id" in career_path:
            career_path["_id"] = str(career_path["_id"])
            career_path["id"] = career_path["_id"]
        
        # Calculate dynamic progress
        career_path["progress"] = calculate_roadmap_progress(career_path.get("roadmap", []))
        
        return career_path
    
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve roadmap: {str(e)}"
        )


@router.get("/history")
async def get_roadmap_history(current_user: dict = Depends(get_current_user)):
    """
    Get user's roadmap history (archived/inactive).
    """
    try:
        user_id = str(current_user["_id"])
        # Convert ObjectIds to str for JSON
        history = await career_service.get_user_roadmap_history(user_id)
        for h in history:
            h["_id"] = str(h["_id"])
            h["id"] = h["_id"]
            # Calculate dynamic progress
            h["progress"] = calculate_roadmap_progress(h.get("roadmap", []))
            
        return history
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{roadmap_id}/archive")
async def archive_roadmap_endpoint(roadmap_id: str, current_user: dict = Depends(get_current_user)):
    """
    Archive/Pause a roadmap.
    """
    try:
        user_id = str(current_user["_id"])
        success = await career_service.archive_roadmap(user_id, roadmap_id)
        if not success:
            raise HTTPException(status_code=404, detail="Roadmap not found")
        return {"message": "Roadmap archived"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/task/{task_id}")
async def update_task_status(
    task_id: str,
    status_update: dict,
    current_user: dict = Depends(get_current_user)
):
    """
    Update completion status of a specific task.
    """
    try:
        from app.database import get_career_paths_collection
        user_id = str(current_user["_id"])
        completed = status_update.get("completed", False)
        
        # We need to find the career path that has this task
        # Since task IDs are unique (ObjectIds), we can search across the user's active roadmap
        collection = get_career_paths_collection()
        
        # Retrieve the user's roadmap that contains this specific task
        roadmap_doc = await collection.find_one({
            "user_id": user_id,
            "roadmap.tasks.id": task_id
        })
        
        if not roadmap_doc:
            raise HTTPException(status_code=404, detail="Task not found in any roadmap")
            
        # Update the task in python (easier than complex array filters for deep nesting)
        updated = False
        for week in roadmap_doc.get("roadmap", []):
            for task in week.get("tasks", []):
                if task.get("id") == task_id:
                    task["completed"] = completed
                    updated = True
                    break
            if updated:
                break
        
        if updated:
            await collection.update_one(
                {"_id": roadmap_doc["_id"]},
                {"$set": {"roadmap": roadmap_doc["roadmap"]}}
            )
            return {"message": "Task updated", "task_id": task_id, "completed": completed}
        
        raise HTTPException(status_code=404, detail="Task not found")
        
    except Exception as e:
        print(f"Error updating task: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-bio")
async def generate_bio_endpoint(
    request: BioRequest,
    current_user: dict = Depends(get_current_user)
):
    """Generate a professional bio based on keywords."""
    try:
        bio = await career_service.generate_brand_bio(request.keywords)
        return {"bio": bio}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{roadmap_id}")
async def delete_roadmap_endpoint(
    roadmap_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Delete a specific roadmap.
    """
    try:
        user_id = str(current_user["_id"])
        collection = get_career_paths_collection()
        
        result = await collection.delete_one({
            "_id": ObjectId(roadmap_id),
            "user_id": user_id
        })
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Roadmap not found")
            
        return {"message": "Roadmap deleted successfully"}
        
    except Exception as e:
        print(f"Delete roadmap error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
