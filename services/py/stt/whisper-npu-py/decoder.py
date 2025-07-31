import torch
import numpy as np
from models import (
     decoder_compiled , tokenizer, run_encoder, run_cross_kv
)
from cache import update_cache, init_empty_cache

from post_processing import (
    cleanup_tokens
)

def softmax_np(logits):
    exp_logits = np.exp(logits - np.max(logits))  # subtract max for numerical stability
    return exp_logits / exp_logits.sum()
# def make_attention_mask(current_seq_len, max_seq_len=224):
#     mask = np.zeros((1, max_seq_len), dtype=np.int64)
#     mask[0, :current_seq_len] = 1
#     return mask

def make_attention_mask(current_seq_len, max_seq_len=224):
    if current_seq_len < 128:
        current_seq_len = 128
    mask = np.ones((1, current_seq_len), dtype=np.int64)
    if current_seq_len < max_seq_len:
        pad_width = max_seq_len - current_seq_len
        mask = np.pad(mask, ((0, 0), (0, pad_width)), mode='constant', constant_values=0)
    return mask
def run_decoder_step(
    input_ids,
    attention_mask,
    position_ids,
    encoder_kv,
    past_decoder_kv
):
    """
    Run a single step of the decoder with the given inputs.
    input_ids: torch tensor (1, 1) current input token
    attention_mask: numpy array (1, 224) fixed size for Whisper
    position_ids: numpy array (1,) current position id
    encoder_kv: dict of encoder key/values from cross_kv outputs
    past_decoder_kv: dict of past decoder key/values or None
    """
    inputs = {
        "input_ids": input_ids,
        "attention_mask": attention_mask,
        "position_ids": position_ids,
    }

    for k, v in encoder_kv.items():
        key_name = k if isinstance(k, str) else k.get_any_name()
        key_name = key_name.replace("present_key_values", "past_key_values")
        inputs[key_name] = v
    for k, v in past_decoder_kv.items():
        inputs[k] = v

    request = decoder_compiled.create_infer_request()
    outputs = request.infer(inputs)

    # Extract logits and new past key values
    logits = outputs["logits"]
    update_cache(past_decoder_kv, outputs, position_ids[0])


    return logits



def generate_token(
        current_chunk_tokens,
        past_decoder_kv = None,
        cross_kv_outputs = None,
        greedy=True
):
    if past_decoder_kv is None:
        past_decoder_kv = init_empty_cache()
    input_ids = np.array([[current_chunk_tokens[-1]]], dtype=np.int64)
    position_ids = np.array([len(current_chunk_tokens) - 1], dtype=np.int64)  # minus 1 because position index starts from 0
    attention_mask = make_attention_mask(len(current_chunk_tokens))

    logits = run_decoder_step(
        input_ids=input_ids,
        attention_mask=attention_mask,
        position_ids=position_ids,
        encoder_kv=cross_kv_outputs,
        past_decoder_kv=past_decoder_kv,
    )

    next_token = int(np.argmax(logits[0, -1]))
    if greedy:
        current_chunk_tokens.append(next_token)

    return next_token, past_decoder_kv, logits


def generate_tokens_for_chunk(chunk, prior_tokens=[], is_first_chunk=False):
    print("Processing chunk of shape:", chunk.shape)

    # === Run encoder on this mel chunk
    encoder_output = run_encoder(torch.tensor(chunk))
    cross_kv_outputs = run_cross_kv(encoder_output)

    # === Initialize decoder state
    past_decoder_kv = init_empty_cache()
    current_chunk_tokens = tokenizer.convert_tokens_to_ids([
        "<|startoftranscript|>", "<|en|>", "<|notimestamps|>"
    ]) + prior_tokens.copy()

    # === Generate tokens
    while len(current_chunk_tokens) < 224:
        next_token, _, _ = generate_token(
            current_chunk_tokens,
            cross_kv_outputs=cross_kv_outputs,
            past_decoder_kv=past_decoder_kv,
            greedy=True
        )
        if next_token == tokenizer.eos_token_id:
            break
        current_chunk_tokens.append(next_token)

    return cleanup_tokens(
        current_chunk_tokens,
        prior_tokens,
        tokenizer,
        is_first_chunk
    )
