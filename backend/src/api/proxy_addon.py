import json
import logging
from mitmproxy import ctx
from pathlib import Path
import os
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

class ProxyAddon:
    def __init__(self):
        # Use absolute path for history file
        current_dir = os.path.dirname(os.path.abspath(__file__))
        self.history_file = Path(os.path.join(current_dir, "sessions", "history.json"))
        logger.debug(f"History file path: {self.history_file}")
        
        # Ensure sessions directory exists
        self.history_file.parent.mkdir(parents=True, exist_ok=True)
        
        # Create empty history file if it doesn't exist
        if not self.history_file.exists():
            with open(self.history_file, 'w') as f:
                json.dump([], f)
            logger.debug("Created new history file")

    def _load_history(self):
        """Load history from file."""
        try:
            if self.history_file.exists():
                with open(self.history_file, 'r') as f:
                    history = json.load(f)
                logger.debug(f"Loaded {len(history)} entries from history")
                return history
            return []
        except Exception as e:
            logger.error(f"Error loading history: {e}")
            return []

    def _save_history(self, history):
        """Save history to file."""
        try:
            with open(self.history_file, 'w') as f:
                json.dump(history, f, indent=2)
            logger.debug(f"Saved {len(history)} entries to history")
        except Exception as e:
            logger.error(f"Error saving history: {e}")

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
        except Exception as e:
            logger.error(f"Error processing request: {e}")

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
            
            # Add to history and save
            history.append(entry)
            self._save_history(history)
            
            logger.debug(f"Added entry to history: {entry['id']} - {entry['request']['method']} {entry['request']['url']}")
            
        except Exception as e:
            logger.error(f"Error processing response: {e}")

addons = [ProxyAddon()]
