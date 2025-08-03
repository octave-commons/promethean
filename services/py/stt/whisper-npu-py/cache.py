import numpy as np
from config import SEQ_LEN, NUM_LAYERS


def init_empty_cache():
    cache = {}
    for i in range(NUM_LAYERS):
        key_name = f"past_key_values.{i}.decoder.key"
        value_name = f"past_key_values.{i}.decoder.value"
        cache[key_name] = np.zeros((1, 16, SEQ_LEN, 64), dtype=np.float32)
        cache[value_name] = np.zeros((1, 16, SEQ_LEN, 64), dtype=np.float32)
    return cache


def deepcopy_cache(cache):
    """
    Create a deep copy of the cache dictionary.
    This is useful to avoid modifying the original cache when updating it.
    """
    return {k: np.copy(v) for k, v in cache.items()}


# Update cache with new present_key_values outputs from decoder
def update_cache(past_cache, present_outputs, seq_pos):
    for i in range(NUM_LAYERS):
        key_out_name = f"present_key_values.{i}.decoder.key"
        value_out_name = f"present_key_values.{i}.decoder.value"

        past_key_name = f"past_key_values.{i}.decoder.key"
        past_value_name = f"past_key_values.{i}.decoder.value"

        present_key = present_outputs[key_out_name]  # [1,16,1,64]
        present_value = present_outputs[value_out_name]  # [1,16,1,64]

        # Overwrite the corresponding slice at seq_pos
        past_cache[past_key_name][:, :, seq_pos : seq_pos + 1, :] = present_key
        past_cache[past_value_name][:, :, seq_pos : seq_pos + 1, :] = present_value

    return past_cache
