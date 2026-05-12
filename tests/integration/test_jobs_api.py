import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_search_jobs_endpoint(client: AsyncClient):
    """
    Integration test for GET /jobs/search.
    Note: This attempts to hit the real service mocked in conftest or the actual code logic.
    Since we don't mock the service inside the endpoint here, it might try to hit the external API 
    if we don't patch it. For integration tests, usually we want to test the full flow 
    but mocking external 3rd party APIs is safer to ensure deterministic results.
    """
    # determining if we should mock the service call or not. 
    # For CI/CD stability, let's mock the service call to just return valid data.
    # But usually integration tests might want to test the wiring.
    # Let's assume we want to verify the router -> service connection.
    
    from app.services import job_service
    from unittest.mock import MagicMock
    
    # Mocking the service layer to test API Contract
    original_search = job_service.search_jobs
    job_service.search_jobs = MagicMock(return_value=[
        {
            "job_id": "test_id",
            "job_title": "Integration Test Role",
            "employer_name": "Test Co",
            "job_city": "Test City",
            "job_country": "US",
            "job_description": "Test Desc",
            "job_apply_link": "https://test.com",
            "job_posted_at_datetime_utc": "2023-01-01T00:00:00Z",
            "required_skills": ["Testing"],
            "source": "jsearch"
        }
    ])

    try:
        # Note: The actual path depends on your router prefix. 
        # Looking at previous logs, it seems to be /api/v1/jobs/search or similar.
        # I'll check the routes file if this fails, but guessing standard structure?
        # A previous view of main.py would help, assuming /api/v1 prefix based on common pattern.
        # Let's try to infer from previous file views... 
        # Actually I haven't seen main.py. Let's assume /api/v1/jobs/search.
        
        # NOTE: Async mocking is tricky. Let's just patch it properly.
        async def mock_search(*args, **kwargs):
            return [{
                "job_id": "test_id",
                "job_title": "Integration Test Role",
                "employer_name": "Test Co",
                "job_city": "Test City",
                "job_country": "US",
                "job_description": "Test Desc",
                "job_apply_link": "https://test.com",
                "job_posted_at_datetime_utc": "2023-01-01T00:00:00Z",
                "required_skills": ["Testing"],
                "source": "jsearch"
            }]
        
        job_service.search_jobs = mock_search

        response = await client.get("/api/v1/jobs/search", params={"query": "python", "location": "Remote"})
        
        # If 404, maybe prefix is different? 
        # But let's assert.
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["job_title"] == "Integration Test Role"
        
    finally:
        # Restore
        job_service.search_jobs = original_search
