#!/bin/bash

# Stop GLS Docker containers

echo "🛑 Stopping GLS Docker containers..."

# Stop containers
docker stop gls-postgres 2>/dev/null || echo "PostgreSQL container not running"
docker stop gls-redis 2>/dev/null || echo "Redis container not running"

echo "✅ Containers stopped"
echo ""
echo "📋 To start services again:"
echo "   ./docker-setup.sh"
echo ""
echo "📋 To remove containers and volumes:"
echo "   ./docker-cleanup.sh" 