# GLS Docker Setup (No Docker Compose)

This guide shows you how to run GLS using individual Docker containers without Docker Compose.

## Prerequisites

- Docker installed and running
- Git (to clone the repository)

## Quick Start

### Option 1: Complete Stack (Recommended)

Run the entire stack with one command:

```bash
./docker-full-stack.sh
```

This will:
- Create a Docker network
- Start PostgreSQL and Redis containers
- Build and start the backend container
- Build and start the frontend container
- Set up all necessary environment variables

### Option 2: Step by Step

If you prefer to run services individually:

1. **Start database services only:**
   ```bash
   ./docker-setup.sh
   ```

2. **Run backend locally (recommended for development):**
   ```bash
   cd backend
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   alembic upgrade head
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

3. **Run frontend locally:**
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Or run backend in Docker:**
   ```bash
   ./docker-run-backend.sh
   ```

5. **Or run frontend in Docker:**
   ```bash
   ./docker-run-frontend.sh
   ```

## Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## Default Login

- **Username**: `admin`
- **Password**: `admin123`

## Management Commands

### View Running Containers
```bash
docker ps
```

### View Logs
```bash
# Frontend logs
docker logs gls-frontend

# Backend logs
docker logs gls-backend

# PostgreSQL logs
docker logs gls-postgres

# Redis logs
docker logs gls-redis
```

### Stop Services
```bash
./docker-stop.sh
```

### Clean Up Everything
```bash
./docker-cleanup.sh
```

## Manual Docker Commands

If you prefer to run Docker commands manually:

### Create Network
```bash
docker network create gls-network
```

### Start PostgreSQL
```bash
docker run -d \
    --name gls-postgres \
    --network gls-network \
    --volume gls-postgres-data:/var/lib/postgresql/data \
    -e POSTGRES_DB=gls \
    -e POSTGRES_USER=gls_user \
    -e POSTGRES_PASSWORD=gls_password \
    -p 5432:5432 \
    postgres:15
```

### Start Redis
```bash
docker run -d \
    --name gls-redis \
    --network gls-network \
    --volume gls-redis-data:/data \
    -p 6379:6379 \
    redis:7-alpine
```

### Build and Run Backend
```bash
docker build -t gls-backend ./backend

docker run -d \
    --name gls-backend \
    --network gls-network \
    -p 8000:8000 \
    -e DATABASE_URL=postgresql://gls_user:gls_password@gls-postgres:5432/gls \
    -e REDIS_URL=redis://gls-redis:6379 \
    -e SECRET_KEY=dev-secret-key-change-in-production \
    gls-backend
```

### Build and Run Frontend
```bash
docker build -t gls-frontend ./frontend

docker run -d \
    --name gls-frontend \
    --network gls-network \
    -p 3000:80 \
    -e REACT_APP_API_URL=http://localhost:8000 \
    gls-frontend
```

## Environment Variables

### Backend Environment Variables
```bash
DATABASE_URL=postgresql://gls_user:gls_password@gls-postgres:5432/gls
REDIS_URL=redis://gls-redis:6379
SECRET_KEY=dev-secret-key-change-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
RATE_LIMIT_PER_MINUTE=60
DEBUG=true
ENVIRONMENT=development
```

### Frontend Environment Variables
```bash
REACT_APP_API_URL=http://localhost:8000
REACT_APP_AUTH_ENABLED=true
```

## Troubleshooting

### Container Won't Start
Check if the container name is already in use:
```bash
docker ps -a | grep gls-
```

Remove existing containers:
```bash
docker rm gls-postgres gls-redis gls-backend gls-frontend
```

### Database Connection Issues
Ensure PostgreSQL is running and accessible:
```bash
docker logs gls-postgres
```

### Network Issues
Check if the network exists:
```bash
docker network ls | grep gls-network
```

### Port Conflicts
If ports 3000, 5432, 6379, or 8000 are already in use, stop the conflicting services or modify the port mappings in the Docker run commands.

### Volume Issues
Check if volumes exist:
```bash
docker volume ls | grep gls-
```

## Development vs Production

### Development
- Use the scripts provided for easy setup
- Backend runs with hot reload
- Frontend runs with hot reload
- Database data persists in Docker volumes

### Production
- Use the Dockerfiles directly
- Set proper environment variables
- Use external database and Redis instances
- Configure proper logging and monitoring
- Set up reverse proxy (nginx) for frontend
- Use Docker Swarm or Kubernetes for orchestration

## Next Steps

1. **Customize the application** by modifying the code
2. **Add your own links** through the web interface
3. **Configure authentication** for your organization
4. **Set up monitoring** and logging
5. **Deploy to production** using your preferred cloud provider 