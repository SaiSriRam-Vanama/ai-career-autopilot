"""
MongoDB async connection management using Motor.
"""
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.config import settings
from typing import Optional


class Database:
    """MongoDB database connection manager."""
    
    client: Optional[AsyncIOMotorClient] = None
    db: Optional[AsyncIOMotorDatabase] = None


db = Database()


import certifi

async def connect_to_mongo():
    """Connect to MongoDB."""
    print("Connecting to MongoDB...")
    db.client = AsyncIOMotorClient(
        settings.MONGODB_URL,
        tlsCAFile=certifi.where(),
        tlsAllowInvalidCertificates=True
    )
    db.db = db.client[settings.MONGODB_DB_NAME]
    print(f"Connected to MongoDB database: {settings.MONGODB_DB_NAME}")


async def close_mongo_connection():
    """Close MongoDB connection."""
    print("Closing MongoDB connection...")
    if db.client:
        db.client.close()
    print("MongoDB connection closed")


def get_database() -> AsyncIOMotorDatabase:
    """Get database instance."""
    if db.db is None:
        raise Exception("Database not initialized. Call connect_to_mongo() first.")
    return db.db


# Collection getters
def get_users_collection():
    """Get users collection."""
    return get_database()["users"]


def get_resumes_collection():
    """Get resumes collection."""
    return get_database()["resumes"]


def get_jobs_collection():
    """Get jobs collection."""
    return get_database()["jobs"]


def get_salary_trends_collection():
    """Get salary trends collection."""
    return get_database()["salary_trends"]


def get_career_paths_collection():
    """Get career paths collection."""
    return get_database()["career_paths"]


def get_chat_history_collection():
    """Get chat history collection."""
    return get_database()["chat_history"]
