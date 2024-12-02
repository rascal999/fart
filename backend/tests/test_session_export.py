import json
import pytest
from unittest.mock import patch, mock_open
from api.routes import session_routes
from conftest import SAMPLE_LOG_ENTRY, SAMPLE_SETTINGS, assert_dict_subset

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
    mock_data = [SAMPLE_LOG_ENTRY]
    with patch("builtins.open", mock_open(read_data=json.dumps(mock_data))):
        response = await session_routes.export_session()
        assert isinstance(response, dict)
        assert len(response["logs"]) == 1
        log = response["logs"][0]
        
        # Verify top-level fields
        assert log["id"] == 1
        assert log["method"] == "GET"
        assert log["url"] == "http://example.com"
        assert log["status"] == 200
        
        # Verify request object
        assert log["request"]["method"] == "GET"
        assert log["request"]["url"] == "http://example.com"
        assert log["request"]["headers"] == {"User-Agent": "Test"}
        assert log["request"]["content"] == "test content"
        
        # Verify response object
        assert log["response"]["status_code"] == 200
        assert log["response"]["headers"] == {"Content-Type": "text/plain"}
        assert log["response"]["content"] == "response content"
        
        # Verify settings
        assert_dict_subset(SAMPLE_SETTINGS, response["settings"])

@pytest.mark.asyncio
async def test_export_session_file_error(mock_history_path, mock_settings):
    """Test handling file read errors during export"""
    mock_history_path.exists.return_value = True
    with patch("builtins.open", side_effect=Exception("Read error")):
        with pytest.raises(ValueError) as exc_info:
            await session_routes.export_session()
        assert "Failed to read history file" in str(exc_info.value)

@pytest.mark.asyncio
async def test_export_session_invalid_json(mock_history_path, mock_settings):
    """Test handling invalid JSON in history file"""
    mock_history_path.exists.return_value = True
    with patch("builtins.open", mock_open(read_data="invalid json")):
        with pytest.raises(ValueError) as exc_info:
            await session_routes.export_session()
        assert "Failed to read history file" in str(exc_info.value)
