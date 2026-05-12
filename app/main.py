"""
FastAPI main application.
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.database import connect_to_mongo, close_mongo_connection
from app.services.scheduler_service import start_scheduler, stop_scheduler

# Import routers
from app.routes import auth, resume, jobs, salary, career, chat
from app.routes import settings as settings_router
from app.routes import applications, notifications

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan context manager for startup and shutdown events.
    """
    # Startup
    print(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    await connect_to_mongo()
    start_scheduler()
    
    # Debug: Print all registered routes
    print("--- Registered Routes ---")
    for route in app.routes:
        if hasattr(route, "path"):
            print(f"Path: {route.path} | Name: {route.name}")
    print("-------------------------")
    
    yield
    
    # Shutdown
    print("Shutting down...")
    stop_scheduler()
    await close_mongo_connection()


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-powered career guidance engine with personalized roadmaps",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Debug Middleware to log ALL requests
@app.middleware("http")
async def log_requests(request: Request, call_next):
    from datetime import datetime
    with open("request_debug.log", "a") as f:
        f.write(f"{datetime.utcnow()} - Request: {request.method} {request.url}\n")
    try:
        response = await call_next(request)
        with open("request_debug.log", "a") as f:
            f.write(f"{datetime.utcnow()} - Response: {response.status_code}\n")
        return response
    except Exception as e:
        with open("request_debug.log", "a") as f:
            f.write(f"{datetime.utcnow()} - Request Failed: {e}\n")
        raise e

# Register routers
app.include_router(auth.router)
app.include_router(resume.router)
app.include_router(jobs.router)
app.include_router(salary.router)
app.include_router(career.router)
app.include_router(chat.router)
app.include_router(applications.router)
app.include_router(notifications.router)
app.include_router(settings_router.router)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
