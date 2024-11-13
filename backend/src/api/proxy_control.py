"""
Proxy control interface.
This module provides a simple interface to control the proxy server.
"""

import logging
from api.proxy_manager import ProxyManager

logger = logging.getLogger(__name__)

# Global proxy manager instance
_proxy_manager = ProxyManager()

def start_proxy():
    """Start the proxy server."""
    _proxy_manager.start()

def stop_proxy():
    """Stop the proxy server."""
    _proxy_manager.stop()

def restart_proxy():
    """Restart the proxy server."""
    _proxy_manager.restart()
