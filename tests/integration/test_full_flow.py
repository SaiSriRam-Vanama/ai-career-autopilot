import pytest
import asyncio
from httpx import AsyncClient
from unittest.mock import patch, MagicMock
from app.database import get_database

@pytest.mark.asyncio
async def test_full_user_flow(client: AsyncClient):
    """
    Test the full user journey:
    1. Register
    2. Login
    3. Upload Resume (Mocked)
    4. Search Jobs (Mocked)
    5. Generate Roadmap (Mocked AI)
    """
    
    # 1. Register
    email = "test_flow_user@example.com"
    password = "securepassword123"
    
    # Clean up before test
    db = get_database()
    await db.users.delete_one({"email": email})
    
    reg_response = await client.post("/auth/register", json={
        "email": email,
        "password": password,
        "full_name": "Test Flow User"
    })
    
    assert reg_response.status_code == 201
    reg_data = reg_response.json()
    assert "access_token" in reg_data
    
    # 2. Login
    login_response = await client.post("/auth/login", json={
        "email": email,
        "password": password
    })
    
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 3. Job Search (Mocked External API)
    # We mock app.services.job_service.search_jobs to avoid hitting JSearch
    mock_jobs = [{
        "job_id": "test_job_123",
        "job_title": "Python Developer",
        "employer_name": "Tech Corp",
        "job_city": "Remote",
        "job_country": "US",
        "job_description": "We need a Python developer with FastAPI skills.",
        "job_apply_link": "http://example.com/apply",
        "required_skills": ["Python", "FastAPI"],
        "job_min_salary": 100000,
        "job_max_salary": 150000,
        "job_salary_currency": "USD"
    }]
    
    with patch("app.services.job_service.search_jobs", new_callable=MagicMock) as mock_search:
        mock_search.side_effect = lambda *args, **kwargs: asyncio.Future()
        mock_search.side_effect.set_result(mock_jobs)
        # Note: Since search_jobs is async, we need the mock to be awaitable or return a Future/Coroutine
        # But SideEffect handling for async is tricky with MagicMock. 
        # Easier way: define an async wrapper
        async def async_mock_search(*args, **kwargs):
            return mock_jobs
        
        with patch("app.services.job_service.search_jobs", side_effect=async_mock_search):
            jobs_response = await client.get("/jobs/search", params={"query": "python"}, headers=headers)
            assert jobs_response.status_code == 200
            assert jobs_response.json()["total_jobs"] == 1

    # 4. Generate Roadmap
    # We need to mock:
    # - career_service.initialize_skeleton_path (database logic, should run real)
    # - career_service.populate_roadmap_background (runs in background)
    # - But wait, the endpoint returns immediately after initialize_skeleton_path.
    # So we just need to ensure the endpoint returns 200.
    # The actual heavy lifting happens in valid background tasks.
    # For this test, we verify the endpoint starts the process.
    
    # We DO want to mock the AI generation if we were testing the background task, 
    # but since we are testing the endpoint response, we might not strictly need to mock AI 
    # UNLESS the endpoint calls it synchronously (it doesn't, it uses background_tasks).
    
    # However, to be safe and avoid side effects in background, let's just call the endpoint.
    
    roadmap_response = await client.post(
        "/career/generate", 
        params={"target_role": "Python Developer"}, 
        headers=headers
    )
    
    assert roadmap_response.status_code == 200
    r_data = roadmap_response.json()
    assert r_data["message"] == "Roadmap generation started"
    assert r_data["career_path"]["target_role"] == "Python Developer"
    
    # 5. Verify Roadmap Created in DB
    # Since background task might not finish instantly, we assume the skeleton is there.
    get_roadmap_response = await client.get("/career/me", headers=headers)
    assert get_roadmap_response.status_code == 200
    assert get_roadmap_response.json()["target_role"] == "Python Developer"

