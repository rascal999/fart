import logging
import subprocess
import os
from api.config import settings

logger = logging.getLogger(__name__)

class ProxyServer:
    def __init__(self):
        self.process = None

    def start(self):
        """Start mitmproxy binary."""
        try:
            # Get the absolute path to the addon script
            current_dir = os.path.dirname(os.path.abspath(__file__))
            addon_path = os.path.join(current_dir, "proxy_addon.py")
            
            # Ensure the addon script exists
            if not os.path.exists(addon_path):
                raise FileNotFoundError(f"Addon script not found at: {addon_path}")
            
            cmd = [
                "mitmdump",
                "--listen-host", settings.proxy_host,
                "--listen-port", str(settings.proxy_port),
                "--ssl-insecure",
                "--set", "console_eventlog_verbosity=debug",
                "--set", "termlog_verbosity=debug",
                "-s", addon_path
            ]

            # Add upstream proxy configuration if enabled
            if settings.upstream_proxy_enabled and settings.upstream_proxy_host and settings.upstream_proxy_port:
                upstream_url = f"http://{settings.upstream_proxy_host}:{settings.upstream_proxy_port}"
                
                # Add authentication if enabled
                if settings.upstream_proxy_auth and settings.upstream_proxy_username and settings.upstream_proxy_password:
                    upstream_url = f"http://{settings.upstream_proxy_username}:{settings.upstream_proxy_password}@{settings.upstream_proxy_host}:{settings.upstream_proxy_port}"
                
                cmd.extend(["--mode", f"upstream:{upstream_url}"])
                logger.info(f"Configuring upstream proxy: {settings.upstream_proxy_host}:{settings.upstream_proxy_port}")
            
            logger.info(f"Starting mitmproxy: {' '.join(cmd)}")
            
            # Create log file for mitmproxy output
            log_path = os.path.join(current_dir, "sessions", "mitmproxy.log")
            os.makedirs(os.path.dirname(log_path), exist_ok=True)
            
            with open(log_path, 'w') as log_file:
                self.process = subprocess.Popen(
                    cmd,
                    stdout=log_file,
                    stderr=log_file,
                    universal_newlines=True
                )
            
            logger.info(f"Mitmproxy started with PID: {self.process.pid}")
            logger.info(f"Mitmproxy logs available at: {log_path}")
            
        except Exception as e:
            logger.error(f"Failed to start mitmproxy: {str(e)}", exc_info=True)
            raise

    def stop(self):
        """Stop mitmproxy process."""
        if self.process:
            try:
                logger.info(f"Stopping mitmproxy process (PID: {self.process.pid})")
                self.process.terminate()
                try:
                    self.process.wait(timeout=3)
                    logger.info("Mitmproxy process terminated gracefully")
                except subprocess.TimeoutExpired:
                    logger.warning("Mitmproxy process did not terminate gracefully, forcing kill")
                    self.process.kill()
                    self.process.wait()
                    logger.info("Mitmproxy process killed")
            except Exception as e:
                logger.error(f"Error stopping process: {str(e)}", exc_info=True)
            finally:
                self.process = None
