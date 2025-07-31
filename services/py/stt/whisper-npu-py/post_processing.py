from models import tokenizer
def remove_special_tokens(tokens):
    # Remove special tokens like BOS, EOS, etc.
    return [token for token in tokens if token not in tokenizer.all_special_ids]
def remove_repeated_tokens(tokens):
    # Remove consecutive repeated tokens
    return [token for i, token in enumerate(tokens) if i == 0 or token != tokens[i - 1]]
from difflib import SequenceMatcher

def find_overlap(a, b):
    """
    Find the longest suffix of `a` that matches the prefix of `b`.
    """
    max_len = min(len(a), len(b))
    for i in range(max_len, 0, -1):
        if a[-i:] == b[:i]:
            return i
    return 0
from difflib import SequenceMatcher

def trim_redundant_prefix(previous_text, current_text):
    """
    Trim overlapping text by comparing the end of previous_text with the start of current_text.
    Uses word-level matching to avoid false positives on token overlap.
    """
    prev_words = previous_text.strip().split()
    curr_words = current_text.strip().split()

    # Only look at last 40 words of prior text
    max_prev = 40
    prev_words = prev_words[-max_prev:]

    sm = SequenceMatcher(None, prev_words, curr_words)
    match = sm.find_longest_match(0, len(prev_words), 0, len(curr_words))

    if match.size > 3 and match.b == 0:
        return " ".join(curr_words[match.size:])
    return " ".join(curr_words)
def dedupe_ngrams(tokens, max_ngram=6):
    """
    Remove repeated n-grams from the token sequence.
    """
    from collections import defaultdict

    seen = defaultdict(set)
    output = []
    i = 0

    while i < len(tokens):
        found_repeat = False
        for n in range(max_ngram, 1, -1):
            if i + n > len(tokens):
                continue
            ngram = tuple(tokens[i:i+n])
            if ngram in seen[n]:
                # skip this ngram
                i += n
                found_repeat = True
                break
            else:
                seen[n].add(ngram)
        if not found_repeat:
            output.append(tokens[i])
            i += 1
    return output
# def cleanup_tokens(current_chunk_tokens, prior_tokens, tokenizer, is_first_chunk=True):
#     full_tokens = remove_repeated_tokens(remove_special_tokens(current_chunk_tokens))
#     current_text = tokenizer.decode(full_tokens)
#     prior_text = tokenizer.decode(prior_tokens[-64:]) if prior_tokens else ""
#     trimmed_text = trim_redundant_prefix(prior_text, current_text)

#     # Optional spacing normalization
#     trimmed_text = " " + trimmed_text.strip() + " "

#     # Tokenize
#     trimmed_tokens = tokenizer(trimmed_text, add_special_tokens=False).input_ids

#     # Remove repeated n-grams
#     trimmed_tokens = dedupe_ngrams(trimmed_tokens)

#     # # Remove first 3 tokens unless this is the first chunk
#     # if not is_first_chunk:
#     #     trimmed_tokens = trimmed_tokens[3:]

#     overlap = find_overlap(prior_tokens, trimmed_tokens)
#     return trimmed_tokens[overlap:]
def cleanup_tokens(current_chunk_tokens, prior_tokens, tokenizer, is_first_chunk=True):
    # Strip special tokens
    full_tokens = [t for t in current_chunk_tokens if t not in tokenizer.all_special_ids]

    # Decode
    current_text = tokenizer.decode(full_tokens)
    prior_text = tokenizer.decode(prior_tokens[-64:]) if prior_tokens else ""

    # Trim word-level overlap
    trimmed_text = trim_redundant_prefix(prior_text, current_text).strip()

    # Re-tokenize
    trimmed_tokens = tokenizer(trimmed_text, add_special_tokens=False).input_ids
    print("---")
    print("PRIOR TEXT:", repr(prior_text))
    print("CURRENT TEXT:", repr(current_text))
    print("TRIMMED TEXT:", repr(trimmed_text))
    print("TOKEN LENGTH CHANGE:", len(current_chunk_tokens), "→", len(trimmed_tokens))


    return trimmed_tokens

