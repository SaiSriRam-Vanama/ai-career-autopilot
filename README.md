# AI Career Autopilot

**Your AI-powered career co-pilot** — Upload your resume, discover skill gaps, get personalized 12-week learning roadmaps, track job applications, and chat with an AI career advisor — all powered by cutting-edge LLMs and real-time job market data.

**Live App:** [https://ai-career-autopilot.vercel.app](https://ai-career-autopilot.vercel.app)

---

## Features at a Glance

| Feature | What It Does |
|---------|-------------|
| **Resume Skill Extraction** | Upload PDF/DOCX/TXT — AI extracts skills via HuggingFace BERT NER + keyword matching |
| **Job Market Analysis** | Real-time job search via JSearch API with skill requirement extraction |
| **Salary Insights** | Market demand & salary stats from Adzuna API |
| **Skill Gap Analysis** | Compares your skills vs job requirements; prioritizes by demand |
| **Course Recommendations** | Personalized courses from Coursera (with curated fallback database) |
| **AI Career Roadmap** | 12-week personalized learning plan via Groq Llama 3 (DeepSeek fallback) |
| **Progress Tracking** | Track weekly task completion; archive/delete roadmaps |
| **Weekly Auto-Updates** | APScheduler cron refreshes roadmaps with latest market data |
| **AI Career Advisor Chat** | Context-aware chat powered by Groq Llama 3 |
| **Job Application Tracker** | Pipeline: wishlist -> applied -> interviewing -> offer -> rejected |
| **Notifications** | System notifications with read/unread tracking |
| **Google OAuth** | Sign in with Google |
| **Professional Bio Generation** | Generate LinkedIn-style bios from keywords |

---

## Architecture

```
+-----------------------+     HTTP/JSON + JWT     +-----------------------+
|   Frontend            | <---------------------> |   Backend             |
|   Next.js 16 / React  |     Port 8000           |   FastAPI (Python)    |
|   Port 3000           |                         |   Port 8000           |
+-----------------------+                         +-----------+-----------+
                                                                 |
                                                       +---------+---------+
                                                       |    MongoDB        |
                                                       |   (Atlas/Local)   |
                                                       +-------------------+
```

### Backend (FastAPI)

| Layer | Directory | Purpose |
|-------|-----------|---------|
| Routes | `app/routes/` | API endpoints (auth, resume, jobs, salary, career, chat, applications, notifications, settings) |
| Services | `app/services/` | Business logic layer |
| AI Models | `app/ai_models/` | HuggingFace NER, Groq Llama 3, DeepSeek integrations |
| Database | `app/database/` | MongoDB connection (Motor async) + Pydantic models |
| Utils | `app/utils/` | Helper functions |

### Frontend (Next.js)

| Directory | Purpose |
|-----------|---------|
| `frontend/app/` | Next.js App Router pages (landing, auth, dashboard) |
| `frontend/components/` | Reusable React components (auth, chat, jobs, layout, resume, roadmap, ui) |
| `frontend/contexts/` | AuthContext (JWT state), ThemeContext (dark/light) |
| `frontend/lib/api/` | Axios API client with JWT interceptor |
| `frontend/types/` | TypeScript type definitions |

### Database Collections (MongoDB)

| Collection | Purpose |
|------------|---------|
| `users` | User accounts (email, hashed_password, full_name, skills, preferences) |
| `resumes` | Resume data, extracted skills, recommended roles |
| `jobs` | Job listings from JSearch API |
| `salary_trends` | Salary data from Adzuna API with demand scoring |
| `career_paths` | AI-generated roadmaps with weekly tasks & progress |
| `chat_history` | Conversation history with AI career advisor |
| `applications` | Job application tracker |
| `notifications` | User notifications |

---

## Tech Stack

| Layer | Technology | Badge |
|-------|-----------|-------|
| **Backend** | Python 3.11+, FastAPI, Uvicorn | ![Python](https://img.shields.io/badge/Python-3.11+-blue?logo=python) ![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?logo=fastapi) |
| **Frontend** | Next.js 16, React 19, TypeScript | ![Next.js](https://img.shields.io/badge/Next.js-16-000?logo=next.js) ![React](https://img.shields.io/badge/React-19-61DAFB?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript) |
| **Database** | MongoDB (Motor + PyMongo) | ![MongoDB](https://img.shields.io/badge/MongoDB-Motor-47A248?logo=mongodb) |
| **Auth** | JWT (python-jose) + bcrypt + Google OAuth | ![JWT](https://img.shields.io/badge/Auth-JWT-000?logo=jsonwebtokens) |
| **AI/NLP** | HuggingFace Transformers, Groq API, DeepSeek | ![HuggingFace](https://img.shields.io/badge/HuggingFace-BERT_NER-FFD21E?logo=huggingface) ![Groq](https://img.shields.io/badge/Groq-Llama_3-3B82F6) |
| **UI** | Tailwind CSS v4, shadcn/ui, Framer Motion, Recharts, ReactFlow | ![Tailwind](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss) |
| **Forms** | React Hook Form + Zod | |
| **Scheduler** | APScheduler (AsyncIOScheduler) | |
| **Testing** | Pytest, Playwright, Locust | ![Pytest](https://img.shields.io/badge/Pytest-8.x-0A9EDC?logo=pytest) ![Playwright](https://img.shields.io/badge/Playwright-E2E-45BA4B?logo=playwright) |
| **CI/CD** | GitHub Actions | ![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-CI-2088FF?logo=githubactions) |
| **Containerization** | Docker + Docker Compose | ![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker) |

---

## API Endpoints

### Auth (`/auth`)

| Method | Endpoint | Auth |
|--------|----------|------|
| `POST` | `/auth/register` | No |
| `POST` | `/auth/login` | No |
| `POST` | `/auth/google` | No |
| `POST` | `/auth/profile` | Yes |
| `GET` | `/auth/me` | Yes |

### Resume (`/resume`)

| Method | Endpoint | Auth |
|--------|----------|------|
| `POST` | `/resume/upload` | Yes |
| `GET` | `/resume/me` | Yes |

### Jobs (`/jobs`)

| Method | Endpoint | Auth |
|--------|----------|------|
| `GET` | `/jobs/search` | Yes |
| `GET` | `/jobs/{job_id}` | Yes |

### Salary (`/salary`)

| Method | Endpoint | Auth |
|--------|----------|------|
| `GET` | `/salary/insights` | Yes |

### Career (`/career`)

| Method | Endpoint | Auth |
|--------|----------|------|
| `POST` | `/career/generate` | Yes |
| `GET` | `/career/me` | Yes |
| `GET` | `/career/history` | Yes |
| `POST` | `/career/generate-bio` | Yes |
| `POST` | `/career/{roadmap_id}/archive` | Yes |
| `PATCH` | `/career/task/{task_id}` | Yes |
| `DELETE` | `/career/{roadmap_id}` | Yes |

### Chat (`/chat`)

| Method | Endpoint | Auth |
|--------|----------|------|
| `POST` | `/chat/assistant` | Yes |
| `GET` | `/chat/history` | Yes |

### Applications (`/applications`)

| Method | Endpoint | Auth |
|--------|----------|------|
| `GET` | `/applications/` | Yes |
| `POST` | `/applications/` | Yes |
| `PUT` | `/applications/{app_id}/status` | Yes |
| `DELETE` | `/applications/{app_id}` | Yes |

### Notifications (`/notifications`)

| Method | Endpoint | Auth |
|--------|----------|------|
| `GET` | `/notifications/` | Yes |
| `GET` | `/notifications/unread-count` | Yes |
| `PATCH` | `/notifications/{notification_id}/read` | Yes |
| `PATCH` | `/notifications/read-all` | Yes |
| `DELETE` | `/notifications/{notification_id}` | Yes |

### Settings (`/settings`)

| Method | Endpoint | Auth |
|--------|----------|------|
| `PUT` | `/settings/profile` | Yes |
| `POST` | `/settings/password` | Yes |
| `DELETE` | `/settings/account` | Yes |

### Health

| Method | Endpoint |
|--------|----------|
| `GET` | `/` |
| `GET` | `/health` |

---

## Required Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `MONGODB_URL` | Yes | MongoDB connection string |
| `JWT_SECRET_KEY` | Yes | JWT signing secret |
| `JSEARCH_API_KEY` | Yes | RapidAPI JSearch key |
| `ADZUNA_APP_ID` | Yes | Adzuna App ID |
| `ADZUNA_APP_KEY` | Yes | Adzuna App Key |
| `GROQ_API_KEY` | Yes | Groq API key |
| `GOOGLE_CLIENT_ID` | For Google login | Google OAuth client ID |

---

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- MongoDB (local or Atlas)
- API keys (see above)

### Backend

```bash
python -m venv venv
venv\Scripts\activate       # Windows
# source venv/bin/activate  # Linux/Mac

pip install -r requirements.txt
cp .env.example .env        # Edit with your keys
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

### Docker (both services)

```bash
docker-compose up --build
```

---

## Testing

```bash
# Backend unit tests
python -m pytest tests/unit/

# Frontend e2e (Playwright)
cd frontend && npx playwright test

# Load testing
locust -f locustfile.py
```

---

## Deployment

**Yes, this project is deployable out of the box.** It includes:

- **Docker Compose** — One command to start both services
- **Dockerfiles** — Python 3.11-slim (backend) + Node multi-stage (frontend)
- **GitHub Actions CI** — Unit tests on push/PR
- **Environment config** — All secrets via `.env`

### Deployment Options

| Platform | Backend | Frontend | Database |
|----------|---------|----------|----------|
| **Render** | FastAPI (Docker) | -- | MongoDB Atlas |
| **Vercel** | -- | Next.js | MongoDB Atlas |

### Production Checklist

- [ ] Set `DEBUG=False` in `.env`
- [ ] Use production MongoDB Atlas instance
- [ ] Generate strong `JWT_SECRET_KEY`
- [ ] Configure CORS for your domain
- [ ] Set up reverse proxy (Nginx/Caddy) with SSL
- [ ] Add logging & monitoring

---

## Security

- Passwords hashed with bcrypt
- JWT tokens for stateless authentication
- CORS configurable for production domains
- All secrets managed via environment variables
- Google OAuth for optional SSO

---

## License & Copyright

**Copyright (c) 2026 SAISRIRAM VANAMA. All rights reserved.**

This project is licensed under the **MIT License** -- see the [LICENSE](LICENSE) file for details.

---

## Connect & Support

| | |
|---|---|
| **Author** | **SAISRIRAM VANAMA** |
| **Email** | [saisriram2796@gmail.com](mailto:saisriram2796@gmail.com) |
| **LinkedIn** | [linkedin.com/in/saisriramv](https://linkedin.com/in/saisriramv) |
| **GitHub** | [SaiSriRam-Vanama](https://github.com/SaiSriRam-Vanama) |

---

> **If you found this project useful, consider giving it a star on GitHub!**
>
> *Built for career growth and AI-powered guidance*
