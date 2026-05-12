// Type definitions for AI Career Autopilot

export interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  headline?: string;
  location?: string;
  about?: string;
  skills?: string[];
  experience?: any[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface Resume {
  id: string;
  user_id: string;
  resume_text: string;
  extracted_skills: string[];
  recommended_roles?: string[];
  uploaded_at: string;
  updated_at: string;
}

export interface Job {
  job_id: string;
  job_title: string;
  employer_name: string;
  employer_logo?: string;
  job_employment_type: string;
  job_city?: string;
  job_state?: string;
  job_country?: string;
  job_description: string;
  job_apply_link: string;
  job_posted_at_datetime_utc?: string;
  job_salary?: string;
  required_skills: string[];
}

export interface JobSearchParams {
  query: string;
  location?: string;
  employment_type?: string;
  date_posted?: string;
  page?: number;
  num_pages?: number;
}

export interface SalaryInsight {
  role: string;
  average_salary: number;
  salary_range: {
    min: number;
    max: number;
  };
  job_count: number;
  location: string;
  currency: string;
}

export interface SkillGap {
  skill: string;
  priority: 'high' | 'medium' | 'low';
  demand_count: number;
}

export interface Task {
  id: string;
  description: string;
  completed: boolean;
}

export interface WeekPlan {
  week: number; // Changed from week_number to match backend
  topic: string; // Changed from title to match backend
  tasks: Task[]; // Changed from objectives/skills/courses to match backend basic structure
  estimated_hours: number;
}

export interface CareerRoadmap {
  id: string;
  user_id: string;
  target_role: string;
  current_skills: string[];
  roadmap: WeekPlan[]; // Changed from weekly_plan to match backend
  created_at: string; // Matches backend
  generated_at?: string; // Optional legacy
  last_updated: string;
  progress: {
    percentage: number;
  };
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  response: string;
  timestamp: string;
}

export interface ChatHistory {
  user_id: string;
  messages: ChatMessage[];
}

export interface ApiError {
  detail: string;
  status_code?: number;
}
