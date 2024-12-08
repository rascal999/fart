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

    def _get_raw_request(self, flow):
        """Get raw request details preserving exact format."""
        # Extract path and host
        path = flow.request.path
        if flow.request.query:
            path = path + "?" + flow.request.query
        host = flow.request.pretty_host
            
        # Start with request line
        raw_request = f"GET {path} HTTP/2\n"
        
        # Add Host header first
        raw_request += f"Host: {host}\n"
        
        # Add remaining headers in original order, excluding Host
        for header_name, header_value in flow.request.headers.fields:
            name = header_name.decode('utf-8')
            if name.lower() != 'host':  # Skip Host header as we already added it
                raw_request += f"{name}: {header_value.decode('utf-8')}\n"
        
        # Add blank line at the end
        raw_request += "\n"
            
        return raw_request

    def request(self, flow):
        """Handle request."""
        try:
            logger.debug(f"Processing request: {flow.request.method} {flow.request.url}")
            # Store complete raw request details in flow
            flow.request_details = {
                "method": flow.request.method,
                "url": flow.request.url,
                "raw_request": self._get_raw_request(flow),
                "headers": dict(flow.request.headers),
                "content": flow.request.content.decode('utf-8', 'replace') if flow.request.content else None,
                "timestamp": datetime.now().isoformat()
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
                    "raw_request": self._get_raw_request(flow),
                    "headers": dict(flow.request.headers),
                    "content": flow.request.content.decode('utf-8', 'replace') if flow.request.content else None,
                    "timestamp": datetime.now().isoformat()
                }
            
            # Load current history
            history = self._load_history()
            logger.debug(f"Loaded existing history with {len(history)} entries")
            
            # Debug response content
            logger.debug(f"Response has content: {flow.response.content is not None}")
            if flow.response.content:
                logger.debug(f"Response content length: {len(flow.response.content)} bytes")
                logger.debug(f"Response content type: {type(flow.response.content)}")
            
            # Debug content-length header
            if 'content-length' in flow.response.headers:
                logger.debug(f"Content-Length header value: {flow.response.headers['content-length']}")
            else:
                logger.debug("No Content-Length header present")
            
            # Get content length from actual response content first
            content_length = None
            if flow.response.content:
                content_length = len(flow.response.content)
                logger.debug(f"Using actual response content length: {content_length}")
            elif 'content-length' in flow.response.headers:
                try:
                    content_length = int(flow.response.headers['content-length'])
                    logger.debug(f"Using Content-Length header value: {content_length}")
                except (ValueError, TypeError) as e:
                    logger.warning(f"Invalid content-length header value: {e}")
                    content_length = None
            
            logger.debug(f"Final content_length value: {content_length}")
            
            # Create entry for the request/response pair
            entry = {
                "id": self._get_next_id(history),
                "timestamp": request_details["timestamp"],
                "method": request_details["method"],
                "url": request_details["url"],
                "status": flow.response.status_code,
                "content_length": content_length,
                "request": {
                    "method": request_details["method"],
                    "url": request_details["url"],
                    "raw_request": request_details["raw_request"],
                    "headers": request_details["headers"],
                    "content": request_details["content"]
                },
                "response": {
                    "status_code": flow.response.status_code,
                    "headers": dict(flow.response.headers),
                    "content": flow.response.content.decode('utf-8', 'replace') if flow.response.content else None
                }
            }
            
            logger.debug(f"Created new entry with ID {entry['id']} and content_length {entry['content_length']}")
            
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
