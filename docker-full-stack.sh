#!/bin/bash

# Run Complete GLS Stack in Docker (no Docker Compose)

set -e

echo "🐳 Running complete GLS stack with Docker..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Create Docker network
echo "🌐 Creating Docker network..."
docker network create gls-network 2>/dev/null || echo "Network already exists"

# Create volumes
echo "💾 Creating Docker volumes..."
docker volume create gls-postgres-data 2>/dev/null || echo "PostgreSQL volume already exists"
docker volume create gls-redis-data 2>/dev/null || echo "Redis volume already exists"

# Start PostgreSQL
echo "🐘 Starting PostgreSQL..."
docker run -d \
    --name gls-postgres \
    --network gls-network \
    --volume gls-postgres-data:/var/lib/postgresql/data \
    -e POSTGRES_DB=gls \
    -e POSTGRES_USER=gls_user \
    -e POSTGRES_PASSWORD=gls_password \
    -p 5432:5432 \
    postgres:15

# Start Redis
echo "🔴 Starting Redis..."
docker run -d \
    --name gls-redis \
    --network gls-network \
    --volume gls-redis-data:/data \
    -p 6379:6379 \
    redis:7-alpine

# Wait for database services
echo "⏳ Waiting for database services..."
sleep 10

# Build and start Backend
echo "🔨 Building backend..."
docker build -t gls-backend ./backend

echo "🚀 Starting backend..."
docker run -d \
    --name gls-backend \
    --network gls-network \
    -p 8000:8000 \
    -e DATABASE_URL=postgresql://gls_user:gls_password@gls-postgres:5432/gls \
    -e REDIS_URL=redis://gls-redis:6379 \
    -e SECRET_KEY=dev-secret-key-change-in-production \
    -e JWT_ALGORITHM=HS256 \
    -e ACCESS_TOKEN_EXPIRE_MINUTES=30 \
    -e RATE_LIMIT_PER_MINUTE=60 \
    -e DEBUG=true \
    -e ENVIRONMENT=development \
    gls-backend

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
sleep 15

# Build and start Frontend
echo "🔨 Building frontend..."
docker build -t gls-frontend ./frontend

echo "🚀 Starting frontend..."
docker run -d \
    --name gls-frontend \
    --network gls-network \
    -p 3000:80 \
    -e REACT_APP_API_URL=http://localhost:8000 \
    -e REACT_APP_AUTH_ENABLED=true \
    gls-frontend

# Wait for frontend to be ready
echo "⏳ Waiting for frontend to be ready..."
sleep 10

echo ""
echo "🎉 Complete GLS stack is running!"
echo ""
echo "📋 Services:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "🔧 Management commands:"
echo "   View all containers: docker ps"
echo "   View logs: docker logs gls-frontend"
echo "   View logs: docker logs gls-backend"
echo "   View logs: docker logs gls-postgres"
echo "   View logs: docker logs gls-redis"
echo "   Stop all: ./docker-stop.sh"
echo "   Cleanup: ./docker-cleanup.sh"
echo ""
echo "📝 Note: The backend will automatically create database tables and an admin user"
echo "   on first run. You can login with:"
echo "   Username: admin"
echo "   Password: admin123" 