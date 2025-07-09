#!/bin/bash

# Create admin user in GLS backend

echo "👤 Creating admin user in GLS backend..."

# Execute Python code inside the backend container to create admin user
docker exec gls-backend python3 -c "
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

echo "✅ Admin user creation complete"
echo ""
echo "📋 You can now login with:"
echo "   Username: admin"
echo "   Password: admin123" 