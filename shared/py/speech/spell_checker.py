# SPDX-License-Identifier: GPL-3.0-only
"""Spell checker utilities."""

import os
from typing import Optional, Tuple

from transformers import T5ForConditionalGeneration, T5Tokenizer

_model: Optional[T5ForConditionalGeneration] = None
_tokenizer: Optional[T5Tokenizer] = None


def _get_model() -> Tuple[Optional[T5ForConditionalGeneration], Optional[T5Tokenizer]]:
    """Return cached model and tokenizer, loading on first use."""

    global _model, _tokenizer

    if _model is None or _tokenizer is None:
        if os.getenv("PROMETHEAN_SKIP_SPELL_MODEL") == "1":
            return None, None

        _model = T5ForConditionalGeneration.from_pretrained("Unbabel/gec-t5_small")
        _tokenizer = T5Tokenizer.from_pretrained("t5-small")

    return _model, _tokenizer


def correct(sentence: str) -> str:
    """Return the grammar-corrected version of ``sentence``."""

    model, tokenizer = _get_model()

    if model is None or tokenizer is None:
        return sentence

    tokenized_sentence = tokenizer(
        "gec: " + sentence,
        max_length=128,
        truncation=True,
        padding="max_length",
        return_tensors="pt",
    )

    corrected_sentence = tokenizer.decode(
        model.generate(
            input_ids=tokenized_sentence.input_ids,
            attention_mask=tokenized_sentence.attention_mask,
            max_length=128,
            num_beams=5,
            early_stopping=True,
        )[0],
        skip_special_tokens=True,
        clean_up_tokenization_spaces=True,
    )
    return corrected_sentence


def main() -> None:
    """Demonstrate the spell checker with a sample sentence."""

    sentence = "I can haz cheezburger"
    print(correct(sentence))  # -> I like swimming.


if __name__ == "__main__":
    main()
