#!/bin/bash

# Run GLS Backend in Docker

echo "🐳 Building and running GLS Backend..."

# Build the backend image
echo "🔨 Building backend image..."
docker build -t gls-backend ./backend

# Run the backend container
echo "🚀 Starting backend container..."
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

echo "✅ Backend container started"
echo ""
echo "📋 Backend is running at: http://localhost:8000"
echo "📋 API docs: http://localhost:8000/docs"
echo ""
echo "🔧 Commands:"
echo "   View logs: docker logs gls-backend"
echo "   Stop backend: docker stop gls-backend"
echo "   Remove backend: docker rm gls-backend" 