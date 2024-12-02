import logging
from api.proxy_server import ProxyServer
from mitmproxy import ctx

logger = logging.getLogger(__name__)

class ProxyManager:
    def __init__(self):
        self.proxy_server = ProxyServer()
        self._proxy_addon = None

    @property
    def proxy_addon(self):
        """Get the current ProxyAddon instance."""
        if not self._proxy_addon and ctx.master:
            self._proxy_addon = ctx.master.addons.get('ProxyAddon')
        return self._proxy_addon

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
                self._proxy_addon = None
        except Exception as e:
            logger.error(f"Error stopping mitmproxy: {str(e)}")

    def restart(self):
        """Restart mitmproxy."""
        self.stop()
        self.start()

    def delete_log(self, log_id: int):
        """Delete a specific log entry from the proxy addon."""
        if not self.proxy_addon:
            raise Exception("Proxy addon not available")
        self.proxy_addon.delete_log(log_id)
