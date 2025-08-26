from .base import LLMDriver
from transformers import AutoModelForCausalLM, AutoTokenizer


class HuggingFaceDriver(LLMDriver):
    """Driver using Hugging Face transformers."""

    def load(self, model_name: str):
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = AutoModelForCausalLM.from_pretrained(model_name)
        model.eval()
        return tokenizer, model

    def generate(self, model, prompt: str) -> str:
        tokenizer, model_obj = model
        inputs = tokenizer(prompt, return_tensors="pt")
        outputs = model_obj.generate(**inputs, max_new_tokens=20)
        return tokenizer.decode(outputs[0], skip_special_tokens=True)
