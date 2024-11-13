import socket
import time
import logging
from contextlib import contextmanager

logger = logging.getLogger(__name__)

@contextmanager
def socket_timeout(seconds):
    """Context manager for socket operations with timeout."""
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(seconds)
    try:
        yield sock
    finally:
        sock.close()

def is_port_in_use(port: int, host: str = "127.0.0.1") -> bool:
    """Check if a port is in use."""
    try:
        # Try to bind to the port
        with socket_timeout(1) as s:
            s.bind((host, port))
            return False
    except socket.error as e:
        logger.debug(f"Socket error checking port {port}: {str(e)}")
        return True
    except Exception as e:
        logger.error(f"Error checking port {port}: {str(e)}")
        return True

def wait_for_port_release(port: int, timeout: int = 10):
    """Wait for a port to be released."""
    logger.info(f"Waiting for port {port} to be released...")
    start_time = time.time()
    last_log_time = 0
    
    while is_port_in_use(port):
        elapsed = time.time() - start_time
        current_time = int(elapsed)
        
        # Log every 2 seconds
        if current_time > last_log_time and current_time % 2 == 0:
            logger.info(f"Port {port} still in use after {elapsed:.1f} seconds")
            last_log_time = current_time
            
        if elapsed > timeout:
            logger.error(f"Timeout waiting for port {port} to be released after {elapsed:.1f} seconds")
            raise TimeoutError(f"Port {port} did not become available within {timeout} seconds")
            
        time.sleep(0.1)  # Short sleep to prevent CPU spinning
    
    # Verify port is actually free
    time.sleep(0.5)  # Wait a bit to ensure port is fully released
    if is_port_in_use(port):
        logger.error(f"Port {port} is still in use after appearing to be released")
        raise RuntimeError(f"Port {port} is still in use after appearing to be released")
        
    logger.info(f"Port {port} is now available")

def wait_for_port_bind(port: int, timeout: int = 10):
    """Wait for a port to be bound."""
    logger.info(f"Waiting for port {port} to be bound...")
    start_time = time.time()
    last_log_time = 0
    
    while not is_port_in_use(port):
        elapsed = time.time() - start_time
        current_time = int(elapsed)
        
        # Log every 2 seconds
        if current_time > last_log_time and current_time % 2 == 0:
            logger.info(f"Port {port} still not bound after {elapsed:.1f} seconds")
            last_log_time = current_time
            
        if elapsed > timeout:
            logger.error(f"Timeout waiting for port {port} to be bound after {elapsed:.1f} seconds")
            raise TimeoutError(f"Port {port} was not bound within {timeout} seconds")
            
        time.sleep(0.1)  # Short sleep to prevent CPU spinning
    
    # Verify port is actually bound
    time.sleep(0.5)  # Wait a bit to ensure port is fully bound
    if not is_port_in_use(port):
        logger.error(f"Port {port} appears unbound after being bound")
        raise RuntimeError(f"Port {port} appears unbound after being bound")
        
    logger.info(f"Port {port} is now bound")
