# GLS (Go Link Service)

A production-ready internal go-links system for managing short internal URLs.

## Overview

GLS provides a simple and efficient way to create, manage, and resolve short internal URLs within your organization. The system includes a React frontend for link management and a FastAPI backend with PostgreSQL and Redis for high-performance link resolution.

## Features

- **Link Management**: Create, update, delete, and search internal links
- **Fast Resolution**: Redis-cached link lookups for sub-millisecond response times
- **Authentication**: JWT-based authentication with pluggable OAuth support
- **Audit Logging**: Track all link modifications and usage statistics
- **Rate Limiting**: API protection against abuse
- **Production Ready**: Docker deployment with AWS ECS and CloudFront

## Architecture

```mermaid
graph TD
    A[Browser] --> B[CloudFront]
    B --> C[S3 Static Frontend]
    B --> D[ALB Load Balancer]
    D --> E[FastAPI API ECS]
    E --> F[PostgreSQL RDS]
    E --> G[Redis Elasticache]
    E --> H[CloudWatch Logs]
    
    subgraph Frontend
        I[React + TypeScript]
        J[Tailwind CSS]
        K[Authentication UI]
    end
    
    subgraph Backend
        L[FastAPI]
        M[SQLAlchemy]
        N[Alembic Migrations]
        O[JWT Auth]
        P[Rate Limiting]
    end
    
    subgraph Infrastructure
        Q[Docker Compose]
        R[GitHub Actions CI/CD]
        S[AWS ECS Fargate]
    end
```

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for frontend development)
- Python 3.11+ (for backend development)

### Local Development

1. **Clone and setup**:
   ```bash
   git clone https://github.com/amar-r/GLS.git
   cd GLS
   ```

2. **Start backend services**:
   ```bash
   cd backend
   docker-compose up -d
   ```

3. **Setup backend**:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   alembic upgrade head
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

4. **Start frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## API Endpoints

- `POST /links` - Create a new link
- `GET /links/{short_code}` - Resolve a link
- `GET /links` - List/search links
- `PUT /links/{id}` - Update a link
- `DELETE /links/{id}` - Delete a link
- `GET /stats/{short_code}` - Get link usage statistics

## Environment Variables

### Backend

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/gls
REDIS_URL=redis://localhost:6379

# Security
SECRET_KEY=your-secret-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Rate Limiting
RATE_LIMIT_PER_MINUTE=60
```

### Frontend

```bash
REACT_APP_API_URL=http://localhost:8000
REACT_APP_AUTH_ENABLED=true
```

## Production Deployment

### AWS Deployment

1. **Build and push Docker images**:
   ```bash
   docker build -t gls-backend ./backend
   docker build -t gls-frontend ./frontend
   ```

2. **Deploy using AWS ECS**:
   - Backend: ECS Fargate with RDS PostgreSQL and ElastiCache Redis
   - Frontend: S3 + CloudFront for static hosting

3. **Configure environment variables** in ECS task definitions

### CI/CD Pipeline

The project includes GitHub Actions workflows for:
- Automated testing
- Docker image building
- Deployment to staging/production

## Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend
npm test
npm run test:e2e  # Cypress tests
```

## Security Considerations

- Input validation on all endpoints
- Rate limiting to prevent abuse
- JWT token expiration
- SQL injection protection via SQLAlchemy
- CORS configuration
- Environment variable secrets management

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 