"""
Weekly autopilot scheduler using APScheduler.
"""
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from datetime import datetime
from app.config import settings
from app.database import get_career_paths_collection
from app.services.career_service import update_career_path


# Global scheduler instance
scheduler = AsyncIOScheduler()


async def weekly_update_task():
    """
    Weekly task to update all users' career roadmaps.
    
    This runs every Monday at 9 AM UTC and:
    1. Fetches latest job market data
    2. Recalculates skill gaps
    3. Updates course recommendations
    4. Regenerates AI roadmaps
    """
    print(f"[{datetime.utcnow()}] Starting weekly career roadmap updates...")
    
    try:
        career_paths_collection = get_career_paths_collection()
        
        # Get all users with career paths
        cursor = career_paths_collection.find({})
        users_updated = 0
        users_failed = 0
        
        async for career_path in cursor:
            user_id = career_path.get("user_id")
            
            try:
                print(f"Updating career path for user: {user_id}")
                await update_career_path(user_id)
                users_updated += 1
                print(f"✓ Updated career path for user: {user_id}")
            
            except Exception as e:
                users_failed += 1
                print(f"✗ Failed to update career path for user {user_id}: {e}")
        
        print(f"[{datetime.utcnow()}] Weekly update completed. Updated: {users_updated}, Failed: {users_failed}")
    
    except Exception as e:
        print(f"[{datetime.utcnow()}] Weekly update task failed: {e}")


def start_scheduler():
    """Start the APScheduler."""
    if not settings.SCHEDULER_ENABLED:
        print("Scheduler is disabled in settings")
        return
    
    print("Starting APScheduler...")
    
    # Add weekly update job
    scheduler.add_job(
        weekly_update_task,
        trigger=CronTrigger.from_crontab(settings.WEEKLY_UPDATE_CRON),
        id="weekly_career_update",
        name="Weekly Career Roadmap Update",
        replace_existing=True
    )
    
    scheduler.start()
    print(f"Scheduler started. Weekly updates scheduled: {settings.WEEKLY_UPDATE_CRON}")


def stop_scheduler():
    """Stop the APScheduler."""
    if scheduler.running:
        scheduler.shutdown()
        print("Scheduler stopped")
