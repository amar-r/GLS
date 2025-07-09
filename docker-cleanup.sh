#!/bin/bash

# Clean up GLS Docker containers and volumes

echo "🧹 Cleaning up GLS Docker containers and volumes..."

# Stop and remove containers
docker stop gls-postgres 2>/dev/null || echo "PostgreSQL container not running"
docker stop gls-redis 2>/dev/null || echo "Redis container not running"

docker rm gls-postgres 2>/dev/null || echo "PostgreSQL container not found"
docker rm gls-redis 2>/dev/null || echo "Redis container not found"

# Remove volumes (WARNING: This will delete all data!)
read -p "⚠️  Do you want to remove volumes? This will delete all data! (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    docker volume rm gls-postgres-data 2>/dev/null || echo "PostgreSQL volume not found"
    docker volume rm gls-redis-data 2>/dev/null || echo "Redis volume not found"
    echo "🗑️  Volumes removed"
else
    echo "💾 Volumes preserved"
fi

# Remove network
docker network rm gls-network 2>/dev/null || echo "Network not found"

echo "✅ Cleanup complete"
echo ""
echo "📋 To start fresh:"
echo "   ./docker-setup.sh" 