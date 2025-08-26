import math
import yaml
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

_CONFIG_CACHE = None


def _load_config(config_path: Path | None = None) -> dict:
    global _CONFIG_CACHE
    if _CONFIG_CACHE is None:
        if config_path is None:
            config_path = Path(__file__).resolve().parent.parent / "permissions.yaml"
        with open(config_path, "r", encoding="utf-8") as f:
            _CONFIG_CACHE = yaml.safe_load(f) or {}
    return _CONFIG_CACHE


def _sigmoid(x: float) -> float:
    return 1 / (1 + math.exp(-x))


def check_permission(
    agent: str, action: str, *, config_path: str | None = None
) -> bool:
    """Check if *agent* is allowed to perform *action*.

    Configuration is loaded from a YAML file. The schema expects:

    - ``beta``: softness of the gate.
    - ``default``: default weights, threshold, and action features.
    - ``agents``: optional per-agent overrides with nested ``actions``.

    Each action lists feature values. Weights and threshold are taken from the
    agent definition or fall back to ``default``.
    """
    cfg = _load_config(Path(config_path) if config_path else None)
    beta = cfg.get("beta", 1.0)
    default = cfg.get("default", {})
    agents = cfg.get("agents", {})

    agent_cfg = agents.get(agent, {})
    weights = agent_cfg.get("weights", default.get("weights", {}))
    threshold = agent_cfg.get("threshold", default.get("threshold", 0))

    action_cfg = agent_cfg.get("actions", {}).get(action) or default.get(
        "actions", {}
    ).get("default", {})
    features = action_cfg.get("features", {})

    feature_names = set(weights) | set(features)
    score = sum(weights.get(n, 0) * features.get(n, 0) for n in feature_names)
    probability = _sigmoid((score - threshold) / beta)
    allowed = probability >= 0.5
    if not allowed:
        logger.warning(
            "Permission denied",
            extra={"agent": agent, "action": action, "probability": probability},
        )
    return allowed


__all__ = ["check_permission"]
