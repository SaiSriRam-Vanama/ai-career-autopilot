import pytest
from app.services.job_service import search_jobs, get_job_by_id
from unittest.mock import patch, MagicMock

@pytest.mark.asyncio
async def test_search_jobs_structure():
    """
    Test that search_jobs returns the expected structure matching the frontend interface.
    We will mock the httpx response AND the database call.
    """
    mock_response = {
        "status": "OK",
        "data": [
            {
                "job_id": "123",
                "job_title": "Software Engineer",
                "employer_name": "Tech Corp",
                "job_city": "Remote",
                "job_country": "US",
                "job_description": "Python, React, SQL needed.",
                "job_apply_link": "https://example.com/apply",
                "job_posted_at_datetime_utc": "2023-01-01T12:00:00.000Z"
            }
        ]
    }

    # Mock the DB collection to avoid "Database not initialized" error
    mock_collection = MagicMock()
    # Mock update_one to be an async function (since it's awaited in service)
    async def mock_update_one(*args, **kwargs):
        return None
    mock_collection.update_one = mock_update_one

    with patch("httpx.AsyncClient.get") as mock_get, \
         patch("app.services.job_service.get_jobs_collection", return_value=mock_collection):
        
        mock_get.return_value = MagicMock(
            status_code=200,
            json=lambda: mock_response,
            raise_for_status=lambda: None
        )

        results = await search_jobs(query="Python", num_pages=1)

        assert len(results) == 1
        job = results[0]
        
        # Verify Frontend Interface Keys
        assert job["job_id"] == "123"
        assert job["job_title"] == "Software Engineer"
        assert job["employer_name"] == "Tech Corp"
        assert "Python" in job["required_skills"] # Check skill extraction
        assert job["job_apply_link"] == "https://example.com/apply"

@pytest.mark.asyncio
async def test_search_jobs_empty():
    """Test behavior when API returns no results."""
    mock_response = {"status": "OK", "data": []}
    
    # Mock the DB collection
    mock_collection = MagicMock()

    with patch("httpx.AsyncClient.get") as mock_get, \
         patch("app.services.job_service.get_jobs_collection", return_value=mock_collection):

        mock_get.return_value = MagicMock(
            status_code=200,
            json=lambda: mock_response,
            raise_for_status=lambda: None
        )

        results = await search_jobs(query="NonExistentJob123")
        assert results == []
