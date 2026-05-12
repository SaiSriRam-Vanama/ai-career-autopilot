"""
Chat routes for AI career advisor.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from app.database.models import ChatRequest, ChatResponse
from app.services.auth_service import get_current_user
from app.services.chat_service import send_chat_message, get_chat_history


router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("/assistant", response_model=ChatResponse)
async def chat_with_advisor(
    chat_request: ChatRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Chat with AI career advisor.
    
    Ask questions about:
    - Career transitions
    - Job search strategies
    - Resume improvement
    - Skill development
    - Interview preparation
    - Salary negotiation
    
    The AI has context about your skills and career goals.
    """
    try:
        user_id = str(current_user["_id"])
        response = await send_chat_message(user_id, chat_request.message)
        
        return ChatResponse(**response)
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Chat failed: {str(e)}"
        )


@router.get("/history")
async def get_my_chat_history(current_user: dict = Depends(get_current_user)):
    """
    Get your chat history with the AI advisor.
    """
    try:
        user_id = str(current_user["_id"])
        history = await get_chat_history(user_id)
        
        return {
            "messages": [msg.dict() for msg in history],
            "total_messages": len(history)
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve chat history: {str(e)}"
        )
