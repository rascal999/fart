import json
import logging
from mitmproxy import ctx
from pathlib import Path
import os
from datetime import datetime

# Configure logging with more verbose output
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class ProxyAddon:
    def __init__(self):
        # Use absolute path for history file
        current_dir = os.path.dirname(os.path.abspath(__file__))
        self.history_file = Path(os.path.join(current_dir, "sessions", "history.json"))
        logger.debug(f"History file path: {self.history_file}")
        
        # Ensure sessions directory exists
        try:
            self.history_file.parent.mkdir(parents=True, exist_ok=True)
            logger.debug(f"Sessions directory created/verified at: {self.history_file.parent}")
            
            # Create empty history file if it doesn't exist
            if not self.history_file.exists():
                with open(self.history_file, 'w') as f:
                    json.dump([], f)
                logger.debug("Created new history file")
            
            # Verify file permissions
            logger.debug(f"History file permissions: {oct(os.stat(self.history_file).st_mode)[-3:]}")
        except Exception as e:
            logger.error(f"Error during initialization: {e}", exc_info=True)

    def _load_history(self):
        """Load history from file."""
        try:
            if self.history_file.exists():
                with open(self.history_file, 'r') as f:
                    history = json.load(f)
                logger.debug(f"Loaded {len(history)} entries from history")
                return history
            logger.warning("History file does not exist during load")
            return []
        except Exception as e:
            logger.error(f"Error loading history: {e}", exc_info=True)
            return []

    def _save_history(self, history):
        """Save history to file."""
        try:
            logger.debug(f"Attempting to save {len(history)} entries to history")
            with open(self.history_file, 'w') as f:
                json.dump(history, f, indent=2)
            logger.debug(f"Successfully saved {len(history)} entries to history")
            # Verify file was written
            if self.history_file.exists():
                size = os.path.getsize(self.history_file)
                logger.debug(f"History file size after save: {size} bytes")
        except Exception as e:
            logger.error(f"Error saving history: {e}", exc_info=True)

    def _get_next_id(self, history):
        """Get next available ID based on highest existing ID."""
        if not history:
            return 1
        return max(log.get('id', 0) for log in history) + 1

    def request(self, flow):
        """Handle request."""
        try:
            logger.debug(f"Processing request: {flow.request.method} {flow.request.url}")
            # Store request details in flow for later use
            flow.request_details = {
                "method": flow.request.method,
                "url": flow.request.url,
                "headers": dict(flow.request.headers),
                "content": flow.request.content.decode('utf-8', 'replace') if flow.request.content else None,
                "timestamp": datetime.now().isoformat()  # Store timestamp when request is made
            }
            logger.debug("Successfully stored request details in flow")
        except Exception as e:
            logger.error(f"Error processing request: {e}", exc_info=True)

    def response(self, flow):
        """Handle response."""
        try:
            logger.debug(f"Processing response for: {flow.request.method} {flow.request.url}")
            
            # Get request details stored earlier
            request_details = getattr(flow, 'request_details', {})
            if not request_details:
                logger.warning("No request details found, capturing them now")
                request_details = {
                    "method": flow.request.method,
                    "url": flow.request.url,
                    "headers": dict(flow.request.headers),
                    "content": flow.request.content.decode('utf-8', 'replace') if flow.request.content else None,
                    "timestamp": datetime.now().isoformat()  # Fallback timestamp
                }
            
            # Load current history
            history = self._load_history()
            logger.debug(f"Loaded existing history with {len(history)} entries")
            
            # Create entry for the request/response pair
            entry = {
                "id": self._get_next_id(history),
                "timestamp": request_details["timestamp"],  # Use timestamp from request
                "request": {
                    "method": request_details["method"],
                    "url": request_details["url"],
                    "headers": request_details["headers"],
                    "content": request_details["content"]
                },
                "response": {
                    "status_code": flow.response.status_code,
                    "headers": dict(flow.response.headers),
                    "content": flow.response.content.decode('utf-8', 'replace') if flow.response.content else None
                }
            }
            
            logger.debug(f"Created new entry with ID {entry['id']}")
            
            # Add to history and save
            history.append(entry)
            self._save_history(history)
            
            logger.debug(f"Successfully processed response and saved entry {entry['id']}")
            
        except Exception as e:
            logger.error(f"Error processing response: {e}", exc_info=True)

# Register the addon with mitmproxy
addons = [ProxyAddon()]

# Log when addon is loaded
logger.info("ProxyAddon loaded and registered with mitmproxy")
