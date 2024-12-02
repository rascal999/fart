import pytest
from api.routes.session_routes import transform_log_for_storage
from api.routes.proxy_routes import transform_log_for_display
from conftest import SAMPLE_LOG_ENTRY, SAMPLE_LOG_ENTRY_FLAT

def test_transform_log_for_storage_nested():
    """Test transforming nested structure log to storage format"""
    transformed = transform_log_for_storage(SAMPLE_LOG_ENTRY)
    
    # Verify structure
    assert "request" in transformed
    assert "response" in transformed
    
    # Verify content_length is preserved
    assert transformed["content_length"] == SAMPLE_LOG_ENTRY["content_length"]
    
    # Verify request data
    assert transformed["request"]["method"] == "GET"
    assert transformed["request"]["url"] == "http://example.com"
    assert transformed["request"]["headers"] == {"User-Agent": "Test"}
    assert transformed["request"]["content"] == "test content"
    
    # Verify response data
    assert transformed["response"]["status_code"] == 200
    assert transformed["response"]["headers"] == {"Content-Type": "text/plain"}
    assert transformed["response"]["content"] == "response content"

def test_transform_log_for_storage_flat():
    """Test transforming flat structure log to storage format"""
    transformed = transform_log_for_storage(SAMPLE_LOG_ENTRY_FLAT)
    
    # Verify structure
    assert "request" in transformed
    assert "response" in transformed
    
    # Verify content_length is preserved
    assert transformed["content_length"] == SAMPLE_LOG_ENTRY_FLAT["content_length"]
    
    # Verify request data
    assert transformed["request"]["method"] == "GET"
    assert transformed["request"]["url"] == "http://example.com"
    assert transformed["request"]["headers"] == {"User-Agent": "Test"}
    assert transformed["request"]["content"] == "test content"
    
    # Verify response data
    assert transformed["response"]["status_code"] == 200
    assert transformed["response"]["headers"] == {"Content-Type": "text/plain"}
    assert transformed["response"]["content"] == "response content"

def test_transform_log_for_display():
    """Test transforming storage format to display format"""
    storage_log = transform_log_for_storage(SAMPLE_LOG_ENTRY)
    displayed = transform_log_for_display(storage_log)
    
    # Verify top-level fields
    assert displayed["id"] == 1
    assert displayed["method"] == "GET"
    assert displayed["url"] == "http://example.com"
    assert displayed["status"] == 200
    assert displayed["content_length"] == SAMPLE_LOG_ENTRY["content_length"]
    
    # Verify request data
    assert displayed["request"]["method"] == "GET"
    assert displayed["request"]["url"] == "http://example.com"
    assert displayed["request"]["headers"] == {"User-Agent": "Test"}
    assert displayed["request"]["content"] == "test content"
    
    # Verify response data
    assert displayed["response"]["status_code"] == 200
    assert displayed["response"]["headers"] == {"Content-Type": "text/plain"}
    assert displayed["response"]["content"] == "response content"

def test_transform_log_for_storage_missing_fields():
    """Test handling missing fields in log transformation"""
    invalid_log = {
        "id": 1,
        "timestamp": "2024-03-20T10:00:00"
    }
    
    with pytest.raises(KeyError):
        transform_log_for_storage(invalid_log)

def test_transform_log_for_storage_invalid_type():
    """Test handling invalid input type in log transformation"""
    invalid_input = "not a dict"
    
    with pytest.raises(Exception):
        transform_log_for_storage(invalid_input)

def test_transform_log_roundtrip():
    """Test log transformation roundtrip (storage -> display -> storage)"""
    # Start with nested structure
    initial = SAMPLE_LOG_ENTRY
    
    # Transform to storage format
    storage = transform_log_for_storage(initial)
    
    # Transform to display format
    display = transform_log_for_display(storage)
    
    # Transform back to storage format
    final = transform_log_for_storage(display)
    
    # Verify data integrity through transformations
    assert final["content_length"] == initial["content_length"]
    assert final["request"]["method"] == initial["request"]["method"]
    assert final["request"]["url"] == initial["request"]["url"]
    assert final["request"]["headers"] == initial["request"]["headers"]
    assert final["request"]["content"] == initial["request"]["content"]
    assert final["response"]["status_code"] == initial["response"]["status_code"]
    assert final["response"]["headers"] == initial["response"]["headers"]
    assert final["response"]["content"] == initial["response"]["content"]

def test_transform_log_missing_content_length():
    """Test transforming log without content_length"""
    log_without_length = {**SAMPLE_LOG_ENTRY}
    del log_without_length["content_length"]
    
    # Should not raise error when content_length is missing
    transformed = transform_log_for_storage(log_without_length)
    assert "content_length" in transformed
    assert transformed["content_length"] is None
    
    # Display transform should preserve None content_length
    displayed = transform_log_for_display(transformed)
    assert "content_length" in displayed
    assert displayed["content_length"] is None
