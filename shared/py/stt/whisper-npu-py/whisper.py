import time

from audio import preprocess_audio

from models import tokenizer
from decoder import generate_tokens_for_chunk

mel_chunks = preprocess_audio("../../../longer_recording.wav")
output_tokens: list[int] = []
start_time = time.perf_counter()


is_first_chunk = True

for chunk in mel_chunks:
    print("Processing new chunk...")
    output_tokens.extend(
        generate_tokens_for_chunk(
            chunk, prior_tokens=output_tokens[-64:], is_first_chunk=is_first_chunk
        )
    )
    is_first_chunk = False

end_time = time.perf_counter()

print("Transcription:", tokenizer.decode(output_tokens))  # skip BOS/EOS tokens
print("Total time taken:", end_time - start_time, "seconds")
