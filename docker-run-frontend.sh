#!/bin/bash

# Run GLS Frontend in Docker

echo "🐳 Building and running GLS Frontend..."

# Build the frontend image
echo "🔨 Building frontend image..."
docker build -t gls-frontend ./frontend

# Run the frontend container
echo "🚀 Starting frontend container..."
docker run -d \
    --name gls-frontend \
    --network gls-network \
    -p 3000:80 \
    -e REACT_APP_API_URL=http://localhost:8000 \
    -e REACT_APP_AUTH_ENABLED=true \
    gls-frontend

echo "✅ Frontend container started"
echo ""
echo "📋 Frontend is running at: http://localhost:3000"
echo ""
echo "🔧 Commands:"
echo "   View logs: docker logs gls-frontend"
echo "   Stop frontend: docker stop gls-frontend"
echo "   Remove frontend: docker rm gls-frontend" 