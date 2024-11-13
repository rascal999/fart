from fastapi import HTTPException
from datetime import datetime
import json
import logging
import httpx
from pydantic import BaseModel
from api.state import proxy_logs, add_to_proxy_history

# Configure logging
logger = logging.getLogger(__name__)

class RepeaterRequest(BaseModel):
    method: str
    url: str
    headers: str
    body: str
    follow_redirects: bool = False

async def send_request(request_data: RepeaterRequest):
    try:
        logger.info(f"Received request data: {request_data}")
        
        # Parse headers from raw string
        headers = {}
        if request_data.headers:
            # Skip the first line (request line) and parse remaining headers
            header_lines = request_data.headers.split('\n')[1:]
            for line in header_lines:
                line = line.strip()
                if line:  # Skip empty lines
                    try:
                        key, value = line.split(':', 1)
                        headers[key.strip()] = value.strip()
                    except ValueError:
                        logger.warning(f"Skipping invalid header line: {line}")

        # Validate URL
        if not request_data.url:
            raise HTTPException(status_code=400, detail="URL is required")

        # Create request log entry
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "method": request_data.method,
            "url": request_data.url,
            "status": "pending",  # Add default status
            "request_headers": headers,
            "request_content": request_data.body
        }
        
        # Add to proxy history and get assigned ID
        log_entry = add_to_proxy_history(log_entry)

        # Create the request
        try:
            transport = httpx.AsyncHTTPTransport(retries=0)
            
            logger.debug(f"Creating httpx client with follow_redirects={request_data.follow_redirects}")
            async with httpx.AsyncClient(
                verify=False,
                timeout=30.0,
                transport=transport,
                follow_redirects=request_data.follow_redirects
            ) as client:
                logger.debug(f"Sending request to {request_data.url}")
                response = await client.request(
                    method=request_data.method,
                    url=request_data.url,
                    headers=headers,
                    content=request_data.body
                )
                
                logger.debug(f"Response status: {response.status_code}")
                logger.debug(f"Response headers: {dict(response.headers)}")

                # Update log entry with response data
                for log in proxy_logs:
                    if log["id"] == log_entry["id"]:
                        log["status"] = response.status_code
                        log["response_headers"] = dict(response.headers)
                        log["response_content"] = response.text
                        break

                return {
                    "status": response.status_code,
                    "statusText": response.reason_phrase or str(response.status_code),
                    "headers": dict(response.headers),
                    "body": response.text
                }
        except httpx.RequestError as e:
            logger.error(f"Request error: {e}")
            # Update log with error information
            for log in proxy_logs:
                if log["id"] == log_entry["id"]:
                    log["status"] = "error"  # Use error status instead of 0
                    log["error"] = str(e)
                    break
            raise HTTPException(status_code=400, detail=f"Request failed: {str(e)}")
        except Exception as e:
            logger.error(f"Unexpected error during request: {e}")
            # Update log with error information
            for log in proxy_logs:
                if log["id"] == log_entry["id"]:
                    log["status"] = "error"  # Use error status instead of 0
                    log["error"] = str(e)
                    break
            raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in send_request: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")
