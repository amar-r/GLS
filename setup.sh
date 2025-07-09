#!/bin/bash

# GLS (Go Link Service) Setup Script
# This script will set up the entire project for local development

set -e

echo "🚀 Setting up GLS (Go Link Service)..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Prerequisites check passed"

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

# Start backend services
echo "🐳 Starting backend services (PostgreSQL + Redis)..."
cd backend
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 10

# Check if services are healthy
if ! docker-compose ps | grep -q "healthy"; then
    echo "❌ Services are not healthy. Please check the logs:"
    docker-compose logs
    exit 1
fi

echo "✅ Backend services are ready"

# Setup Python environment
echo "🐍 Setting up Python environment..."
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Run database migrations
echo "🗄️ Running database migrations..."
alembic upgrade head

# Create initial admin user
echo "👤 Creating initial admin user..."
python3 -c "
from app.database import SessionLocal
from app.models import User
from app.auth import get_password_hash

db = SessionLocal()
try:
    # Check if admin user already exists
    admin = db.query(User).filter(User.username == 'admin').first()
    if not admin:
        admin_user = User(
            username='admin',
            email='admin@example.com',
            hashed_password=get_password_hash('admin123'),
            is_active=True,
            is_admin=True
        )
        db.add(admin_user)
        db.commit()
        print('✅ Admin user created: username=admin, password=admin123')
    else:
        print('ℹ️ Admin user already exists')
finally:
    db.close()
"

cd ..

# Setup frontend
echo "⚛️ Setting up frontend..."
cd frontend
npm install

echo "✅ Frontend dependencies installed"

cd ..

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Start the backend:"
echo "   cd backend"
echo "   source venv/bin/activate"
echo "   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
echo ""
echo "2. Start the frontend (in a new terminal):"
echo "   cd frontend"
echo "   npm start"
echo ""
echo "3. Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "4. Login with:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "🔧 For production deployment, see the README.md file" 