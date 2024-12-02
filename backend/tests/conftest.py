import pytest
from fastapi.testclient import TestClient
from unittest.mock import MagicMock
from api.main import app
from api.proxy_manager import ProxyManager

@pytest.fixture
def mock_proxy_server():
    """Mock ProxyServer"""
    return MagicMock()

@pytest.fixture
def mock_proxy_addon():
    """Mock ProxyAddon"""
    return MagicMock()

@pytest.fixture
def proxy_manager(mock_proxy_server, mock_proxy_addon):
    """Create a ProxyManager with mocked dependencies"""
    manager = ProxyManager()
    manager.proxy_server = mock_proxy_server
    manager._proxy_addon = mock_proxy_addon
    return manager

@pytest.fixture
def test_client(proxy_manager):
    """Create a test client with mocked ProxyManager"""
    # Store original state
    original_state = {}
    for attr in dir(app):
        if not attr.startswith('_'):
            original_state[attr] = getattr(app, attr)
    
    # Override app state
    app.state.proxy_manager = proxy_manager
    
    client = TestClient(app)
    yield client
    
    # Restore original state
    for attr, value in original_state.items():
        setattr(app, attr, value)
