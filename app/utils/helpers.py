"""Utility helper functions."""
from datetime import datetime
from typing import List
import re


def normalize_skill(skill: str) -> str:
    """Normalize skill name for comparison."""
    return skill.lower().strip()


def skills_match(skill1: str, skill2: str) -> bool:
    """Check if two skills match (case-insensitive)."""
    return normalize_skill(skill1) == normalize_skill(skill2)


def format_timestamp(dt: datetime) -> str:
    """Format datetime for display."""
    return dt.strftime("%Y-%m-%d %H:%M:%S UTC")


def clean_text(text: str) -> str:
    """Clean and normalize text."""
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)
    # Remove special characters
    text = re.sub(r'[^\w\s.,!?-]', '', text)
    return text.strip()


def calculate_percentage(part: float, total: float) -> float:
    """Calculate percentage."""
    if total == 0:
        return 0.0
    return round((part / total) * 100, 2)


def deduplicate_list(items: List[str]) -> List[str]:
    """Remove duplicates while preserving order."""
    seen = set()
    result = []
    for item in items:
        normalized = normalize_skill(item)
        if normalized not in seen:
            seen.add(normalized)
            result.append(item)
    return result
