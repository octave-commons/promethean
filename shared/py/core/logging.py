"""Logging utilities for Promethean services."""

import logging
import sys
from typing import Optional


def setup_logging(
    level: str = "INFO",
    format_string: Optional[str] = None,
    service_name: Optional[str] = None,
) -> logging.Logger:
    """Set up structured logging for a service."""
    if format_string is None:
        if service_name:
            format_string = (
                f"[{service_name}] %(asctime)s - %(name)s - %(levelname)s - %(message)s"
            )
        else:
            format_string = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

    logging.basicConfig(
        level=getattr(logging, level.upper()), format=format_string, stream=sys.stdout
    )

    return logging.getLogger(service_name or __name__)
