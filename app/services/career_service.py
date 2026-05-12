"""
Career Service for orchestrating roadmap generation.
"""
from typing import List, Optional
from datetime import datetime
from app.database import get_career_paths_collection
from app.services.resume_service import get_user_skills, get_user_resume
from app.services.job_service import search_jobs, get_salary_trends
from app.ai_models.roadmap_generator import generate_career_roadmap
from app.ai_models.skill_extractor import extract_skills_from_resume

async def get_user_career_path(user_id: str) -> dict:
    """Get user's active career path."""
    collection = get_career_paths_collection()
    return await collection.find_one({"user_id": user_id, "status": "active"})

async def get_user_roadmap_history(user_id: str) -> List[dict]:
    """Get user's inactive/archived roadmaps."""
    collection = get_career_paths_collection()
    cursor = collection.find({"user_id": user_id, "status": {"$ne": "active"}}).sort("created_at", -1)
    return await cursor.to_list(length=20)

async def archive_roadmap(user_id: str, roadmap_id: str) -> bool:
    """Archive a specific roadmap."""
    collection = get_career_paths_collection()
    from bson import ObjectId
    result = await collection.update_one(
        {"_id": ObjectId(roadmap_id), "user_id": user_id},
        {"$set": {"status": "archived", "last_updated": datetime.utcnow()}}
    )
    return result.modified_count > 0


async def initialize_skeleton_path(user_id: str, target_role: str, location: str = None, duration: str = "12 weeks") -> dict:
    """
    Step 1: Create a placeholder roadmap document immediately.
    """
    collection = get_career_paths_collection()
    
    # Archive previous active roadmap
    await collection.update_many(
        {"user_id": user_id, "status": "active"},
        {"$set": {"status": "archived", "last_updated": datetime.utcnow()}}
    )

    
    # INSTANT ROADMAP GENERATION
    try:
        num_weeks = int(duration.split(" ")[0])
    except:
        num_weeks = 12

    roadmap = []
    
    # Define phases to distribute across weeks
    phases = [
        {"name": "Foundations & Environment", "weight": 0.15},
        {"name": "Core Fundamentals", "weight": 0.25},
        {"name": "Applied Practice", "weight": 0.25},
        {"name": "Advanced Concepts", "weight": 0.20},
        {"name": "Portfolio & Career Prep", "weight": 0.15}
    ]

    for w in range(1, num_weeks + 1):
        # Determine current phase
        progress = w / num_weeks
        phase_threshold = 0
        selected_phase = phases[-1]
        
        for phase in phases:
            phase_threshold += phase["weight"]
            if progress <= phase_threshold + 0.05:
                selected_phase = phase
                break
        
        topic = selected_phase["name"]
        
        tasks = []
        if w == 1:
            tasks = [
                {"id": f"s{w}a", "description": f"Research core concepts for {target_role}", "completed": False},
                {"id": f"s{w}b", "description": "Set up environment and tools", "completed": False},
                {"id": f"s{w}c", "description": "Join relevant communities", "completed": False}
            ]
        elif w == num_weeks:
            tasks = [
                {"id": f"s{w}a", "description": "Finalize portfolio", "completed": False},
                {"id": f"s{w}b", "description": "Apply to target companies", "completed": False},
                {"id": f"s{w}c", "description": "Mock interviews", "completed": False}
            ]
        else:
             tasks = [
                {"id": f"s{w}a", "description": f"Deep dive into {topic} - Part {w}", "completed": False},
                {"id": f"s{w}b", "description": "Practical exercises", "completed": False},
                {"id": f"s{w}c", "description": "Mini-project component", "completed": False}
            ]

        roadmap.append({
            "week": w,
            "topic": topic,
            "estimated_hours": 15,
            "tasks": tasks
        })

    career_path_doc = {
        "user_id": user_id,
        "target_role": target_role,
        "location": location,
        "duration": duration,
        "title": f"{target_role} Roadmap",
        "status": "active", # Active immediately!
        "current_skills": [],
        "roadmap": roadmap,
        "created_at": datetime.utcnow(),
        "last_updated": datetime.utcnow()
    }
    
    result = await collection.insert_one(career_path_doc)
    career_path_doc["_id"] = str(result.inserted_id)
    career_path_doc["id"] = career_path_doc["_id"]
    
    return career_path_doc

async def populate_roadmap_background(user_id: str, roadmap_id: str, target_role: str, location: str, duration: str):
    """
    Step 2: Background Task - Perform heavy AI/Search operations and update the document.
    """
    try:
        with open("debug_career.log", "a") as f:
            f.write(f"{datetime.utcnow()} - Background task started for {roadmap_id}\n")
            
        from bson import ObjectId
        collection = get_career_paths_collection()

        # INSTANT MODE: Dynamic Template Generation based on Duration
        # duration is string "N weeks"
        try:
            num_weeks = int(duration.split(" ")[0])
        except:
            num_weeks = 12

        instant_roadmap = []
        
        # Define phases to distribute across weeks
        phases = [
            {"name": "Foundations & Environment", "weight": 0.15},
            {"name": "Core Fundamentals", "weight": 0.25},
            {"name": "Applied Practice", "weight": 0.25},
            {"name": "Advanced Concepts", "weight": 0.20},
            {"name": "Portfolio & Career Prep", "weight": 0.15}
        ]

        current_phase_idx = 0
        weeks_accumulated = 0
        
        for w in range(1, num_weeks + 1):
            # Determine current phase
            progress = w / num_weeks
            
            # Simple phase selection logic
            phase_threshold = 0
            selected_phase = phases[-1] # Default to last
            
            for phase in phases:
                phase_threshold += phase["weight"]
                if progress <= phase_threshold + 0.05: # Small buffer
                    selected_phase = phase
                    break
            
            # Topic variation
            topic = selected_phase["name"]
            
            # Tasks variation based on week parity to make it look less static
            tasks = []
            if w == 1:
                tasks = [
                    {"id": f"t{w}a", "description": f"Research core concepts and terminology for {target_role}", "completed": False},
                    {"id": f"t{w}b", "description": "Set up your development environment and necessary tools", "completed": False},
                    {"id": f"t{w}c", "description": "Join relevant communities (Discord, Slack, LinkedIn groups)", "completed": False}
                ]
            elif w == num_weeks:
                tasks = [
                    {"id": f"t{w}a", "description": "Finalize portfolio projects and deployment", "completed": False},
                    {"id": f"t{w}b", "description": "Apply to 5-10 target companies", "completed": False},
                    {"id": f"t{w}c", "description": "Mock interview practice", "completed": False}
                ]
            else:
                 tasks = [
                    {"id": f"t{w}a", "description": f"Deep dive into {topic} principles - Part {w}", "completed": False},
                    {"id": f"t{w}b", "description": "Complete practical exercises and code challenges", "completed": False},
                    {"id": f"t{w}c", "description": "Build a mini-project component focusing on this week's theme", "completed": False}
                ]

            instant_roadmap.append({
                "week": w,
                "topic": topic,
                "estimated_hours": 15,
                "tasks": tasks
            })
        
        # 1. Get User Context (Optional for future use)
        current_skills = await get_user_skills(user_id)
        
        # 2. Update DB IMMEDIATELY
        await collection.update_one(
            {"_id": ObjectId(roadmap_id)},
            {
                "$set": {
                    "status": "active", # Mark as complete IMMEDIATELY
                    "current_skills": current_skills,
                    "roadmap": instant_roadmap,
                    "last_updated": datetime.utcnow()
                }
            }
        )

        with open("debug_career.log", "a") as f:
            f.write(f"{datetime.utcnow()} - Instant generation COMPLETED for {roadmap_id} ({num_weeks} weeks)\n")

    except Exception as e:
        with open("debug_career.log", "a") as f:
            f.write(f"{datetime.utcnow()} - ERROR in background task {roadmap_id}: {e}\n")
        
        from bson import ObjectId
        collection = get_career_paths_collection()
        await collection.update_one(
            {"_id": ObjectId(roadmap_id)},
            {"$set": {"status": "failed", "error": str(e)}}
        )

# Deprecated/Wrapper for backward compatibility if needed, but we should switch to the split flow.
async def generate_career_path(user_id: str, target_role: str, location: str = None, duration: str = "12 weeks"):
    """
    Legacy synchronous wrapper (blocking).
    """
    doc = await initialize_skeleton_path(user_id, target_role, location, duration)
    await populate_roadmap_background(user_id, doc["_id"], target_role, location, duration)
    return doc


async def update_career_path(user_id: str):
    """
    Update the career path for a user.
    Used by the scheduler service.
    """
    print(f"Scheduler: Updating career path for user {user_id}")
    # Logic to refresh roadmap or check progress would go here.
    # For now, just pass to avoid crashes.
    pass


from app.ai_models.chat_advisor import call_groq_chat_api

async def generate_brand_bio(keywords: str) -> str:
    """Generate a professional bio using Groq."""
    prompt = f"""You are an expert personal branding consultant. 
    Write a professional, engaging, and concise LinkedIn Summary / Bio (max 60 words) for a professional with these attributes/keywords: "{keywords}".
    
    Tone: Professional, confident, and modern.
    Return ONLY the bio text. Do not include quotes or "Here is the bio" prefixes."""
    
    messages = [{"role": "user", "content": prompt}]
    try:
        return await call_groq_chat_api(messages)
    except Exception as e:
        print(f"Error generating bio: {e}")
        return "Experienced professional passionate about technology and innovation."
