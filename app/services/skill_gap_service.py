"""
Skill gap analysis service.
"""
from typing import List, Dict
from app.database.models import SkillGap


async def analyze_skill_gap(
    user_skills: List[str],
    job_skills: List[str],
    salary_data: Dict = None
) -> List[SkillGap]:
    """
    Analyze skill gap between user skills and job requirements.
    
    Args:
        user_skills: List of user's current skills
        job_skills: List of skills required for target job
        salary_data: Optional salary/demand data for prioritization
    
    Returns:
        List of missing skills with priority and difficulty
    """
    # Normalize skills for comparison
    user_skills_lower = [skill.lower() for skill in user_skills]
    job_skills_lower = [skill.lower() for skill in job_skills]
    
    # Find missing skills
    missing_skills = []
    for skill in job_skills:
        if skill.lower() not in user_skills_lower:
            missing_skills.append(skill)
    
    # Prioritize and categorize missing skills
    skill_gaps = []
    for skill in missing_skills:
        # Determine priority based on demand
        demand_score = salary_data.get("market_demand", {}).get("score", 5.0) if salary_data else 5.0
        priority = get_skill_priority(skill, demand_score)
        
        # Determine difficulty
        difficulty = get_skill_difficulty(skill)
        
        skill_gaps.append(SkillGap(
            skill_name=skill,
            priority=priority,
            demand_score=demand_score,
            difficulty=difficulty
        ))
    
    # Sort by priority (high -> medium -> low)
    priority_order = {"high": 0, "medium": 1, "low": 2}
    skill_gaps.sort(key=lambda x: priority_order[x.priority])
    
    return skill_gaps


def get_skill_priority(skill: str, demand_score: float) -> str:
    """
    Determine skill priority based on demand and skill type.
    
    High priority: Core technical skills with high demand
    Medium priority: Supporting skills or moderate demand
    Low priority: Nice-to-have skills or low demand
    """
    skill_lower = skill.lower()
    
    # High priority skills
    high_priority_keywords = [
        'python', 'java', 'javascript', 'typescript', 'react', 'node.js',
        'aws', 'azure', 'docker', 'kubernetes', 'sql', 'mongodb',
        'machine learning', 'deep learning', 'data science', 'ai'
    ]
    
    # Medium priority skills
    medium_priority_keywords = [
        'git', 'agile', 'scrum', 'rest api', 'graphql', 'ci/cd',
        'flask', 'django', 'spring', 'angular', 'vue'
    ]
    
    # Check skill type
    for keyword in high_priority_keywords:
        if keyword in skill_lower:
            return "high" if demand_score >= 5 else "medium"
    
    for keyword in medium_priority_keywords:
        if keyword in skill_lower:
            return "medium"
    
    # Default based on demand score
    if demand_score >= 7:
        return "high"
    elif demand_score >= 4:
        return "medium"
    else:
        return "low"


def get_skill_difficulty(skill: str) -> str:
    """
    Estimate learning difficulty for a skill.
    
    Beginner: Tools, frameworks, basic concepts
    Intermediate: Programming languages, databases
    Advanced: ML/AI, system design, architecture
    """
    skill_lower = skill.lower()
    
    # Advanced skills
    advanced_keywords = [
        'machine learning', 'deep learning', 'ai', 'neural networks',
        'kubernetes', 'microservices', 'system design', 'architecture',
        'blockchain', 'cybersecurity', 'data engineering'
    ]
    
    # Beginner skills
    beginner_keywords = [
        'git', 'html', 'css', 'agile', 'scrum', 'jira',
        'postman', 'swagger', 'bash'
    ]
    
    for keyword in advanced_keywords:
        if keyword in skill_lower:
            return "advanced"
    
    for keyword in beginner_keywords:
        if keyword in skill_lower:
            return "beginner"
    
    # Default to intermediate
    return "intermediate"


def calculate_skill_match_percentage(user_skills: List[str], job_skills: List[str]) -> float:
    """Calculate percentage of job skills that user has."""
    if not job_skills:
        return 100.0
    
    user_skills_lower = set(skill.lower() for skill in user_skills)
    job_skills_lower = [skill.lower() for skill in job_skills]
    
    matched_skills = sum(1 for skill in job_skills_lower if skill in user_skills_lower)
    
    return round((matched_skills / len(job_skills)) * 100, 2)
