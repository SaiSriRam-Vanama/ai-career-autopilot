"""
Resume processing service.
"""
from datetime import datetime
from typing import List
from app.database import get_resumes_collection
from app.ai_models.skill_extractor import extract_skills_from_resume


async def upload_resume(user_id: str, resume_text: str) -> dict:
    """
    Upload and process resume.
    
    1. Store raw resume text
    2. Extract skills using AI model
    3. Save to database
    """
    resumes_collection = get_resumes_collection()
    
    # Extract skills from resume
    extracted_skills = extract_skills_from_resume(resume_text)
    
    # Recommend roles
    from app.ai_models.role_recommender import recommend_roles
    recommended_roles = await recommend_roles(extracted_skills)
    
    # Create resume document
    resume_doc = {
        "user_id": user_id,
        "raw_text": resume_text,
        "extracted_skills": extracted_skills,
        "recommended_roles": recommended_roles,
        "uploaded_at": datetime.utcnow(),
    }
    
    # Check if user already has a resume
    existing_resume = await resumes_collection.find_one({"user_id": user_id})
    
    if existing_resume:
        # Update existing resume
        await resumes_collection.update_one(
            {"user_id": user_id},
            {"$set": resume_doc}
        )
        resume_doc["_id"] = existing_resume["_id"]
    else:
        # Insert new resume
        result = await resumes_collection.insert_one(resume_doc)
        resume_doc["_id"] = result.inserted_id
    
    return {
        "message": "Resume uploaded successfully",
        "extracted_skills": extracted_skills,
        "recommended_roles": recommended_roles,
        "skills_count": len(extracted_skills)
    }


async def get_user_resume(user_id: str) -> dict:
    """Get user's resume."""
    resumes_collection = get_resumes_collection()
    resume = await resumes_collection.find_one({"user_id": user_id})
    return resume


async def get_user_skills(user_id: str) -> List[str]:
    """Get user's extracted skills."""
    resume = await get_user_resume(user_id)
    if resume:
        return resume.get("extracted_skills", [])
    return []
