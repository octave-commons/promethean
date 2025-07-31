# Input:
# - encoder_output: from encoder (already on NPU)
# - beam_size: number of beams (e.g., 5)
# - max_length: max output tokens
# - tokenizer: to decode IDs back to text

import time

from audio import preprocess_audio
import torch
import numpy as np

from models import tokenizer, run_cross_kv, run_encoder
from post_processing import cleanup_tokens
from decoder import generate_token
from cache import init_empty_cache, update_cache, deepcopy_cache


def softmax(logits):
    e_x = np.exp(logits - np.max(logits))
    return e_x / e_x.sum()


def log_softmax(logits):
    logits = logits - np.max(logits)
    exp = np.exp(logits)
    return logits - np.log(np.sum(exp))


def select_top_k(log_probs, k):
    return sorted(enumerate(log_probs), key=lambda x: x[1], reverse=True)[:k]


mel_chunks = preprocess_audio("../../../longer_recording.wav")
output_tokens = []
start_time = time.perf_counter()
start_token = tokenizer.bos_token_id
max_length = 223  # Max output length for Whisper
beam_size = 5  # Number of beams to keep
starting_tokens = ["<|startoftranscript|>", "<|en|>", "<|notimestamps|>"]

eos_token = tokenizer.eos_token_id

is_first_chunk = True

prior_tokens_count = 64  # Number of prior tokens to consider

start_time = time.perf_counter()
for chunk in mel_chunks:
    prior_tokens = output_tokens[-prior_tokens_count:]
    current_tokens = (
        tokenizer.convert_tokens_to_ids(starting_tokens) + prior_tokens.copy()
    )
    current_tokens = current_tokens[
        -prior_tokens_count:
    ]  # Ensure we don't exceed max length

    beams = [
        {
            "finished": False,
            "tokens": current_tokens,
            "score": 0.0,
            "kv_cache": init_empty_cache(),
        }
    ]

    # === Run encoder on this mel chunk
    encoder_output = run_encoder(torch.tensor(chunk))
    cross_kv_outputs = run_cross_kv(encoder_output)
    for step in range(max_length):
        all_candidates = []

        for beam in beams:
            # Send tokens and KV cache to NPU
            # print("Processing beam with tokens:", beam["tokens"], "and score:", beam["score"])
            if beam["finished"]:
                all_candidates.append(beam)  # keep finished beams alive

                continue
            _, past_decoder_kv, logits = generate_token(
                current_chunk_tokens=beam["tokens"].copy(),
                past_decoder_kv=beam["kv_cache"],
                cross_kv_outputs=cross_kv_outputs,
                greedy=False,
            )

            # Softmax + top-k selection (done on CPU)
            log_probs = log_softmax(logits[0, -1])  # Get the last token's logits)
            top_k = select_top_k(log_probs, k=beam_size)

            for token_id, log_prob in top_k:
                gen_len = beam.get("gen_len", 0) + 1
                score = beam["score"] + log_prob

                length_penalty = ((5 + gen_len) / 6) ** 0.6  # from Google NMT paper
                adjusted_score = score / length_penalty

                new_beam = {
                    "finished": token_id == eos_token,
                    "tokens": (beam["tokens"] + [token_id])[
                        -max_length:
                    ],  # Ensure we don't exceed max length
                    "score": adjusted_score,
                    "gen_len": gen_len,
                    "kv_cache": deepcopy_cache(
                        past_decoder_kv
                    ),  # cache updated for this path
                }
                all_candidates.append(new_beam)

            # Sort and prune beams
        beams = sorted(all_candidates, key=lambda b: b["score"], reverse=True)[
            :beam_size
        ]

        # Optional: check if all beams end with EOS
        if all(b["tokens"][-1] == eos_token for b in beams):
            break

    # Return best beam
    best_tokens = cleanup_tokens(
        beams[0]["tokens"], prior_tokens, tokenizer, is_first_chunk=is_first_chunk
    )
    print("Best tokens:", best_tokens)
    print("Best score:", beams[0]["score"])
    print("Best token length:", len(best_tokens))
    print("Best token text:", tokenizer.decode(best_tokens, skip_special_tokens=True))
    is_first_chunk = False  # After the first chunk, we are no longer in the first chunk
    output_tokens.extend(best_tokens)

print("Total time taken:", time.perf_counter() - start_time, "seconds")
print("Transcription:", tokenizer.decode(output_tokens, skip_special_tokens=True))
