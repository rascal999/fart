#!/usr/bin/env bash

# Exit on error
set -e

# Create directory for persistent proxy history if it doesn't exist
mkdir -p sessions

# Variable to store container ID
CONTAINER_ID=""

# Function to handle Ctrl+C
cleanup() {
    echo -e "\nStopping container..."
    if [ ! -z "$CONTAINER_ID" ]; then
        docker stop $CONTAINER_ID
    fi
    exit 0
}

# Set up trap for SIGINT (Ctrl+C)
trap cleanup SIGINT

# Run the container and capture its ID
CONTAINER_ID=$(docker run -d --rm \
  -p 3001:3001 \
  -p 8001:8001 \
  -p 8080:8080 \
  -v $(pwd)/sessions:/app/backend/src/api/sessions \
  fart-proxy)

echo "Container started with ID: $CONTAINER_ID"
echo "Press Ctrl+C to stop the container"

# Follow container logs until container stops
docker logs -f $CONTAINER_ID &
LOGS_PID=$!

# Wait for container to exit
docker wait $CONTAINER_ID
kill $LOGS_PID 2>/dev/null || true
