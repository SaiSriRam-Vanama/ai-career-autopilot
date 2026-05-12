"""
Chat service for AI career advisor.
"""
from datetime import datetime
from typing import List
from app.database import get_chat_history_collection
from app.database.models import ChatMessage
from app.services.career_service import get_user_career_path
from app.services.resume_service import get_user_skills
from app.ai_models.chat_advisor import get_chat_response


async def send_chat_message(user_id: str, message: str) -> dict:
    """
    Send message to AI career advisor and get response.
    
    Args:
        user_id: User ID
        message: User's message
    
    Returns:
        AI response with timestamp
    """
    chat_collection = get_chat_history_collection()
    
    # Get user context
    user_context = await get_user_context(user_id)
    
    # Get chat history
    chat_history_doc = await chat_collection.find_one({"user_id": user_id})
    
    chat_history = []
    if chat_history_doc:
        chat_history = [
            {"role": msg["role"], "content": msg["content"]}
            for msg in chat_history_doc.get("messages", [])
        ]
    
    # Get AI response
    ai_response = await get_chat_response(message, user_context, chat_history)
    
    # Create message objects
    user_message = ChatMessage(
        role="user",
        content=message,
        timestamp=datetime.utcnow()
    )
    
    assistant_message = ChatMessage(
        role="assistant",
        content=ai_response,
        timestamp=datetime.utcnow()
    )
    
    # Update chat history
    if chat_history_doc:
        await chat_collection.update_one(
            {"user_id": user_id},
            {
                "$push": {
                    "messages": {
                        "$each": [user_message.dict(), assistant_message.dict()]
                    }
                },
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
    else:
        await chat_collection.insert_one({
            "user_id": user_id,
            "messages": [user_message.dict(), assistant_message.dict()],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        })
    
    return {
        "response": ai_response,
        "timestamp": assistant_message.timestamp
    }


async def get_user_context(user_id: str) -> dict:
    """Get user context for chat."""
    context = {}
    
    # Get user skills
    skills = await get_user_skills(user_id)
    if skills:
        context["skills"] = skills
    
    # Get career path
    career_path = await get_user_career_path(user_id)
    if career_path:
        context["target_role"] = career_path.get("target_role")
        context["match_percentage"] = career_path.get("match_percentage")
    
    return context


async def get_chat_history(user_id: str) -> List[ChatMessage]:
    """Get user's chat history."""
    chat_collection = get_chat_history_collection()
    chat_history_doc = await chat_collection.find_one({"user_id": user_id})
    
    if chat_history_doc:
        return [ChatMessage(**msg) for msg in chat_history_doc.get("messages", [])]
    
    return []
