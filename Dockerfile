# Multi-stage build for Health Beacon Guide
# Supports both backend (Python) and frontend (Node.js)

# Stage 1: Backend setup
FROM python:3.12-slim as backend-builder

WORKDIR /app/backend

COPY backend-fastapi/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend-fastapi/ .

# Stage 2: Frontend setup
FROM node:18-alpine as frontend-builder

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ .
RUN npm run build

# Stage 3: Final runtime
FROM python:3.12-slim

WORKDIR /app

# Install Node runtime for frontend serving
RUN apt-get update && apt-get install -y \
    nodejs \
    npm \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install npm serve globally
RUN npm install -g serve

# Copy backend from builder
COPY --from=backend-builder /app/backend /app/backend-fastapi

# Copy frontend from builder
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist
COPY frontend/package*.json /app/frontend/

# Install frontend dependencies for runtime
WORKDIR /app/frontend
RUN npm ci --only=production

WORKDIR /app

# Copy startup scripts
COPY start.sh build.sh ./
RUN chmod +x start.sh build.sh

# Expose ports
EXPOSE 3000 8002

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8002/api/health || exit 1

# Start the application
CMD ["bash", "start.sh"]
