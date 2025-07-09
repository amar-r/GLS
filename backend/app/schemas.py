from pydantic import BaseModel, HttpUrl, validator
from typing import Optional, List
from datetime import datetime


class UserBase(BaseModel):
    username: str
    email: str


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: int
    is_active: bool
    is_admin: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    username: str
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


class LinkBase(BaseModel):
    short_code: str
    target_url: str
    title: str
    description: Optional[str] = None
    
    @validator('short_code')
    def validate_short_code(cls, v):
        if not v.isalnum():
            raise ValueError('Short code must be alphanumeric')
        if len(v) < 3 or len(v) > 20:
            raise ValueError('Short code must be between 3 and 20 characters')
        return v.lower()
    
    @validator('target_url')
    def validate_target_url(cls, v):
        if not v.startswith(('http://', 'https://')):
            raise ValueError('Target URL must start with http:// or https://')
        return v


class LinkCreate(LinkBase):
    pass


class LinkUpdate(BaseModel):
    target_url: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class Link(LinkBase):
    id: int
    is_active: bool
    created_by: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    last_accessed: Optional[datetime] = None
    access_count: int
    owner: User
    
    class Config:
        from_attributes = True


class LinkStats(BaseModel):
    short_code: str
    access_count: int
    last_accessed: Optional[datetime] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class AuditLogBase(BaseModel):
    action: str
    details: Optional[str] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None


class AuditLog(AuditLogBase):
    id: int
    user_id: int
    link_id: Optional[int] = None
    created_at: datetime
    user: User
    link: Optional[Link] = None
    
    class Config:
        from_attributes = True


class LinkList(BaseModel):
    links: List[Link]
    total: int
    page: int
    per_page: int 