import asyncio
import logging
from fastapi import Body, HTTPException
from pydantic import BaseModel
from api.config import settings
from api.proxy_control import restart_proxy

# Configure logging
logger = logging.getLogger(__name__)

class SettingsUpdate(BaseModel):
    proxy_port: int | None = None
    ui_port: int | None = None
    debug_level: str | None = None
    enable_filtering: bool | None = None
    filter_rules: list | None = None
    upstream_proxy_enabled: bool | None = None
    upstream_proxy_host: str | None = None
    upstream_proxy_port: int | None = None
    upstream_proxy_auth: bool | None = None
    upstream_proxy_username: str | None = None
    upstream_proxy_password: str | None = None

async def get_settings():
    return {
        "proxy_port": settings.proxy_port,
        "ui_port": settings.ui_port,
        "debug_level": settings.debug_level,
        "enable_filtering": False,
        "filter_rules": [],
        "upstream_proxy_enabled": settings.upstream_proxy_enabled,
        "upstream_proxy_host": settings.upstream_proxy_host,
        "upstream_proxy_port": settings.upstream_proxy_port,
        "upstream_proxy_auth": settings.upstream_proxy_auth,
        "upstream_proxy_username": settings.upstream_proxy_username,
        "upstream_proxy_password": settings.upstream_proxy_password
    }

async def update_settings(new_settings: SettingsUpdate = Body(...)):
    # Store current values before update
    old_settings = await get_settings()
    
    try:
        # Update settings
        for key, value in new_settings.dict(exclude_unset=True).items():
            if hasattr(settings, key):
                setattr(settings, key, value)
        
        # Check if we need to restart the proxy
        port_changed = new_settings.proxy_port is not None and new_settings.proxy_port != old_settings["proxy_port"]
        
        upstream_changed = (
            (new_settings.upstream_proxy_enabled is not None and new_settings.upstream_proxy_enabled != old_settings["upstream_proxy_enabled"]) or
            (new_settings.upstream_proxy_host is not None and new_settings.upstream_proxy_host != old_settings["upstream_proxy_host"]) or
            (new_settings.upstream_proxy_port is not None and new_settings.upstream_proxy_port != old_settings["upstream_proxy_port"]) or
            (new_settings.upstream_proxy_auth is not None and new_settings.upstream_proxy_auth != old_settings["upstream_proxy_auth"]) or
            (new_settings.upstream_proxy_username is not None and new_settings.upstream_proxy_username != old_settings["upstream_proxy_username"]) or
            (new_settings.upstream_proxy_password is not None and new_settings.upstream_proxy_password != old_settings["upstream_proxy_password"])
        )
        
        # Only restart if port or upstream settings changed
        if port_changed or upstream_changed:
            logger.info("Restarting proxy due to configuration changes")
            try:
                restart_proxy()
            except Exception as e:
                logger.error(f"Error restarting proxy: {e}")
                # Try to restore old settings
                for key, value in old_settings.items():
                    if hasattr(settings, key):
                        setattr(settings, key, value)
                
                # Try to restart with old settings
                try:
                    restart_proxy()
                except Exception as restore_error:
                    logger.error(f"Failed to restore proxy with old settings: {restore_error}")
                    raise HTTPException(status_code=500, detail="Failed to update proxy settings and restore failed")
                
                raise HTTPException(status_code=500, detail=str(e))
        else:
            logger.info("No proxy restart needed")
        
        return await get_settings()
        
    except Exception as e:
        logger.error(f"Error in update_settings: {e}")
        raise HTTPException(status_code=500, detail=str(e))
