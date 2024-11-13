from fastapi import FastAPI, Path, Body
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
import os

from api.config import settings as app_settings
from api.proxy_control import start_proxy, stop_proxy
from api.routes import (
    get_proxy_logs,
    clear_proxy_logs,
    delete_proxy_log,
    get_settings,
    update_settings,
    export_session,
    import_session,
    send_request
)
from api.routes.settings_routes import SettingsUpdate
from api.routes.repeater_routes import RepeaterRequest

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    try:
        # Create required directories
        logger.info("Creating required directories")
        os.makedirs("api/mitmproxy", exist_ok=True)
        os.makedirs("api/sessions", exist_ok=True)
        
        logger.info("FastAPI application ready")
        logger.info("Starting proxy server...")
        start_proxy()
        
        yield
        
        # Shutdown
        logger.info("Stopping proxy server...")
        stop_proxy()
        
    except Exception as e:
        logger.error(f"Startup error: {str(e)}")
        raise

# Create FastAPI app
app = FastAPI(
    title="FART Proxy API",
    lifespan=lifespan
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=app_settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "ok"}

# Register routes
@app.get("/api/proxy/logs")
async def proxy_logs():
    return await get_proxy_logs()

@app.post("/api/proxy/clear")
async def proxy_clear():
    return await clear_proxy_logs()

@app.delete("/api/proxy/logs/{log_id}")
async def proxy_delete(log_id: int = Path(..., title="Log ID", ge=1)):
    return await delete_proxy_log(log_id)

@app.get("/api/settings")
async def get_app_settings():
    return await get_settings()

@app.post("/api/settings")
async def update_app_settings(settings: SettingsUpdate):
    return await update_settings(settings)

@app.post("/api/session/export")
async def session_export():
    return await export_session()

@app.post("/api/session/import")
async def session_import():
    return await import_session()

@app.post("/api/repeater/send")
async def repeater_send(request_data: RepeaterRequest):
    return await send_request(request_data)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        app,
        host=app_settings.api_host,
        port=app_settings.api_port,
        log_level="debug"
    )
