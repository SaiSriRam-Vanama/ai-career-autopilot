"""
Skill extraction from resume text using HuggingFace transformers.
"""
from typing import List, Set
import re


class SkillExtractor:
    """Extract skills from resume text using NER model."""
    
    def __init__(self):
        """Initialize the NER pipeline."""
        self.model_name = "dslim/bert-base-NER"
        self.tokenizer = None
        self.model = None
        self.ner_pipeline = None
        # Don't initialize model on import - do it lazily
    
    def _initialize_model(self):
        """Load the NER model (lazy loading)."""
        if self.ner_pipeline is not None:
            return  # Already initialized
        
        try:
            print("Skipping NER model download to avoid blocking FastAPI thread and causing timeouts")
            print("NER extraction will fall back to keyword-based extraction")
            self.ner_pipeline = None
            return
        except Exception as e:
            print(f"Error loading NER model: {e}")
            print("Continuing with keyword-based extraction only")
            self.ner_pipeline = None
    
    def extract_skills(self, resume_text: str) -> List[str]:
        """
        Extract skills from resume text.
        
        Uses a combination of:
        1. NER model to identify technical terms
        2. Keyword matching for common tech skills
        3. Pattern matching for programming languages, frameworks, tools
        """
        # Initialize model on first use (lazy loading)
        self._initialize_model()
        
        skills: Set[str] = set()
        
        # Method 1: Use NER model if available
        if self.ner_pipeline:
            try:
                entities = self.ner_pipeline(resume_text)
                for entity in entities:
                    if entity['entity_group'] in ['ORG', 'MISC']:
                        skill = entity['word'].strip()
                        if len(skill) > 2:  # Filter out very short terms
                            skills.add(skill)
            except Exception as e:
                print(f"NER extraction error: {e}")
        
        # Method 2: Keyword matching for common tech skills
        tech_keywords = [
            # Programming Languages
            'Python', 'Java', 'JavaScript', 'TypeScript', 'C++', 'C#', 'Ruby', 'Go', 'Rust',
            'PHP', 'Swift', 'Kotlin', 'Scala', 'R', 'MATLAB', 'SQL', 'HTML', 'CSS',
            
            # Frameworks & Libraries
            'React', 'Angular', 'Vue', 'Django', 'Flask', 'FastAPI', 'Spring', 'Node.js',
            'Express', 'TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn', 'Pandas', 'NumPy',
            'jQuery', 'Bootstrap', 'Tailwind', 'Next.js', 'Nest.js',
            
            # Databases
            'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Cassandra', 'DynamoDB', 'Oracle',
            'SQL Server', 'SQLite', 'Elasticsearch', 'Neo4j',
            
            # Cloud & DevOps
            'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 'GitLab CI', 'GitHub Actions',
            'Terraform', 'Ansible', 'CircleCI', 'Travis CI',
            
            # Tools & Technologies
            'Git', 'Linux', 'Bash', 'REST API', 'GraphQL', 'Microservices', 'Agile', 'Scrum',
            'JIRA', 'Confluence', 'Postman', 'Swagger', 'OAuth', 'JWT',
            
            # AI/ML
            'Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision', 'Neural Networks',
            'Data Science', 'Big Data', 'Hadoop', 'Spark', 'MLOps',
            
            # Other
            'Blockchain', 'Cybersecurity', 'Penetration Testing', 'CI/CD', 'ETL',
            'Data Warehousing', 'Business Intelligence', 'Power BI', 'Tableau'
        ]
        
        text_lower = resume_text.lower()
        for keyword in tech_keywords:
            if keyword.lower() in text_lower:
                skills.add(keyword)
        
        # Method 3: Pattern matching for version-specific skills
        patterns = [
            r'\b(React|Angular|Vue)\.js\b',
            r'\bNode\.js\b',
            r'\bNext\.js\b',
            r'\bExpress\.js\b',
            r'\bC\+\+\b',
            r'\bC#\b',
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, resume_text, re.IGNORECASE)
            skills.update(matches)
        
        # Clean and normalize skills
        cleaned_skills = []
        for skill in skills:
            skill = skill.strip()
            # Remove special characters at start/end
            skill = re.sub(r'^[^\w]+|[^\w]+$', '', skill)
            if len(skill) > 1:
                cleaned_skills.append(skill)
        
        return sorted(list(set(cleaned_skills)))


# Global instance
skill_extractor = SkillExtractor()


def extract_skills_from_resume(resume_text: str) -> List[str]:
    """Extract skills from resume text."""
    return skill_extractor.extract_skills(resume_text)
