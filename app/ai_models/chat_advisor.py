"""
AI Chat Advisor using Groq Llama 3 API.
"""
import httpx
from typing import List, Dict
from app.config import settings


async def get_chat_response(
    user_message: str,
    user_context: Dict = None,
    chat_history: List[Dict] = None
) -> str:
    """
    Get AI response for career-related questions.
    
    Args:
        user_message: User's question
        user_context: User's skills, roadmap, etc.
        chat_history: Previous conversation messages
    
    Returns:
        AI assistant's response
    """
    # Build system prompt with context
    system_prompt = build_system_prompt(user_context)
    
    # Prepare messages
    messages = [{"role": "system", "content": system_prompt}]
    
    # Add chat history
    if chat_history:
        messages.extend(chat_history[-10:])  # Last 10 messages for context
    
    # Add current message
    messages.append({"role": "user", "content": user_message})
    
    # Call Groq API
    try:
        response = await call_groq_chat_api(messages)
        return response
    
    except Exception as e:
        print(f"Groq Chat API error: {e}")
        
        # Try DeepSeek Fallback
        if settings.DEEPSEEK_API_KEY:
            try:
                print("Attempting DeepSeek fallback for chat...")
                return await call_deepseek_chat_api(messages)
            except Exception as deepseek_error:
                print(f"DeepSeek Chat API error: {deepseek_error}")

        return "I apologize, but I'm having trouble processing your request right now. Please try again later."


def build_system_prompt(user_context: Dict = None) -> str:
    """Build system prompt with user context."""
    
    base_prompt = """You are an expert AI Career Advisor specializing in technology careers. 
Your role is to provide personalized career guidance, job search advice, resume tips, and skill development recommendations.

Be helpful, encouraging, and practical. Provide specific, actionable advice."""
    
    if user_context:
        skills = user_context.get("skills", [])
        target_role = user_context.get("target_role", "")
        
        if skills:
            base_prompt += f"\n\nUser's Current Skills: {', '.join(skills)}"
        
        if target_role:
            base_prompt += f"\nUser's Target Role: {target_role}"
    
    return base_prompt


async def call_groq_chat_api(messages: List[Dict]) -> str:
    """Call Groq API for chat completion."""
    url = f"{settings.GROQ_API_URL}/chat/completions"
    
    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": settings.GROQ_MODEL,
        "messages": messages,
        "max_tokens": 1000,
        "temperature": 0.8
    }
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(url, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
    
    return data["choices"][0]["message"]["content"]


async def call_deepseek_chat_api(messages: List[Dict]) -> str:
    """Call DeepSeek API for chat completion."""
    url = f"{settings.DEEPSEEK_API_URL}/chat/completions"
    
    headers = {
        "Authorization": f"Bearer {settings.DEEPSEEK_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "deepseek-chat",
        "messages": messages,
        "max_tokens": 1000,
        "temperature": 0.8
    }
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(url, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
    
    return data["choices"][0]["message"]["content"]
