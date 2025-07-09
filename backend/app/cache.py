import redis
import json
from typing import Optional
from app.config import settings

# Redis connection
redis_client = redis.from_url(settings.redis_url, decode_responses=True)


class CacheService:
    """Service for Redis caching operations"""
    
    @staticmethod
    def get_link(short_code: str) -> Optional[dict]:
        """Get a link from cache"""
        try:
            cached_data = redis_client.get(f"link:{short_code}")
            if cached_data:
                return json.loads(cached_data)
            return None
        except Exception:
            return None
    
    @staticmethod
    def set_link(short_code: str, link_data: dict, expire_seconds: int = 3600) -> bool:
        """Cache a link"""
        try:
            redis_client.setex(
                f"link:{short_code}",
                expire_seconds,
                json.dumps(link_data)
            )
            return True
        except Exception:
            return False
    
    @staticmethod
    def delete_link(short_code: str) -> bool:
        """Delete a link from cache"""
        try:
            redis_client.delete(f"link:{short_code}")
            return True
        except Exception:
            return False
    
    @staticmethod
    def increment_access_count(short_code: str) -> Optional[int]:
        """Increment access count for a link"""
        try:
            return redis_client.incr(f"access_count:{short_code}")
        except Exception:
            return None
    
    @staticmethod
    def get_access_count(short_code: str) -> Optional[int]:
        """Get access count for a link"""
        try:
            count = redis_client.get(f"access_count:{short_code}")
            return int(count) if count else 0
        except Exception:
            return None
    
    @staticmethod
    def clear_cache() -> bool:
        """Clear all cached data"""
        try:
            redis_client.flushdb()
            return True
        except Exception:
            return False 