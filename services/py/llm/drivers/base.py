from abc import ABC, abstractmethod


class LLMDriver(ABC):
    """Base interface for LLM drivers."""

    @abstractmethod
    def load(self, model_name: str):
        """Load the model and return a handle."""

    @abstractmethod
    def generate(self, model, prompt: str) -> str:
        """Generate text using ``model``."""
