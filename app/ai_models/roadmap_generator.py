"""
AI Roadmap Generator using Groq Llama 3 API.
"""
import httpx
import json
from typing import Dict, List
from app.config import settings
from app.database.models import WeeklyTask, TaskItem


async def generate_career_roadmap(
    user_skills: List[str],
    target_role: str,
    missing_skills: List[Dict],
    recommended_courses: List[Dict],
    salary_data: Dict = None,
    duration: str = "12 weeks"
) -> List[WeeklyTask]:
    """
    Generate personalized career roadmap using Groq Llama 3.
    """
    # Construct detailed prompt
    prompt = build_roadmap_prompt(
        user_skills,
        target_role,
        missing_skills,
        recommended_courses,
        salary_data,
        duration
    )
    
    # Call Groq API
    try:
        response = await call_groq_api(prompt, max_tokens=2000)
        return parse_roadmap_response(response)
    
    except Exception as e:
        print(f"Groq API error: {e}")
        
        # Try DeepSeek Fallback
        if settings.DEEPSEEK_API_KEY:
            try:
                print("Attempting DeepSeek fallback...")
                response = await call_deepseek_api(prompt)
                return parse_roadmap_response(response)
            except Exception as deepseek_error:
                print(f"DeepSeek API error: {deepseek_error}")
        
        # Return fallback roadmap
        return generate_fallback_roadmap(missing_skills)


def build_roadmap_prompt(
    user_skills: List[str],
    target_role: str,
    missing_skills: List[Dict],
    recommended_courses: List[Dict],
    salary_data: Dict = None,
    duration: str = "12 weeks"
) -> str:
    """Build detailed prompt for roadmap generation."""
    
    skills_str = ", ".join(user_skills) if user_skills else "None"
    missing_skills_str = ", ".join([s.get("skill_name", "") for s in missing_skills])
    
    courses_info = []
    for course in recommended_courses[:5]:
        courses_info.append(f"- {course.get('course_name', '')}: {course.get('url', '')}")
    courses_str = "\n".join(courses_info) if courses_info else "No specific courses recommended"
    
    salary_info = ""
    if salary_data:
        avg_salary = salary_data.get("salary_insights", {}).get("average", 0)
        demand = salary_data.get("market_demand", {}).get("interpretation", "Unknown")
        salary_info = f"\nTarget Role Salary: ${avg_salary:,.0f}/year\nMarket Demand: {demand}"
    
    prompt = f"""You are an expert career advisor. Create a detailed {duration} learning roadmap for someone transitioning to a {target_role} role.

Current Skills: {skills_str}
Skills to Learn: {missing_skills_str}
Target Duration: {duration}
{salary_info}

Recommended Courses:
{courses_str}

Create a week-by-week learning plan (covering exactly {duration}) with:
1. Specific tasks to complete each week
2. Hands-on projects to build
3. Certifications to pursue (if applicable)
4. Estimated hours per week

Format your response as a JSON array with this structure:
[
  {{
    "week": 1,
    "topic": "Brief Theme of Week",
    "tasks": ["Task 1", "Task 2", ...],
    "projects": ["Project 1", ...],
    "certifications": ["Cert 1", ...],
    "estimated_hours": 10
  }},
  ...
]

Make the roadmap practical, achievable, and focused on landing a {target_role} job. Include only the JSON array in your response, no additional text."""
    
    return prompt


async def call_groq_api(prompt: str, max_tokens: int = 1500) -> str:
    """Call Groq API for text generation."""
    url = f"{settings.GROQ_API_URL}/chat/completions"
    
    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": settings.GROQ_MODEL,
        "messages": [
            {
                "role": "system",
                "content": "You are an expert career advisor and technical mentor. Provide practical, actionable advice."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        "max_tokens": max_tokens,
        "temperature": 0.7
    }
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(url, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
    
    return data["choices"][0]["message"]["content"]


async def call_deepseek_api(prompt: str) -> str:
    """Call DeepSeek API for text generation."""
    url = f"{settings.DEEPSEEK_API_URL}/chat/completions"
    
    headers = {
        "Authorization": f"Bearer {settings.DEEPSEEK_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "deepseek-chat",
        "messages": [
            {
                "role": "system",
                "content": "You are an expert career advisor and technical mentor. Provide practical, actionable advice. Output ONLY a valid JSON array as requested."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        "max_tokens": 2000,
        "temperature": 0.7
    }
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(url, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
    
    return data["choices"][0]["message"]["content"]


def parse_roadmap_response(response: str) -> List[WeeklyTask]:
    """Parse AI response into WeeklyTask objects."""
    try:
        # Extract JSON from response
        response = response.strip()
        
        # Find JSON array in response
        start_idx = response.find("[")
        end_idx = response.rfind("]") + 1
        
        if start_idx != -1 and end_idx > start_idx:
            json_str = response[start_idx:end_idx]
            roadmap_data = json.loads(json_str)
            
            weekly_tasks = []
            for week_data in roadmap_data:
                # Convert string tasks to TaskItem objects
                task_strings = week_data.get("tasks", [])
                task_items = [
                    TaskItem(description=t, completed=False) 
                    for t in task_strings
                ]
                
                task = WeeklyTask(
                    week=week_data.get("week", 0),
                    topic=week_data.get("topic", "General Focus"),
                    tasks=task_items,
                    projects=week_data.get("projects", []),
                    certifications=week_data.get("certifications", []),
                    estimated_hours=week_data.get("estimated_hours", 10)
                )
                weekly_tasks.append(task)
            
            return weekly_tasks
    
    except Exception as e:
        print(f"Error parsing roadmap response: {e}")
    
    return []


def generate_fallback_roadmap(missing_skills: List[Dict]) -> List[WeeklyTask]:
    """Generate a basic fallback roadmap if AI generation fails."""
    roadmap = []
    
    # Divide skills across 12 weeks
    skills_per_week = max(1, len(missing_skills) // 12)
    
    for week in range(1, 13):
        start_idx = (week - 1) * skills_per_week
        end_idx = start_idx + skills_per_week
        week_skills = missing_skills[start_idx:end_idx]
        
        task_descriptions = [f"Learn {skill.get('skill_name', '')}" for skill in week_skills]
        task_items = [TaskItem(description=t) for t in task_descriptions]
        
        roadmap.append(WeeklyTask(
            week=week,
            topic=f"Focus: {', '.join([s.get('skill_name','') for s in week_skills])[:30]}...",
            tasks=task_items,
            projects=[f"Build a project using {week_skills[0].get('skill_name', '')}"] if week_skills else [],
            certifications=[],
            estimated_hours=10
        ))
    
    return roadmap
