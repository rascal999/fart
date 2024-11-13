from pydantic_settings import BaseSettings
from typing import List, Optional
import os

class Settings(BaseSettings):
    # API Settings
    api_host: str = "0.0.0.0"
    api_port: int = 8001
    
    # Proxy Settings
    proxy_host: str = "127.0.0.1"
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
    cors_origins: List[str] = ["http://localhost:3001"]
    
    # Debug Settings
    debug_level: str = "INFO"
    
    # Security Settings
    enable_ssl: bool = False
    cert_file: str = ""
    key_file: str = ""
    
    # Storage Settings
    session_dir: str = "sessions"
    
    class Config:
        env_prefix = "FART_"
        case_sensitive = False

settings = Settings()

# Ensure sessions directory exists
os.makedirs(settings.session_dir, exist_ok=True)
