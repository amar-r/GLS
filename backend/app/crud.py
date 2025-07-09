from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime
from app.models import User, Link, AuditLog
from app.schemas import LinkCreate, LinkUpdate, UserCreate
from app.auth import get_password_hash


class CRUDUser:
    """CRUD operations for User model"""
    
    @staticmethod
    def get_by_username(db: Session, username: str) -> Optional[User]:
        return db.query(User).filter(User.username == username).first()
    
    @staticmethod
    def get_by_email(db: Session, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email).first()
    
    @staticmethod
    def create(db: Session, user: UserCreate) -> User:
        hashed_password = get_password_hash(user.password)
        db_user = User(
            username=user.username,
            email=user.email,
            hashed_password=hashed_password
        )
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    
    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100) -> List[User]:
        return db.query(User).offset(skip).limit(limit).all()


class CRUDLink:
    """CRUD operations for Link model"""
    
    @staticmethod
    def get_by_short_code(db: Session, short_code: str) -> Optional[Link]:
        return db.query(Link).filter(Link.short_code == short_code).first()
    
    @staticmethod
    def get_by_id(db: Session, link_id: int) -> Optional[Link]:
        return db.query(Link).filter(Link.id == link_id).first()
    
    @staticmethod
    def create(db: Session, link: LinkCreate, user_id: int) -> Link:
        db_link = Link(
            short_code=link.short_code,
            target_url=link.target_url,
            title=link.title,
            description=link.description,
            created_by=user_id
        )
        db.add(db_link)
        db.commit()
        db.refresh(db_link)
        return db_link
    
    @staticmethod
    def update(db: Session, link_id: int, link_update: LinkUpdate) -> Optional[Link]:
        db_link = db.query(Link).filter(Link.id == link_id).first()
        if not db_link:
            return None
        
        update_data = link_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_link, field, value)
        
        db_link.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_link)
        return db_link
    
    @staticmethod
    def delete(db: Session, link_id: int) -> bool:
        db_link = db.query(Link).filter(Link.id == link_id).first()
        if not db_link:
            return False
        
        db.delete(db_link)
        db.commit()
        return True
    
    @staticmethod
    def get_all(db: Session, skip: int = 0, limit: int = 100, search: Optional[str] = None) -> tuple[List[Link], int]:
        query = db.query(Link)
        
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                (Link.title.ilike(search_term)) |
                (Link.description.ilike(search_term)) |
                (Link.short_code.ilike(search_term))
            )
        
        total = query.count()
        links = query.offset(skip).limit(limit).all()
        return links, total
    
    @staticmethod
    def increment_access_count(db: Session, link_id: int) -> Optional[Link]:
        db_link = db.query(Link).filter(Link.id == link_id).first()
        if not db_link:
            return None
        
        db_link.access_count += 1
        db_link.last_accessed = datetime.utcnow()
        db.commit()
        db.refresh(db_link)
        return db_link


class CRUDAuditLog:
    """CRUD operations for AuditLog model"""
    
    @staticmethod
    def create(
        db: Session,
        user_id: int,
        action: str,
        link_id: Optional[int] = None,
        details: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> AuditLog:
        db_audit_log = AuditLog(
            user_id=user_id,
            link_id=link_id,
            action=action,
            details=details,
            ip_address=ip_address,
            user_agent=user_agent
        )
        db.add(db_audit_log)
        db.commit()
        db.refresh(db_audit_log)
        return db_audit_log
    
    @staticmethod
    def get_by_link(db: Session, link_id: int, skip: int = 0, limit: int = 100) -> List[AuditLog]:
        return db.query(AuditLog).filter(
            AuditLog.link_id == link_id
        ).order_by(AuditLog.created_at.desc()).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_by_user(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[AuditLog]:
        return db.query(AuditLog).filter(
            AuditLog.user_id == user_id
        ).order_by(AuditLog.created_at.desc()).offset(skip).limit(limit).all() 