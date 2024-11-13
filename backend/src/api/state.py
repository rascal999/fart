import logging
from typing import List, Dict, Any

# Configure logging
logger = logging.getLogger(__name__)

# Global state
proxy_master = None
proxy_loop = None
proxy_thread = None
proxy_logs: List[Dict[str, Any]] = []
next_id = 1

def add_to_proxy_history(log_entry: Dict[str, Any]) -> Dict[str, Any]:
    """Add a log entry to proxy history with next sequential ID"""
    global next_id, proxy_logs
    try:
        log_entry["id"] = next_id
        proxy_logs.append(log_entry)
        logger.debug(f"Added log entry with ID {next_id}: {log_entry}")
        next_id += 1
        return log_entry
    except Exception as e:
        logger.error(f"Error adding log entry: {e}")
        raise
