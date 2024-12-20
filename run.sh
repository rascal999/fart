#!/usr/bin/env bash

# Exit on error
set -e

# Function to log messages
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Function to check if a port is in use
check_port() {
    local port=$1
    if lsof -i :$port >/dev/null 2>&1; then
        log "Error: Port $port is already in use"
        return 1
    fi
    return 0
}

# Check required ports at startup
log "Checking port availability..."
required_ports=(3001 8001 8080)
for port in "${required_ports[@]}"; do
    if ! check_port $port; then
        log "Please free up port $port before running the application"
        exit 1
    fi
done

# Setup backend environment if it doesn't exist
cd backend
if [ ! -d "venv" ]; then
    log "Creating Python virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    log "Installing Python dependencies..."
    pip install -r requirements.txt
else
    source venv/bin/activate
fi

# Create required directories
log "Setting up required directories..."
cd src
mkdir -p api/mitmproxy
mkdir -p api/sessions

# Initialize mitmproxy certificates if they don't exist
if [ ! -f "api/mitmproxy/mitmproxy-ca.pem" ]; then
    log "Initializing mitmproxy certificates..."
    # Run mitmdump with minimal options to generate certs
    mitmdump --set confdir=api/mitmproxy --set ssl_insecure=true --no-server &
    MITM_PID=$!
    sleep 2
    kill $MITM_PID 2>/dev/null || true
    if [ ! -f "api/mitmproxy/mitmproxy-ca.pem" ]; then
        log "Error: Failed to generate mitmproxy certificates"
        exit 1
    fi
    log "Certificates generated successfully"
fi

# Start the backend with debug output
log "Starting backend server..."
export PYTHONPATH=$PYTHONPATH:.
export FART_API_HOST=127.0.0.1
export FART_API_PORT=8001
export FART_UI_PORT=3001
export PYTHONUNBUFFERED=1
export FART_DEBUG_LEVEL=DEBUG

# Start backend with increased verbosity
log "Starting backend with debug logging..."
python -m api.main --log-level debug 2>&1 | tee backend.log &
BACKEND_PID=$!

# Start the frontend
log "Starting frontend..."
cd ../../frontend

# Install frontend dependencies if needed
if [ ! -d "node_modules" ]; then
    log "Installing frontend dependencies..."
    npm install 2>&1 | tee npm-install.log
    log "Frontend dependencies installation completed"
fi

# Set environment variables for React build
export GENERATE_SOURCEMAP=true
export TSC_COMPILE_ON_ERROR=true
export BABEL_ENV=development
export NODE_ENV=development
# Reduce Babel logging verbosity
export DEBUG='!babel:*'

# Start frontend with filtered logging
log "Starting frontend with filtered logging..."
PORT=3001 BROWSER=none npm start 2>&1 | grep -v "babel" | tee frontend.log &
FRONTEND_PID=$!

log "Application is starting..."
log "Backend URL: http://127.0.0.1:8001"
log "Frontend URL: http://127.0.0.1:3001"
log "Log files:"
log "- Backend log: backend/src/backend.log"
log "- Frontend log: frontend/frontend.log"
log "- NPM install log: frontend/npm-install.log"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
