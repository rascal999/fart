import pytest
from unittest.mock import patch, MagicMock
from datetime import datetime

# Sample test data with nested structure
SAMPLE_LOG_ENTRY = {
    "id": 1,
    "timestamp": "2024-03-20T10:00:00",
    "method": "GET",
    "url": "http://example.com",
    "status": 200,
    "content_length": 1024,  # Added content_length
    "request": {
        "method": "GET",
        "url": "http://example.com",
        "headers": {"User-Agent": "Test"},
        "content": "test content"
    },
    "response": {
        "status_code": 200,
        "headers": {"Content-Type": "text/plain"},
        "content": "response content"
    }
}

# Sample test data with flat structure (for backward compatibility)
SAMPLE_LOG_ENTRY_FLAT = {
    "id": 1,
    "timestamp": "2024-03-20T10:00:00",
    "method": "GET",
    "url": "http://example.com",
    "status": 200,
    "content_length": 1024,  # Added content_length
    "request_headers": {"User-Agent": "Test"},
    "request_content": "test content",
    "response_headers": {"Content-Type": "text/plain"},
    "response_content": "response content"
}

SAMPLE_SETTINGS = {
    "proxy_port": 8080,
    "ui_port": 3001,
    "debug_level": "DEBUG",
    "enable_filtering": False,
    "filter_rules": [],
    "upstream_proxy_enabled": False,
    "upstream_proxy_host": None,
    "upstream_proxy_port": None,
    "upstream_proxy_auth": False,
    "upstream_proxy_username": None,
    "upstream_proxy_password": None
}

@pytest.fixture
def mock_history_path():
    """Mock the history file path"""
    with patch('api.routes.session_routes.HISTORY_FILE') as mock_path:
        mock_path.exists = MagicMock(return_value=True)
        mock_path.parent.mkdir = MagicMock()
        yield mock_path

@pytest.fixture
async def mock_settings():
    """Mock settings functions"""
    async def mock_get_settings():
        return SAMPLE_SETTINGS.copy()
    
    async def mock_update_settings(settings):
        return {"message": "Settings updated"}
    
    with patch('api.routes.session_routes.get_settings', mock_get_settings), \
         patch('api.routes.session_routes.update_settings', mock_update_settings):
        yield {
            "get": mock_get_settings,
            "update": mock_update_settings
        }

def assert_dict_subset(subset, superset):
    """Assert that all keys in subset exist in superset with same values"""
    for key, value in subset.items():
        assert key in superset
        if isinstance(value, dict):
            assert_dict_subset(value, superset[key])
        else:
            assert superset[key] == value
