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

def delete_log(log_id: int):
    """Delete a specific log entry from the proxy addon."""
    try:
        _proxy_manager.delete_log(log_id)
        logger.debug(f"Deleted log {log_id} through proxy control")
    except Exception as e:
        logger.error(f"Error deleting log through proxy control: {e}")
        raise
