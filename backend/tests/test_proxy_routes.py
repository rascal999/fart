import json
import pytest
from unittest.mock import patch, mock_open, MagicMock
from api.routes import proxy_routes

# Sample test data
SAMPLE_LOG_ENTRY = {
    "id": 1,
    "request": {
        "timestamp": "2024-03-20T10:00:00",
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

@pytest.fixture
def mock_history_path():
    """Mock the history file path"""
    with patch('api.routes.proxy_routes.HISTORY_FILE') as mock_path:
        mock_path.exists = MagicMock(return_value=True)
        mock_path.parent.mkdir = MagicMock()
        yield mock_path

@pytest.mark.asyncio
async def test_get_proxy_logs_empty(mock_history_path):
    """Test getting proxy logs when file doesn't exist"""
    mock_history_path.exists.return_value = False
    
    response = await proxy_routes.get_proxy_logs()
    assert response.media_type == "application/json"
    data = json.loads(response.body)
    assert data == {"data": []}

@pytest.mark.asyncio
async def test_get_proxy_logs_with_data(mock_history_path):
    """Test getting proxy logs with existing data"""
    mock_data = [SAMPLE_LOG_ENTRY]
    with patch("builtins.open", mock_open(read_data=json.dumps(mock_data))):
        response = await proxy_routes.get_proxy_logs()
        assert response.media_type == "application/json"
        data = json.loads(response.body)["data"]
        assert len(data) == 1
        log = data[0]
        
        # Verify top-level fields
        assert log["id"] == 1
        assert log["method"] == "GET"
        assert log["url"] == "http://example.com"
        assert log["status"] == 200
        
        # Verify nested request object
        assert log["request"]["method"] == "GET"
        assert log["request"]["url"] == "http://example.com"
        assert log["request"]["headers"] == {"User-Agent": "Test"}
        assert log["request"]["content"] == "test content"
        
        # Verify nested response object
        assert log["response"]["status_code"] == 200
        assert log["response"]["headers"] == {"Content-Type": "text/plain"}
        assert log["response"]["content"] == "response content"

@pytest.mark.asyncio
async def test_clear_proxy_logs(mock_history_path):
    """Test clearing proxy logs"""
    with patch("builtins.open", mock_open()) as mock_file, \
         patch("api.routes.proxy_routes.restart_proxy") as mock_restart:
        response = await proxy_routes.clear_proxy_logs()
        assert response == {"status": "ok", "message": "Proxy logs cleared"}
        
        # Verify file operations
        mock_history_path.parent.mkdir.assert_called_once()
        mock_file().write.assert_called_once_with("[]")
        # Verify proxy restart was called
        mock_restart.assert_called_once()

@pytest.mark.asyncio
async def test_delete_proxy_log(mock_history_path):
    """Test deleting a specific proxy log"""
    mock_data = [SAMPLE_LOG_ENTRY]
    with patch("builtins.open", mock_open(read_data=json.dumps(mock_data))) as mock_file:
        response = await proxy_routes.delete_proxy_log(1)
        assert response == {"status": "ok", "message": "Log 1 deleted"}
        
        # Verify file operations
        write_call = mock_file().write.call_args[0][0]
        written_data = json.loads(write_call)
        assert len(written_data) == 0

@pytest.mark.asyncio
async def test_delete_nonexistent_log(mock_history_path):
    """Test deleting a log that doesn't exist"""
    mock_data = [SAMPLE_LOG_ENTRY]
    with patch("builtins.open", mock_open(read_data=json.dumps(mock_data))) as mock_file:
        response = await proxy_routes.delete_proxy_log(999)
        assert response == {"status": "ok", "message": "Log 999 deleted"}

@pytest.mark.asyncio
async def test_error_handling(mock_history_path):
    """Test error handling when operations fail"""
    # Test get logs error
    mock_history_path.exists.side_effect = Exception("Test error")
    response = await proxy_routes.get_proxy_logs()
    assert response.media_type == "application/json"
    assert json.loads(response.body) == {"data": []}

    # Test clear logs error
    mock_history_path.parent.mkdir.side_effect = Exception("Test error")
    response = await proxy_routes.clear_proxy_logs()
    assert response == {"status": "error", "message": "Test error"}

    # Test delete log error
    mock_history_path.exists.side_effect = Exception("Test error")
    response = await proxy_routes.delete_proxy_log(1)
    assert response == {"status": "error", "message": "Test error"}
