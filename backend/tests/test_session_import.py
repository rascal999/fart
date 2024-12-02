import json
import pytest
from unittest.mock import patch, mock_open, MagicMock
from datetime import datetime
from io import StringIO
from api.routes import session_routes
from conftest import (
    SAMPLE_LOG_ENTRY,
    SAMPLE_LOG_ENTRY_FLAT,
    SAMPLE_SETTINGS
)

class MockFileContext:
    def __init__(self, read_data=None):
        self.read_data = read_data
        self.written_data = StringIO()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        return False

    def read(self):
        return self.read_data if self.read_data else "[]"

    def write(self, data):
        self.written_data.write(data)
        return len(data)

@pytest.mark.asyncio
async def test_import_session_valid_data_nested(mock_history_path, mock_settings):
    """Test importing valid session data with nested structure"""
    import_data = {
        "logs": [SAMPLE_LOG_ENTRY],
        "settings": SAMPLE_SETTINGS,
        "timestamp": datetime.now().isoformat()
    }
    
    mock_context = MockFileContext(json.dumps([SAMPLE_LOG_ENTRY]))
    mock_file = MagicMock(return_value=mock_context)
    
    with patch("builtins.open", mock_file), \
         patch("api.state.proxy_logs", []):
        response = await session_routes.import_session(import_data)
        assert response == {"message": "Session imported successfully"}
        
        # Verify file operations
        mock_history_path.parent.mkdir.assert_called_once()
        
        # Verify written data structure
        written_data = json.loads(mock_context.written_data.getvalue())
        assert len(written_data) == 1
        log = written_data[0]
        assert log["request"]["method"] == "GET"
        assert log["response"]["status_code"] == 200

@pytest.mark.asyncio
async def test_import_session_valid_data_flat(mock_history_path, mock_settings):
    """Test importing valid session data with flat structure"""
    import_data = {
        "logs": [SAMPLE_LOG_ENTRY_FLAT],
        "settings": SAMPLE_SETTINGS,
        "timestamp": datetime.now().isoformat()
    }
    
    mock_context = MockFileContext(json.dumps([SAMPLE_LOG_ENTRY_FLAT]))
    mock_file = MagicMock(return_value=mock_context)
    
    with patch("builtins.open", mock_file), \
         patch("api.state.proxy_logs", []):
        response = await session_routes.import_session(import_data)
        assert response == {"message": "Session imported successfully"}
        
        # Verify file operations
        mock_history_path.parent.mkdir.assert_called_once()
        
        # Verify written data structure is transformed to nested
        written_data = json.loads(mock_context.written_data.getvalue())
        assert len(written_data) == 1
        log = written_data[0]
        assert log["request"]["method"] == "GET"
        assert log["response"]["status_code"] == 200

@pytest.mark.asyncio
async def test_import_session_invalid_data():
    """Test importing invalid session data"""
    invalid_data = "not a dict"
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
        "settings": SAMPLE_SETTINGS,
        "timestamp": datetime.now().isoformat()
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
    
    def mock_file_error(*args, **kwargs):
        raise Exception("Write error")
    
    with patch("builtins.open", side_effect=mock_file_error):
        with pytest.raises(ValueError) as exc_info:
            await session_routes.import_session(import_data)
        assert "Failed to write logs to history file" in str(exc_info.value)

@pytest.mark.asyncio
async def test_import_session_settings_error(mock_history_path):
    """Test handling settings update errors during import"""
    import_data = {
        "logs": [SAMPLE_LOG_ENTRY],
        "settings": {"invalid": "settings"},
        "timestamp": datetime.now().isoformat()
    }
    
    mock_context = MockFileContext(json.dumps([SAMPLE_LOG_ENTRY]))
    mock_file = MagicMock(return_value=mock_context)
    
    with patch("builtins.open", mock_file), \
         patch("api.state.proxy_logs", []), \
         patch("api.routes.session_routes.update_settings", side_effect=Exception("Settings error")):
        with pytest.raises(ValueError) as exc_info:
            await session_routes.import_session(import_data)
        assert "Failed to update settings" in str(exc_info.value)
