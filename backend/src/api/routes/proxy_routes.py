import json
import logging
import os
from pathlib import Path
from typing import List, Dict, Any
from fastapi import Response
from datetime import datetime
from api.proxy_control import restart_proxy

logger = logging.getLogger(__name__)

# Use absolute path for history file
current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HISTORY_FILE = Path(os.path.join(current_dir, "sessions", "history.json"))
logger.debug(f"History file path: {HISTORY_FILE}")

def transform_log_for_display(entry: Dict[str, Any]) -> Dict[str, Any]:
    """Transform a log entry from storage format to display format"""
    logger.debug(f"Transforming storage entry for display: {json.dumps(entry, indent=2)}")
    transformed = {
        "id": entry["id"],
        "timestamp": entry.get("timestamp", entry.get("request", {}).get("timestamp")),
        "method": entry.get("request", {}).get("method"),
        "url": entry.get("request", {}).get("url"),
        "status": entry.get("response", {}).get("status_code"),
        "content_length": entry.get("content_length"),
        "request": {
            "method": entry.get("request", {}).get("method"),
            "url": entry.get("request", {}).get("url"),
            "headers": entry.get("request", {}).get("headers", {}),
            "content": entry.get("request", {}).get("content")
        },
        "response": {
            "status_code": entry.get("response", {}).get("status_code"),
            "headers": entry.get("response", {}).get("headers", {}),
            "content": entry.get("response", {}).get("content")
        }
    }
    logger.debug(f"Transformed entry for display: {json.dumps(transformed, indent=2)}")
    return transformed

async def get_proxy_logs() -> Response:
    """Get all proxy logs."""
    try:
        logger.debug(f"Checking for history file at: {HISTORY_FILE}")
        if HISTORY_FILE.exists():
            logger.debug("History file exists, reading contents")
            with open(HISTORY_FILE, 'r') as f:
                history = json.load(f)
                logger.debug(f"Loaded {len(history)} entries from history file")
                logger.debug(f"Raw history data: {json.dumps(history, indent=2)}")
                
                logs = [transform_log_for_display(entry) for entry in history]
                logger.debug(f"Transformed {len(logs)} entries for display")
                
                response_data = {"data": logs}
                logger.debug(f"Sending response with {len(logs)} logs")
                return Response(
                    content=json.dumps(response_data),
                    media_type="application/json"
                )
        else:
            logger.debug("History file does not exist, returning empty list")
            return Response(
                content=json.dumps({"data": []}),
                media_type="application/json"
            )
    except Exception as e:
        logger.error(f"Error reading proxy logs: {e}", exc_info=True)
        return Response(
            content=json.dumps({"data": []}),
            media_type="application/json"
        )

async def clear_proxy_logs() -> Dict[str, str]:
    """Clear all proxy logs."""
    try:
        # Clear the history file
        HISTORY_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(HISTORY_FILE, 'w') as f:
            json.dump([], f)
        
        # Restart the proxy to ensure clean state
        restart_proxy()
        
        logger.info("Cleared proxy logs and restarted proxy")
        return {"status": "ok", "message": "Proxy logs cleared"}
    except Exception as e:
        logger.error(f"Error clearing proxy logs: {e}", exc_info=True)
        return {"status": "error", "message": str(e)}

async def delete_proxy_log(log_id: int) -> Dict[str, str]:
    """Delete a specific proxy log entry."""
    try:
        if HISTORY_FILE.exists():
            # Read current history
            with open(HISTORY_FILE, 'r') as f:
                history = json.load(f)
            
            # Filter out the specified log while preserving IDs
            filtered_history = [log for log in history if log.get('id') != log_id]
            
            # Save updated history
            with open(HISTORY_FILE, 'w') as f:
                json.dump(filtered_history, f, indent=2)
            
            logger.info(f"Deleted log {log_id}")
            return {"status": "ok", "message": f"Log {log_id} deleted"}
        return {"status": "error", "message": "No logs found"}
    except Exception as e:
        logger.error(f"Error deleting proxy log: {e}", exc_info=True)
        return {"status": "error", "message": str(e)}
