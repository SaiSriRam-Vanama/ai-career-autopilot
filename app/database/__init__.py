"""Database package."""
from app.database.connection import (
    connect_to_mongo,
    close_mongo_connection,
    get_database,
    get_users_collection,
    get_resumes_collection,
    get_jobs_collection,
    get_salary_trends_collection,
    get_career_paths_collection,
    get_chat_history_collection,
)

__all__ = [
    "connect_to_mongo",
    "close_mongo_connection",
    "get_database",
    "get_users_collection",
    "get_resumes_collection",
    "get_jobs_collection",
    "get_salary_trends_collection",
    "get_career_paths_collection",
    "get_chat_history_collection",
]
