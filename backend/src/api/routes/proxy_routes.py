import json
import logging
import os
from pathlib import Path
from typing import List, Dict, Any
from fastapi import Response
from datetime import datetime

logger = logging.getLogger(__name__)

# Use absolute path for history file
current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HISTORY_FILE = Path(os.path.join(current_dir, "sessions", "history.json"))
logger.debug(f"History file path in routes: {HISTORY_FILE}")

async def get_proxy_logs() -> Response:
    """Get all proxy logs."""
    try:
        if HISTORY_FILE.exists():
            logger.debug(f"Reading history from {HISTORY_FILE}")
            with open(HISTORY_FILE, 'r') as f:
                history = json.load(f)
                # Transform history entries to match frontend expected format
                logs = []
                for entry in history:
                    # Use stored timestamp if available, otherwise use request timestamp
                    timestamp = entry.get("timestamp")
                    if not timestamp and "request" in entry and "timestamp" in entry["request"]:
                        timestamp = entry["request"]["timestamp"]
                    if not timestamp:
                        # Fallback to current time if no timestamp found
                        timestamp = datetime.now().isoformat()

                    logs.append({
                        "id": entry["id"],
                        "timestamp": timestamp,
                        "method": entry["request"]["method"],
                        "url": entry["request"]["url"],
                        "status": entry["response"]["status_code"],
                        "request_headers": entry["request"]["headers"],
                        "request_content": entry["request"]["content"],
                        "response_headers": entry["response"]["headers"],
                        "response_content": entry["response"]["content"]
                    })
                logger.debug(f"Loaded {len(logs)} entries from history")
                response_data = {"data": logs}
                logger.debug(f"Returning response: {json.dumps(response_data, indent=2)}")
                return Response(
                    content=json.dumps(response_data),
                    media_type="application/json"
                )
        logger.debug("No history file found, returning empty list")
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
        HISTORY_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(HISTORY_FILE, 'w') as f:
            json.dump([], f)
        logger.debug("Cleared proxy logs")
        return {"status": "ok", "message": "Proxy logs cleared"}
    except Exception as e:
        logger.error(f"Error clearing proxy logs: {e}", exc_info=True)
        return {"status": "error", "message": str(e)}

async def delete_proxy_log(log_id: int) -> Dict[str, str]:
    """Delete a specific proxy log entry."""
    try:
        if HISTORY_FILE.exists():
            with open(HISTORY_FILE, 'r') as f:
                logs = json.load(f)
            
            # Filter out the specified log
            logs = [log for log in logs if log.get('id') != log_id]
            
            with open(HISTORY_FILE, 'w') as f:
                json.dump(logs, f)
            
            logger.debug(f"Deleted log {log_id}")
            return {"status": "ok", "message": f"Log {log_id} deleted"}
        return {"status": "error", "message": "No logs found"}
    except Exception as e:
        logger.error(f"Error deleting proxy log: {e}", exc_info=True)
        return {"status": "error", "message": str(e)}
