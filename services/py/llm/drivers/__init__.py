from .base import LLMDriver

DRIVERS: dict[str, LLMDriver] = {}

try:
    from .ollama_driver import OllamaDriver

    DRIVERS["ollama"] = OllamaDriver()
except Exception:  # pragma: no cover
    pass

try:
    from .huggingface_driver import HuggingFaceDriver

    DRIVERS["huggingface"] = HuggingFaceDriver()
except Exception:  # pragma: no cover
    pass


def get_driver(name: str) -> LLMDriver:
    try:
        return DRIVERS[name]
    except KeyError as exc:  # pragma: no cover - invalid driver
        raise ValueError(f"Unknown driver {name}") from exc
