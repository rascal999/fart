import logging
from api.proxy_server import ProxyServer

logger = logging.getLogger(__name__)

class ProxyManager:
    def __init__(self):
        self.proxy_server = ProxyServer()

    def start(self):
        """Start mitmproxy."""
        try:
            logger.info("Starting mitmproxy")
            self.proxy_server.start()
        except Exception as e:
            logger.error(f"Failed to start mitmproxy: {str(e)}")
            raise

    def stop(self):
        """Stop mitmproxy."""
        try:
            if self.proxy_server:
                logger.info("Stopping mitmproxy")
                self.proxy_server.stop()
        except Exception as e:
            logger.error(f"Error stopping mitmproxy: {str(e)}")

    def restart(self):
        """Restart mitmproxy."""
        self.stop()
        self.start()
