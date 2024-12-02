from datetime import datetime
import json
import logging
import os
from pathlib import Path
from fastapi import Body
from api.state import proxy_logs, next_id
from .settings_routes import get_settings, update_settings, SettingsUpdate
from .proxy_routes import HISTORY_FILE, transform_log_for_display

# Configure logging
logger = logging.getLogger(__name__)

def transform_log_for_storage(log):
    """Transform a log entry to the storage format"""
    logger.debug(f"Transforming log entry: {json.dumps(log, indent=2)}")
    
    # Handle both nested and flat structures
    if "request" in log and "response" in log:
        # Already in nested format
        transformed = {
            "id": log["id"],
            "timestamp": log["timestamp"],
            "content_length": log.get("content_length"),  # Preserve content_length
            "request": {
                "method": log["request"]["method"],
                "url": log["request"]["url"],
                "headers": log["request"]["headers"],
                "content": log["request"]["content"],
                "timestamp": log["timestamp"]
            },
            "response": {
                "status_code": log["response"]["status_code"],
                "headers": log["response"]["headers"],
                "content": log["response"]["content"]
            }
        }
    else:
        # Convert from flat format
        transformed = {
            "id": log["id"],
            "timestamp": log["timestamp"],
            "content_length": log.get("content_length"),  # Preserve content_length
            "request": {
                "method": log["method"],
                "url": log["url"],
                "headers": log["request_headers"],
                "content": log["request_content"],
                "timestamp": log["timestamp"]
            },
            "response": {
                "status_code": log["status"],
                "headers": log["response_headers"],
                "content": log["response_content"]
            }
        }
    
    logger.debug(f"Transformed log entry: {json.dumps(transformed, indent=2)}")
    return transformed

async def export_session():
    logger.debug("Starting session export")
    
    # Read logs from history file
    logs = []
    if HISTORY_FILE.exists():
        try:
            logger.debug(f"Reading history from {HISTORY_FILE}")
            with open(HISTORY_FILE, 'r') as f:
                history = json.load(f)
                logger.debug(f"Loaded {len(history)} entries from history file")
                # Transform logs to frontend format
                logs = [transform_log_for_display(entry) for entry in history]
                logger.debug(f"Transformed {len(logs)} entries for export")
        except Exception as e:
            logger.error(f"Error reading history file: {str(e)}")
            raise ValueError(f"Failed to read history file: {str(e)}")
    
    session_data = {
        "logs": logs,
        "settings": await get_settings(),
        "timestamp": datetime.now().isoformat()
    }
    logger.debug(f"Exporting session data with {len(logs)} logs")
    return session_data

async def import_session(data: dict):
    global proxy_logs, next_id
    
    try:
        logger.debug(f"Starting session import with data type: {type(data)}")
        logger.debug(f"Session data keys: {data.keys() if isinstance(data, dict) else 'Not a dict'}")
        logger.debug(f"Full session data: {json.dumps(data, indent=2)}")
        
        if not isinstance(data, dict):
            logger.error(f"Invalid data type received: {type(data)}")
            raise ValueError("Invalid session data format: expected dictionary")
            
        if "logs" in data:
            logger.debug(f"Found logs array with {len(data['logs'])} entries")
            imported_logs = data["logs"]
            logger.debug(f"Imported logs: {json.dumps(imported_logs, indent=2)}")
            
            # Transform logs to storage format
            storage_logs = []
            for log in imported_logs:
                try:
                    logger.debug(f"Processing log: {json.dumps(log, indent=2)}")
                    transformed_log = transform_log_for_storage(log)
                    storage_logs.append(transformed_log)
                except Exception as e:
                    logger.error(f"Error transforming log: {str(e)}")
                    logger.error(f"Problematic log entry: {json.dumps(log, indent=2)}")
                    raise ValueError(f"Failed to transform log: {str(e)}")
            
            logger.debug(f"Transformed {len(storage_logs)} logs to storage format")
            
            # Update in-memory state
            proxy_logs.clear()
            proxy_logs.extend(storage_logs)
            logger.debug(f"Updated in-memory proxy_logs with {len(proxy_logs)} entries")
            
            # Ensure the sessions directory exists
            HISTORY_FILE.parent.mkdir(parents=True, exist_ok=True)
            
            # Write logs to history file
            try:
                # First verify we can write by creating a JSON string
                json_data = json.dumps(storage_logs, indent=2)
                
                # Then write to file
                with open(HISTORY_FILE, 'w') as f:
                    f.write(json_data)
                logger.debug(f"Wrote {len(storage_logs)} logs to history file: {HISTORY_FILE}")
                
                # Verify the write by reading back
                with open(HISTORY_FILE, 'r') as f:
                    saved_data = f.read()
                    saved_logs = json.loads(saved_data)
                    logger.debug(f"Verified {len(saved_logs)} logs in history file")
            except Exception as e:
                logger.error(f"Error writing to history file: {str(e)}")
                logger.error(f"History file path: {HISTORY_FILE}")
                raise ValueError(f"Failed to write logs to history file: {str(e)}")
            
            # Update next_id to be one more than the highest ID in imported logs
            if storage_logs:
                logger.debug("Processing logs to update next_id")
                try:
                    max_id = max(int(log["id"]) for log in storage_logs)
                    next_id = max_id + 1
                    logger.debug(f"Updated next_id to {next_id}")
                except (KeyError, ValueError) as e:
                    logger.error(f"Error processing log IDs: {str(e)}")
                    raise ValueError(f"Invalid log format: {str(e)}")
            else:
                logger.debug("No logs found, setting next_id to 1")
                next_id = 1
        else:
            logger.debug("No logs key found in session data")
        
        if "settings" in data:
            logger.debug("Found settings in session data")
            try:
                settings_data = data["settings"]
                logger.debug(f"Settings data: {json.dumps(settings_data, indent=2)}")
                # Convert dictionary to SettingsUpdate model
                settings_update = SettingsUpdate(**settings_data)
                logger.debug(f"Created SettingsUpdate model: {settings_update}")
                await update_settings(settings_update)
                logger.debug("Settings updated successfully")
            except Exception as e:
                logger.error(f"Error updating settings: {str(e)}")
                raise ValueError(f"Failed to update settings: {str(e)}")
        else:
            logger.debug("No settings key found in session data")
        
        logger.debug("Session import completed successfully")
        return {"message": "Session imported successfully"}
    except Exception as e:
        logger.error(f"Error importing session: {str(e)}")
        raise ValueError(f"Failed to import session: {str(e)}")
