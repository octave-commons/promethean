"""
Web framework utilities for Promethean services.

Provides FastAPI/Flask factories and common web utilities.
"""

__version__ = "0.0.1"

from .app import create_fastapi_app
from .health import health_check

__all__ = ["create_fastapi_app", "health_check"]
