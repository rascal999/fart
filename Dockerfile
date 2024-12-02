# Build stage for frontend
FROM node:18-alpine as frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Final stage
FROM python:3.12-slim
WORKDIR /app

# Install system dependencies and serve package
RUN apt-get update && apt-get install -y --no-install-recommends \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/* \
    && npm install -g serve@14.2.4

# Copy frontend build
COPY --from=frontend-builder /app/frontend/build /app/frontend/build

# Install backend dependencies
COPY backend/requirements.txt /app/backend/
RUN python -m venv /app/backend/venv && \
    . /app/backend/venv/bin/activate && \
    pip install --no-cache-dir -r /app/backend/requirements.txt

# Copy backend code
COPY backend/src /app/backend/src

# Create and set permissions for required directories
RUN mkdir -p /app/backend/src/api/mitmproxy && \
    mkdir -p /app/backend/src/api/sessions && \
    chmod 755 /app/backend/src/api/mitmproxy && \
    chmod 755 /app/backend/src/api/sessions

# Set environment variables
ENV PYTHONPATH=/app/backend/src
ENV FART_API_HOST=0.0.0.0
ENV FART_API_PORT=8001
ENV FART_UI_PORT=3001
ENV FART_PROXY_HOST=0.0.0.0

# Create a startup script
RUN echo '#!/bin/bash\n\
# Start the frontend\n\
serve -s /app/frontend/build -l 3001 &\n\
\n\
# Start the backend\n\
cd /app/backend/src/api && \
source ../../venv/bin/activate && \
python main.py\n' > /app/start.sh && \
chmod +x /app/start.sh

# Expose ports for frontend, backend API, and proxy
EXPOSE 3001 8001 8080

# Note: To persist proxy history between container restarts, mount a volume to /app/backend/src/api/sessions
# Example: docker run -v ./sessions:/app/backend/src/api/sessions ...

# Run the application
CMD ["/app/start.sh"]
