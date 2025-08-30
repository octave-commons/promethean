import os
from pathlib import Path
import yaml
from .drivers import get_driver


def _load_config():
    cfg_path = Path(__file__).resolve().parents[2] / "config" / "config.yml"
    if cfg_path.exists():
        with open(cfg_path, "r", encoding="utf-8") as f:
            return yaml.safe_load(f) or {}
    return {}


def load_model():
    """Load the configured LLM driver and model."""
    cfg = _load_config().get("llm", {})
    driver_name = os.environ.get("LLM_DRIVER") or cfg.get("driver", "ollama")
    model_name = os.environ.get("LLM_MODEL") or cfg.get("model", "gemma3:latest")
    driver = get_driver(driver_name)
    model = driver.load(model_name)
    return driver, model
