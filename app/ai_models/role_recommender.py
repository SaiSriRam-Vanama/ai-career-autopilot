"""
AI Role Recommender using Groq API.
"""
import httpx
import json
from typing import List
from app.config import settings

async def recommend_roles(skills: List[str]) -> List[str]:
    """
    Recommend job roles based on extracted skills using LLM.
    """
    if not skills:
        return []

    skills_str = ", ".join(skills)
    
    prompt = f"""Based on the following technical skills, recommend the top 3 most suitable job roles (e.g., Senior Python Developer, Data Scientist, DevOps Engineer).

Skills: {skills_str}

Return ONLY a JSON array of strings. Do not include any other text.
Example: ["Role 1", "Role 2", "Role 3"]"""

    url = f"{settings.GROQ_API_URL}/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": settings.GROQ_MODEL,
        "messages": [
            {"role": "system", "content": "You are a tech recruiter."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.3,
        "max_tokens": 100
    }
    
    try:
        print(f"DEBUG: Recommendation Prompt: {prompt}")
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, headers=headers, json=payload)
            print(f"DEBUG: Groq API Status: {response.status_code}")
            
            if response.status_code != 200:
                print(f"Groq API Error: {response.text}")
                return fallback_role_recommendation(skills)
            
            content = response.json().get("choices", [{}])[0].get("message", {}).get("content", "")
            print(f"DEBUG: Recommendation Content: {content}")
            
            # Clean up content to ensure valid JSON
            content = content.replace("```json", "").replace("```", "").strip()
            
            start = content.find("[")
            end = content.rfind("]") + 1
            if start != -1 and end != -1:
                roles = json.loads(content[start:end])
                print(f"DEBUG: Parsed Roles: {roles}")
                return roles
                
            print("DEBUG: Could not parse JSON array from response")
            return fallback_role_recommendation(skills)

    except Exception as e:
        print(f"Role recommendation error: {e}")
        import traceback
        traceback.print_exc()
        return fallback_role_recommendation(skills)

def fallback_role_recommendation(skills: List[str]) -> List[str]:
    """Simple keyword based fallback."""
    roles = []
    skills_lower = [s.lower() for s in skills]
    
    if "python" in skills_lower and ("django" in skills_lower or "flask" in skills_lower):
        roles.append("Python Backend Developer")
    if "react" in skills_lower or "angular" in skills_lower or "vue" in skills_lower:
        roles.append("Frontend Developer")
    if "machine learning" in skills_lower or "pytorch" in skills_lower or "tensorflow" in skills_lower:
        roles.append("ML Engineer")
    if "sql" in skills_lower and "statistics" in skills_lower:
        roles.append("Data Analyst")
    if "aws" in skills_lower or "docker" in skills_lower:
        roles.append("DevOps Engineer")
        
    if not roles:
        roles.append("Software Developer")
        
    return list(set(roles[:3]))
