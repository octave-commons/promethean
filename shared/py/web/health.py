"""Health check utilities for web services."""

from typing import Dict, Any
from datetime import datetime


def health_check() -> Dict[str, Any]:
    """Basic health check endpoint response."""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "promethean-service",
    }
