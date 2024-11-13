from datetime import datetime
import logging
from api.state import proxy_logs, next_id
from .settings_routes import get_settings, update_settings

# Configure logging
logger = logging.getLogger(__name__)

async def export_session():
    session_data = {
        "logs": proxy_logs,
        "settings": await get_settings(),
        "timestamp": datetime.now().isoformat()
    }
    return session_data

async def import_session(session_data: dict):
    global proxy_logs, next_id
    
    if "logs" in session_data:
        proxy_logs = session_data["logs"]
        # Update next_id to be one more than the highest ID in imported logs
        if proxy_logs:
            max_id = max(int(log["id"]) for log in proxy_logs)
            next_id = max_id + 1
        else:
            next_id = 1
    
    if "settings" in session_data:
        await update_settings(session_data["settings"])
    
    return {"message": "Session imported successfully"}
