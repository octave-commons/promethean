from .base import LLMDriver
import ollama


class OllamaDriver(LLMDriver):
    """Driver using a local Ollama server."""

    def load(self, model_name: str):
        return model_name

    def generate(self, model, prompt: str) -> str:  # pragma: no cover - requires server
        res = ollama.chat(
            {
                "model": model,
                "messages": [{"role": "user", "content": prompt}],
            }
        )
        return res["message"]["content"]
