"""FastAPI application factory and utilities."""

from typing import Optional, Dict, Any

try:
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
except ImportError:
    raise ImportError(
        "FastAPI dependencies not installed. Install with: pip install shared-web[fastapi]"
    )


def create_fastapi_app(
    title: str = "Promethean Service",
    description: Optional[str] = None,
    version: str = "0.1.0",
    cors_origins: Optional[list[str]] = None,
    **kwargs: Any,
) -> FastAPI:
    """Create a FastAPI application with common configuration."""
    # FastAPI expects a str for description, not Optional[str]
    app = FastAPI(title=title, description=description or "", version=version, **kwargs)

    # Add CORS middleware if origins specified
    if cors_origins:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=cors_origins,
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    return app
