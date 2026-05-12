"""
Pydantic models for data validation and MongoDB documents.
"""
from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from bson import ObjectId


class PyObjectId(str):
    """Custom ObjectId type for Pydantic v2."""
    
    @classmethod
    def __get_pydantic_core_schema__(cls, source_type, handler):
        from pydantic_core import core_schema
        return core_schema.union_schema([
            core_schema.is_instance_schema(ObjectId),
            core_schema.chain_schema([
                core_schema.str_schema(),
                core_schema.no_info_plain_validator_function(cls.validate),
            ])
        ],
        serialization=core_schema.plain_serializer_function_ser_schema(
            lambda x: str(x)
        ))
    
    @classmethod
    def validate(cls, v):
        if isinstance(v, ObjectId):
            return v
        if ObjectId.is_valid(v):
            return ObjectId(v)
        raise ValueError("Invalid ObjectId")


class UserModel(BaseModel):
    """User document model."""
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    email: EmailStr
    hashed_password: str
    full_name: Optional[str] = None
    headline: Optional[str] = None
    location: Optional[str] = None
    about: Optional[str] = None
    skills: List[str] = []
    experience: List[Dict[str, Any]] = []
    education: List[Dict[str, Any]] = []
    preferences: Dict[str, bool] = {}
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class UserCreate(BaseModel):
    """User registration schema."""
    email: EmailStr
    password: str
    full_name: Optional[str] = None


class UserLogin(BaseModel):
    """User login schema."""
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    """User profile update schema."""
    full_name: Optional[str] = None
    headline: Optional[str] = None
    location: Optional[str] = None
    about: Optional[str] = None
    skills: Optional[List[str]] = None
    experience: Optional[List[Dict[str, Any]]] = None
    education: Optional[List[Dict[str, Any]]] = None
    preferences: Optional[Dict[str, bool]] = None


class Token(BaseModel):
    """JWT token response."""
    access_token: str
    token_type: str = "bearer"
    user: Optional[Dict[str, Any]] = None


class ResumeModel(BaseModel):
    """Resume document model."""
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    user_id: str
    raw_text: str
    extracted_skills: List[str] = []
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class ResumeUpload(BaseModel):
    """Resume upload request."""
    resume_text: str


class JobDataModel(BaseModel):
    """Job listing document model."""
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    job_id: str
    title: str
    company: str
    location: Optional[str] = None
    description: str
    required_skills: List[str] = []
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    salary_currency: Optional[str] = "USD"
    source: str = "jsearch"
    fetched_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class SalaryTrendModel(BaseModel):
    """Salary trend document model."""
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    job_title: str
    location: str
    avg_salary: float
    min_salary: float
    max_salary: float
    currency: str = "USD"
    demand_score: float  # Based on job count
    job_count: int
    source: str = "adzuna"
    fetched_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class SkillGap(BaseModel):
    """Skill gap analysis result."""
    skill_name: str
    priority: str  # "high", "medium", "low"
    demand_score: float
    difficulty: str  # "beginner", "intermediate", "advanced"


class CourseRecommendation(BaseModel):
    """Course recommendation."""
    course_id: str
    course_name: str
    provider: str
    url: str
    rating: Optional[float] = None
    duration: Optional[str] = None
    skills_covered: List[str] = []


class TaskItem(BaseModel):
    """Individual task item with status."""
    id: str = Field(default_factory=lambda: str(ObjectId())) # Unique ID for ReactFlow
    description: str
    completed: bool = False


class WeeklyTask(BaseModel):
    """Weekly task in career roadmap."""
    week: int
    topic: str = "General Focus" # Added topic for better visualization node titles
    tasks: List[TaskItem]
    projects: List[str] = []
    certifications: List[str] = []
    estimated_hours: int


class CareerPathModel(BaseModel):
    """Career path/roadmap document model."""
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    user_id: str
    target_role: str
    title: str = "Career Roadmap" # For history display
    status: str = "active" # active, completed, archived
    current_skills: List[str] = []
    missing_skills: List[SkillGap] = []
    recommended_courses: List[CourseRecommendation] = []
    roadmap: List[WeeklyTask] = []
    match_percentage: float = 0.0
    salary_insights: Dict = {}
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_updated: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class ChatMessage(BaseModel):
    """Chat message."""
    role: str  # "user" or "assistant"
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ChatHistoryModel(BaseModel):
    """Chat history document model."""
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    user_id: str
    messages: List[ChatMessage] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class ChatRequest(BaseModel):
    """Chat request."""
    message: str


class ChatResponse(BaseModel):
    """Chat response."""
    response: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class NotificationModel(BaseModel):
    """User notification document model."""
    id: Optional[PyObjectId] = Field(default=None, alias="_id")
    user_id: str
    type: str  # "job", "security", "update", "system"
    title: str
    message: str
    link: Optional[str] = None
    read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
