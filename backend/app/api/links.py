from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_active_user
from app.crud import CRUDLink, CRUDAuditLog
from app.cache import CacheService
from app.models import User
from app.schemas import Link, LinkCreate, LinkUpdate, LinkList, LinkStats

router = APIRouter(prefix="/links", tags=["links"])


@router.post("/", response_model=Link)
async def create_link(
    link: LinkCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    request: Request = None
):
    """Create a new link"""
    # Check if short_code already exists
    if CRUDLink.get_by_short_code(db, link.short_code):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Short code already exists"
        )
    
    # Create the link
    db_link = CRUDLink.create(db, link, current_user.id)
    
    # Log the action
    CRUDAuditLog.create(
        db=db,
        user_id=current_user.id,
        action="create",
        link_id=db_link.id,
        details=f"Created link: {link.short_code} -> {link.target_url}",
        ip_address=request.client.host if request else None,
        user_agent=request.headers.get("user-agent") if request else None
    )
    
    # Cache the link
    link_data = {
        "id": db_link.id,
        "short_code": db_link.short_code,
        "target_url": db_link.target_url,
        "title": db_link.title,
        "is_active": db_link.is_active
    }
    CacheService.set_link(db_link.short_code, link_data)
    
    return db_link


@router.get("/stats/{short_code}", response_model=LinkStats)
async def get_link_stats(
    short_code: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get statistics for a link"""
    db_link = CRUDLink.get_by_short_code(db, short_code)
    if not db_link:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Link not found"
        )
    
    # Check if user owns the link or is admin
    if db_link.created_by != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    return LinkStats(
        short_code=db_link.short_code,
        access_count=db_link.access_count,
        last_accessed=db_link.last_accessed,
        created_at=db_link.created_at
    )


@router.get("/{short_code}")
async def resolve_link(
    short_code: str,
    db: Session = Depends(get_db),
    request: Request = None
):
    """Resolve a short link to its target URL"""
    # Try to get from cache first
    cached_link = CacheService.get_link(short_code)
    
    if cached_link and cached_link.get("is_active"):
        # Increment access count in cache
        CacheService.increment_access_count(short_code)
        
        # Log the access
        if cached_link.get("id"):
            CRUDAuditLog.create(
                db=db,
                user_id=1,  # Anonymous user
                action="access",
                link_id=cached_link["id"],
                details=f"Accessed link: {short_code}",
                ip_address=request.client.host if request else None,
                user_agent=request.headers.get("user-agent") if request else None
            )
        
        return RedirectResponse(url=cached_link["target_url"])
    
    # If not in cache, get from database
    db_link = CRUDLink.get_by_short_code(db, short_code)
    if not db_link or not db_link.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Link not found"
        )
    
    # Cache the link
    link_data = {
        "id": db_link.id,
        "short_code": db_link.short_code,
        "target_url": db_link.target_url,
        "title": db_link.title,
        "is_active": db_link.is_active
    }
    CacheService.set_link(db_link.short_code, link_data)
    
    # Increment access count
    CRUDLink.increment_access_count(db, db_link.id)
    CacheService.increment_access_count(short_code)
    
    # Log the access
    CRUDAuditLog.create(
        db=db,
        user_id=1,  # Anonymous user
        action="access",
        link_id=db_link.id,
        details=f"Accessed link: {short_code}",
        ip_address=request.client.host if request else None,
        user_agent=request.headers.get("user-agent") if request else None
    )
    
    return RedirectResponse(url=db_link.target_url)


@router.get("/", response_model=LinkList)
async def list_links(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """List all links with optional search"""
    links, total = CRUDLink.get_all(db, skip=skip, limit=limit, search=search)
    return LinkList(links=links, total=total, page=skip // limit + 1, per_page=limit)


@router.get("/id/{link_id}", response_model=Link)
async def get_link(
    link_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific link by ID"""
    db_link = CRUDLink.get_by_id(db, link_id)
    if not db_link:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Link not found"
        )
    return db_link


@router.put("/{link_id}", response_model=Link)
async def update_link(
    link_id: int,
    link_update: LinkUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    request: Request = None
):
    """Update a link"""
    db_link = CRUDLink.get_by_id(db, link_id)
    if not db_link:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Link not found"
        )
    
    # Check if user owns the link or is admin
    if db_link.created_by != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Update the link
    updated_link = CRUDLink.update(db, link_id, link_update)
    
    # Log the action
    CRUDAuditLog.create(
        db=db,
        user_id=current_user.id,
        action="update",
        link_id=link_id,
        details=f"Updated link: {db_link.short_code}",
        ip_address=request.client.host if request else None,
        user_agent=request.headers.get("user-agent") if request else None
    )
    
    # Update cache
    if updated_link:
        link_data = {
            "id": updated_link.id,
            "short_code": updated_link.short_code,
            "target_url": updated_link.target_url,
            "title": updated_link.title,
            "is_active": updated_link.is_active
        }
        CacheService.set_link(updated_link.short_code, link_data)
    
    return updated_link


@router.delete("/{link_id}")
async def delete_link(
    link_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
    request: Request = None
):
    """Delete a link"""
    db_link = CRUDLink.get_by_id(db, link_id)
    if not db_link:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Link not found"
        )
    
    # Check if user owns the link or is admin
    if db_link.created_by != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    
    # Delete from cache
    CacheService.delete_link(db_link.short_code)
    
    # Delete from database
    success = CRUDLink.delete(db, link_id)
    
    # Log the action
    CRUDAuditLog.create(
        db=db,
        user_id=current_user.id,
        action="delete",
        link_id=link_id,
        details=f"Deleted link: {db_link.short_code}",
        ip_address=request.client.host if request else None,
        user_agent=request.headers.get("user-agent") if request else None
    )
    
    return {"message": "Link deleted successfully"} 