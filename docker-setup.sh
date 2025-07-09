#!/bin/bash

# GLS (Go Link Service) Docker Setup Script
# This script sets up the project using individual Docker containers

set -e

echo "🐳 Setting up GLS with Docker (no Docker Compose)..."

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

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are running
if ! docker ps | grep -q "gls-postgres"; then
    echo "❌ PostgreSQL failed to start"
    docker logs gls-postgres
    exit 1
fi

if ! docker ps | grep -q "gls-redis"; then
    echo "❌ Redis failed to start"
    docker logs gls-redis
    exit 1
fi

echo "✅ Database services are ready"

# Create .env files if they don't exist
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend .env file..."
    cat > backend/.env << EOF
DATABASE_URL=postgresql://gls_user:gls_password@localhost:5432/gls
REDIS_URL=redis://localhost:6379
SECRET_KEY=dev-secret-key-change-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
RATE_LIMIT_PER_MINUTE=60
DEBUG=true
ENVIRONMENT=development
EOF
fi

if [ ! -f "frontend/.env" ]; then
    echo "📝 Creating frontend .env file..."
    cat > frontend/.env << EOF
REACT_APP_API_URL=http://localhost:8000
REACT_APP_AUTH_ENABLED=true
EOF
fi

echo ""
echo "🎉 Docker services are ready!"
echo ""
echo "📋 Next steps:"
echo ""
echo "1. Start the backend:"
echo "   cd backend"
echo "   python3 -m venv venv"
echo "   source venv/bin/activate"
echo "   pip install -r requirements.txt"
echo "   alembic upgrade head"
echo "   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
echo ""
echo "2. Start the frontend (in a new terminal):"
echo "   cd frontend"
echo "   npm install"
echo "   npm start"
echo ""
echo "3. Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "🔧 Docker commands:"
echo "   Stop services: ./docker-stop.sh"
echo "   View logs: docker logs gls-postgres"
echo "   View logs: docker logs gls-redis"
echo "   Remove containers: ./docker-cleanup.sh" 