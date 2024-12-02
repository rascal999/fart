from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from typing import List, Optional
import os
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

class Settings(BaseSettings):
    # API Settings
    api_host: str = "0.0.0.0"
    api_port: int = 8001
    
    # Proxy Settings
    proxy_host: str = "0.0.0.0"  # Changed from 127.0.0.1 to allow external connections
    proxy_port: int = 8080
    
    # Upstream Proxy Settings
    upstream_proxy_enabled: bool = False
    upstream_proxy_host: Optional[str] = None
    upstream_proxy_port: Optional[int] = None
    upstream_proxy_auth: bool = False
    upstream_proxy_username: Optional[str] = None
    upstream_proxy_password: Optional[str] = None
    
    # UI Settings
    ui_port: int = 3001
    # Add all possible frontend URLs for Docker and local development
    cors_origins: List[str] = [
        "http://localhost:3001",
        "http://127.0.0.1:3001",
        "http://0.0.0.0:3001",
        # Add Docker host
        "http://host.docker.internal:3001"
    ]
    
    # Debug Settings
    debug_level: str = "DEBUG"  # Changed to DEBUG for more verbose logging
    
    # Security Settings
    enable_ssl: bool = False
    cert_file: str = ""
    key_file: str = ""
    
    # Storage Settings
    session_dir: str = "sessions"
    
    # Use ConfigDict instead of class Config
    model_config = ConfigDict(
        env_prefix="FART_",
        case_sensitive=False
    )

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Log the configuration on initialization
        logger.debug("Initializing settings:")
        logger.debug(f"API Host: {self.api_host}")
        logger.debug(f"API Port: {self.api_port}")
        logger.debug(f"Proxy Host: {self.proxy_host}")
        logger.debug(f"Proxy Port: {self.proxy_port}")
        logger.debug(f"Debug Level: {self.debug_level}")
        logger.debug(f"Session Directory: {self.session_dir}")
        logger.debug(f"CORS Origins: {self.cors_origins}")

settings = Settings()

# Ensure sessions directory exists with proper permissions
try:
    os.makedirs(settings.session_dir, mode=0o755, exist_ok=True)
    logger.debug(f"Created/verified sessions directory at: {settings.session_dir}")
    logger.debug(f"Sessions directory permissions: {oct(os.stat(settings.session_dir).st_mode)[-3:]}")
except Exception as e:
    logger.error(f"Error creating sessions directory: {e}", exc_info=True)
    raise
