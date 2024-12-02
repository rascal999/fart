import json
import pytest
from unittest.mock import patch, mock_open, MagicMock
from datetime import datetime
from api.routes import session_routes
from api.routes.session_routes import transform_log_for_storage

# Sample test data
SAMPLE_LOG_ENTRY = {
    "id": 1,
    "timestamp": "2024-03-20T10:00:00",
    "method": "GET",
    "url": "http://example.com",
    "status": 200,
    "request_headers": {"User-Agent": "Test"},
    "request_content": "test content",
    "response_headers": {"Content-Type": "text/plain"},
    "response_content": "response content"
}

SAMPLE_SETTINGS = {
    "proxy_port": 8080,
    "ui_port": 3001,
    "debug_level": "DEBUG",
    "enable_filtering": False,  # Updated to match default
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

@pytest.mark.asyncio
async def test_export_session_empty(mock_history_path, mock_settings):
    """Test exporting session with no logs"""
    mock_history_path.exists.return_value = False
    
    response = await session_routes.export_session()
    assert isinstance(response, dict)
    assert "logs" in response
    assert len(response["logs"]) == 0
    assert_dict_subset(SAMPLE_SETTINGS, response["settings"])
    assert isinstance(response["timestamp"], str)

@pytest.mark.asyncio
async def test_export_session_with_data(mock_history_path, mock_settings):
    """Test exporting session with existing logs"""
    storage_log = transform_log_for_storage(SAMPLE_LOG_ENTRY)
    mock_data = [storage_log]
    with patch("builtins.open", mock_open(read_data=json.dumps(mock_data))):
        response = await session_routes.export_session()
        assert isinstance(response, dict)
        assert len(response["logs"]) == 1
        log = response["logs"][0]
        assert log["id"] == 1
        assert log["method"] == "GET"
        assert log["url"] == "http://example.com"
        assert_dict_subset(SAMPLE_SETTINGS, response["settings"])

@pytest.mark.asyncio
async def test_import_session_valid_data(mock_history_path, mock_settings):
    """Test importing valid session data"""
    import_data = {
        "logs": [SAMPLE_LOG_ENTRY],
        "settings": SAMPLE_SETTINGS,
        "timestamp": datetime.now().isoformat()
    }
    
    # Create two separate mock_open instances
    write_mock = mock_open()
    read_mock = mock_open(read_data=json.dumps([transform_log_for_storage(SAMPLE_LOG_ENTRY)]))
    
    # Chain them together
    write_mock.return_value.__enter__.return_value.write = MagicMock()
    write_mock.return_value.__enter__.return_value.read = read_mock.return_value.__enter__.return_value.read
    
    with patch("builtins.open", write_mock), \
         patch("api.state.proxy_logs", []):
        response = await session_routes.import_session(import_data)
        assert response == {"message": "Session imported successfully"}
        
        # Verify file operations
        mock_history_path.parent.mkdir.assert_called_once()
        write_mock.return_value.__enter__.return_value.write.assert_called()

@pytest.mark.asyncio
async def test_import_session_invalid_data():
    """Test importing invalid session data"""
    invalid_data = "not a dict"  # Use non-dict data to trigger type error
    with pytest.raises(ValueError) as exc_info:
        await session_routes.import_session(invalid_data)
    assert "Invalid session data format" in str(exc_info.value)

@pytest.mark.asyncio
async def test_import_session_invalid_log_format(mock_history_path):
    """Test importing session with invalid log format"""
    invalid_log = {
        "logs": [{
            "id": 1,
            "timestamp": "2024-03-20T10:00:00",
            # Missing required fields
        }],
        "settings": SAMPLE_SETTINGS
    }
    
    with pytest.raises(ValueError) as exc_info:
        await session_routes.import_session(invalid_log)
    assert "Failed to transform log" in str(exc_info.value)

@pytest.mark.asyncio
async def test_import_session_file_error(mock_history_path):
    """Test handling file write errors during import"""
    import_data = {
        "logs": [SAMPLE_LOG_ENTRY],
        "settings": SAMPLE_SETTINGS,
        "timestamp": datetime.now().isoformat()
    }
    
    with patch("builtins.open", side_effect=Exception("Write error")):
        with pytest.raises(ValueError) as exc_info:
            await session_routes.import_session(import_data)
        assert "Failed to write logs to history file" in str(exc_info.value)
