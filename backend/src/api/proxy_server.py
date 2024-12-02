import logging
import subprocess
import os
from pathlib import Path
from api.config import settings

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

class ProxyServer:
    def __init__(self):
        self.process = None
        # Get the absolute path to the current directory
        self.current_dir = os.path.dirname(os.path.abspath(__file__))
        # Define sessions directory
        self.sessions_dir = os.path.join(self.current_dir, "sessions")
        # Define paths
        self.addon_path = os.path.join(self.current_dir, "proxy_addon.py")
        self.log_path = os.path.join(self.sessions_dir, "mitmproxy.log")
        self.history_path = os.path.join(self.sessions_dir, "history.json")

    def _initialize_directories(self):
        """Initialize required directories and files."""
        try:
            # Create sessions directory with proper permissions
            os.makedirs(self.sessions_dir, mode=0o755, exist_ok=True)
            logger.debug(f"Sessions directory initialized at: {self.sessions_dir}")
            
            # Create empty history.json if it doesn't exist
            if not os.path.exists(self.history_path):
                with open(self.history_path, 'w') as f:
                    f.write('[]')
                logger.debug(f"Created empty history file at: {self.history_path}")
            
            # Set proper permissions on history file
            os.chmod(self.history_path, 0o644)
            logger.debug(f"Set permissions on history file: {oct(os.stat(self.history_path).st_mode)[-3:]}")
            
            # Verify files and permissions
            logger.debug(f"Sessions dir exists: {os.path.exists(self.sessions_dir)}")
            logger.debug(f"Sessions dir permissions: {oct(os.stat(self.sessions_dir).st_mode)[-3:]}")
            logger.debug(f"History file exists: {os.path.exists(self.history_path)}")
            logger.debug(f"History file permissions: {oct(os.stat(self.history_path).st_mode)[-3:]}")
            
        except Exception as e:
            logger.error(f"Error initializing directories: {str(e)}", exc_info=True)
            raise

    def start(self):
        """Start mitmproxy binary."""
        try:
            # Initialize directories and files
            self._initialize_directories()
            
            # Ensure the addon script exists
            if not os.path.exists(self.addon_path):
                raise FileNotFoundError(f"Addon script not found at: {self.addon_path}")
            
            cmd = [
                "mitmdump",
                "--listen-host", settings.proxy_host,
                "--listen-port", str(settings.proxy_port),
                "--ssl-insecure",
                "--set", "console_eventlog_verbosity=debug",
                "--set", "termlog_verbosity=debug",
                "--set", "flow_detail=3",  # Increase flow detail for better debugging
                "-s", self.addon_path
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
            
            # Open log file with line buffering
            log_file = open(self.log_path, 'w', buffering=1)
            
            self.process = subprocess.Popen(
                cmd,
                stdout=log_file,
                stderr=log_file,
                universal_newlines=True
            )
            
            logger.info(f"Mitmproxy started with PID: {self.process.pid}")
            logger.info(f"Mitmproxy logs available at: {self.log_path}")
            
            # Verify process is running
            if self.process.poll() is None:
                logger.info("Mitmproxy process is running")
            else:
                logger.error(f"Mitmproxy process failed to start. Exit code: {self.process.poll()}")
                raise Exception("Failed to start mitmproxy process")
            
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
