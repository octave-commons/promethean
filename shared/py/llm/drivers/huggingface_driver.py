from .base import LLMDriver


class HuggingFaceDriver(LLMDriver):
    """Driver using Hugging Face transformers."""

    def load(self, model_name: str):
        # Lazy import to prevent import-time errors during test discovery
        try:
            from transformers import AutoModelForCausalLM, AutoTokenizer  # type: ignore
        except Exception as e:  # pragma: no cover - import guard
            raise RuntimeError("transformers is required for HuggingFaceDriver") from e
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = AutoModelForCausalLM.from_pretrained(model_name)
        model.eval()
        return tokenizer, model

    def generate(self, model, prompt: str) -> str:
        tokenizer, model_obj = model
        inputs = tokenizer(prompt, return_tensors="pt")
        outputs = model_obj.generate(**inputs, max_new_tokens=20)
        return tokenizer.decode(outputs[0], skip_special_tokens=True)
