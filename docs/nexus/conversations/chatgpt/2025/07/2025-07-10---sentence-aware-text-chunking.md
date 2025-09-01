---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "Sentence-aware text chunking"
conversation_id: 686fe7bd-de70-8004-baf3-48c28c5d0e6c
create_time: 07/10/2025 at 11:18 AM
update_time: 07/10/2025 at 11:23 AM
---

# Title: Sentence-aware text chunking

Created: 07/10/2025 at 11:18 AM
Last Updated: 07/10/2025 at 11:23 AM
Chat URL: https://chat.openai.com/c/686fe7bd-de70-8004-baf3-48c28c5d0e6c


>[!nexus_user] **User** - 07/10/2025 at 11:18 AM
> The function works, but it could do a lot better. I've tried a few other ways, but I mess up the word order some where. It's hard to keep track of in my head. 
> 
> Could you rewrite this to attempt to respect sentence structure while also maintaining a maximum chunk length of 80?
> 
> ```python
> 
> def split_sentences(text, max_chunk_len=80):
>  # Split text into lines, then into punctuated sub-sentences
>  all_chunks = []
>  current_chunk=""
>  print(f"Split into {len(all_chunks)} chunks")
>  print(f"Splitting text into sentences with max length {max_chunk_len} characters.")
>  print(f"Input text length: {len(text)} characters")
>  words = text.split()
>  print(words)
>  for word in words:
>  if len(current_chunk) + len(word) + 1 > max_chunk_len:
>  if current_chunk:
>  all_chunks.append(current_chunk.strip())
>  current_chunk = ""
>  if current_chunk:
>  current_chunk += " "
>  current_chunk += word
>  if current_chunk:
>  all_chunks.append(current_chunk.strip())
>  for chunk in all_chunks:
>  print(f"Chunk: '{chunk}' (length: {len(chunk)})")
> 
>  return all_chunks
> 
> ```
<!-- UID: 741e975f-d81c-42c8-a292-a656c028bca1 -->




>[!nexus_agent] **Assistant** - 07/10/2025 at 11:18 AM
> Yeah, that function is really just a word wrap—not a sentence-aware chunker. If you want to chunk while *respecting sentence structure*, you'll need to:
> 
> 1. Split the input into **sentences** first.
> 2. Group those sentences into chunks without exceeding the character limit.
> 3. Avoid splitting mid-sentence unless it's unavoidable (which it usually isn’t if the limit is reasonable like 80).
> 
> Here’s a revised version that does just that:
> 
> ```python
> import re
> 
> def split_sentences(text, max_chunk_len=80):
>  print(f"Splitting text into sentence-aware chunks with max length {max_chunk_len} characters.")
>  print(f"Input text length: {len(text)} characters")
> 
>  # Use regex to split by sentence-ending punctuation
>  sentences = re.split(r'(?<=[.!?]) +', text.strip())
>  print(f"Found {len(sentences)} sentences.")
> 
>  all_chunks = []
>  current_chunk = ""
> 
>  for sentence in sentences:
>  # If the sentence alone is too long, split it by words
>  if len(sentence) > max_chunk_len:
>  words = sentence.split()
>  for word in words:
>  if len(current_chunk) + len(word) + 1 > max_chunk_len:
>  if current_chunk:
>  all_chunks.append(current_chunk.strip())
>  current_chunk = ""
>  if current_chunk:
>  current_chunk += " "
>  current_chunk += word
>  else:
>  # If adding this sentence would exceed the limit, commit current chunk
>  if len(current_chunk) + len(sentence) + 1 > max_chunk_len:
>  if current_chunk:
>  all_chunks.append(current_chunk.strip())
>  current_chunk = ""
>  if current_chunk:
>  current_chunk += " "
>  current_chunk += sentence
> 
>  if current_chunk:
>  all_chunks.append(current_chunk.strip())
> 
>  for chunk in all_chunks:
>  print(f"Chunk: '{chunk}' (length: {len(chunk)})")
> 
>  return all_chunks
> ```
> 
> ### Highlights:
> - Uses regex to keep sentence boundaries intact: `(?<=[.!?]) +` matches punctuation followed by space(s).
> - Falls back to word-level splitting **only** if a sentence is longer than `max_chunk_len`.
> - Avoids mid-sentence breaks unless absolutely necessary.
> 
> ### Example
> Input:
> ```
> "This is the first sentence. Here's another one! And a third? This one is going to be quite long, perhaps even longer than the defined limit of characters per chunk so we can test splitting."
> ```
> 
> Output:
> ```
> Chunk 1: 'This is the first sentence. Here's another one!'
> Chunk 2: 'And a third? This one is going to be quite long, perhaps even longer than the defined limit of characters per chunk'
> Chunk 3: 'so we can test splitting.'
> ```
> 
> Let me know if you’d like a version that tries even harder not to break phrases (e.g. noun chunks or quoted speech), though that’d require heavier NLP tooling.
<!-- UID: 47375bcc-7a03-4263-a3b8-1052c86fccd4 -->

---




>[!nexus_user] **User** - 07/10/2025 at 11:19 AM
> We also need the chunks to be at least 20 characters long, at least it seems like it. I get garbled voice audio if I use sentences that small.
<!-- UID: 7c1fdf3a-1883-4691-b0ac-eee094305a28 -->




>[!nexus_agent] **Assistant** - 07/10/2025 at 11:19 AM
> Got it—so we need:
> 
> 1. **Hard upper limit**: Chunks must not exceed `max_chunk_len` (e.g., 80).
> 2. **Soft lower limit**: Chunks should be **at least** `min_chunk_len` (e.g., 20), unless it’s the last one.
> 3. Sentence structure should still be preserved as much as possible.
> 4. If a sentence is too long → split by words.
> 5. If a sentence is too short → try to **combine it with the next one**, unless doing so would break the max.
> 
> Here’s the updated version with all that:
> 
> ```python
> import re
> 
> def split_sentences(text, max_chunk_len=80, min_chunk_len=20):
>  print(f"Splitting text into sentence-aware chunks (max {max_chunk_len}, min {min_chunk_len}).")
>  print(f"Input text length: {len(text)} characters")
> 
>  # First pass: basic sentence splitting
>  sentences = re.split(r'(?<=[.!?]) +', text.strip())
>  print(f"Found {len(sentences)} sentences.")
> 
>  all_chunks = []
>  current_chunk = ""
> 
>  i = 0
>  while i < len(sentences):
>  sentence = sentences[i]
> 
>  # If sentence is too long, split by words
>  if len(sentence) > max_chunk_len:
>  words = sentence.split()
>  for word in words:
>  if len(current_chunk) + len(word) + 1 > max_chunk_len:
>  if len(current_chunk) >= min_chunk_len:
>  all_chunks.append(current_chunk.strip())
>  current_chunk = ""
>  if current_chunk:
>  current_chunk += " "
>  current_chunk += word
>  else:
>  # Would adding this sentence bust the limit?
>  if len(current_chunk) + len(sentence) + 1 > max_chunk_len:
>  if len(current_chunk) >= min_chunk_len:
>  all_chunks.append(current_chunk.strip())
>  current_chunk = ""
>  else:
>  # Try to append next sentence to reach min length
>  while len(current_chunk) < min_chunk_len and i + 1 < len(sentences):
>  sentence += " " + sentences[i + 1]
>  i += 1
>  if len(sentence) > max_chunk_len:
>  break
>  # At this point, try again to add
>  if len(current_chunk) + len(sentence) + 1 > max_chunk_len:
>  all_chunks.append(current_chunk.strip())
>  current_chunk = ""
> 
>  if current_chunk:
>  current_chunk += " "
>  current_chunk += sentence
> 
>  i += 1
> 
>  if current_chunk:
>  all_chunks.append(current_chunk.strip())
> 
>  for chunk in all_chunks:
>  print(f"Chunk: '{chunk}' (length: {len(chunk)})")
> 
>  return all_chunks
> ```
> 
> ---
> 
> ### Key Improvements:
> - **Short sentences** are buffered together until they reach `min_chunk_len`.
> - **Long sentences** are split by word like before.
> - No chunk is committed unless it meets the `min_chunk_len`, except possibly the last one.
> 
> ---
> 
> This will help smooth out speech synthesis issues caused by underfilled chunks (garbled audio is often a result of under-conditioned mel spectrograms). Let me know if you want to hard-pad the short final chunk or queue it for next run.
<!-- UID: a0424813-98a2-4f49-9179-fd8091995841 -->

---




>[!nexus_user] **User** - 07/10/2025 at 11:20 AM
> Hard pad?
<!-- UID: 19b29830-622c-4493-8229-02beade0241f -->




>[!nexus_agent] **Assistant** - 07/10/2025 at 11:20 AM
> By **"hard pad"**, I mean adding extra content (like silence, filler text, or a pause token) to artificially extend a **too-short** final chunk to meet the minimum required length for stable voice synthesis.
> 
> This is useful if:
> - Your model **breaks** or produces **unintelligible/gargled audio** on short sequences (like <20 characters).
> - You want to avoid delaying output by waiting for the next real chunk of text.
> 
> ---
> 
> ### Options for Padding a Final Short Chunk
> 
> #### 1. **Whitespace Padding** *(simple, non-invasive)* 
> Add spaces until the chunk hits the `min_chunk_len` threshold.
> 
> ```python
> if len(current_chunk) < min_chunk_len:
>  current_chunk = current_chunk.ljust(min_chunk_len)
> ```
> 
> Pros:
> - Doesn't change actual content.
> - Least likely to confuse a speech model that ignores trailing silence.
> 
> Cons:
> - If your TTS model uses character length as an input mask, padding with spaces might still confuse it or create awkward pauses.
> 
> ---
> 
> #### 2. **Filler Text Padding**
> Add a neutral phrase like `"..."`, `"uh-huh"`, or `"please continue"` to reach the minimum length.
> 
> Example:
> ```python
> if len(current_chunk) < min_chunk_len:
>  current_chunk += " ..." # Or your filler of choice
> ```
> 
> Pros:
> - Helps models that rely on meaningful context to complete spectrograms.
> - Especially useful for voice interfaces that simulate natural back-and-forth.
> 
> Cons:
> - Not appropriate for all applications (e.g., strict transcripts, voice logs).
> 
> ---
> 
> #### 3. **Synthetic Silence (if supported by your system)**
> If you're using something like Tacotron or WaveRNN that supports prosody tokens, you can pad with a silence phoneme or spectrogram silence.
> 
> This usually requires token-level or mel-level manipulation and might not be possible in your current pipeline—but worth considering if you can represent silence meaningfully in input.
> 
> ---
> 
> ### Implementation Example
> Here’s how you might patch the tail end of your function:
> 
> ```python
> if current_chunk:
>  if len(current_chunk) < min_chunk_len:
>  current_chunk = current_chunk.ljust(min_chunk_len) # or add " ..." or silence token
>  all_chunks.append(current_chunk.strip())
> ```
> 
> ---
> 
> If you're still getting garbled voice output even after padding, then the problem might not just be the length—it could be:
> - Misalignment between Tacotron output and WaveRNN input.
> - Mel spectrograms not being normalized properly.
> - Timing mismatch between chunking and synthesis buffer flushing.
> 
> Let me know what model pipeline you’re using, and I can tell you how best to patch for that environment.
<!-- UID: 5ee0461a-8ffc-4dc4-b3c7-46a7b8fa2be9 -->

---




>[!nexus_user] **User** - 07/10/2025 at 11:22 AM
> Add synthetic silence
<!-- UID: 175975c1-c6fa-42a8-b1da-635d25f3c4d3 -->




>[!nexus_agent] **Assistant** - 07/10/2025 at 11:22 AM
> To add **synthetic silence** to the end of a short chunk, we need to be specific about *where* in your pipeline this happens.
> 
> Since you’re using:
> 
> - `forward_tacotron_ie` → mel spectrogram
> - `wavernn_rnn` + `wavernn_upsampler` → waveform
> 
> ...and you're running inference via **OpenVINO**, that pipeline **doesn't accept silence as a token** in text. So you can’t inject a `"sil"` token into the text string like you could with some TTS models trained on phoneme inputs (e.g., FastSpeech + HiFi-GAN).
> 
> But you *can* simulate silence by appending a **fixed number of mel frames corresponding to silence** before feeding into WaveRNN.
> 
> ---
> 
> ### 🔧 Two Practical Options for "Synthetic Silence"
> 
> #### ✅ Option 1: Add zeros to the mel spectrogram (post-Tacotron)
> 
> You can append a short silent mel segment to the end of the Tacotron output. This assumes the vocoder interprets near-zero energy as silence (which WaveRNN usually does).
> 
> ```python
> def append_silence_to_mel(mel, silence_frames=10):
>  """Append silent mel frames to the end of a mel spectrogram."""
>  n_mels = mel.shape[1]
>  silence = np.zeros((silence_frames, n_mels), dtype=np.float32)
>  return np.concatenate([mel, silence], axis=0)
> ```
> 
> Use it after your Tacotron model runs:
> 
> ```python
> mel_output = forward_tacotron.infer(text_sequence)
> mel_output = append_silence_to_mel(mel_output, silence_frames=10)
> waveform = wavernn.infer(mel_output)
> ```
> 
> Adjust `silence_frames` depending on your frame rate (e.g., 50–100 ms of silence might be ~5–10 frames).
> 
> ---
> 
> #### ✅ Option 2: Inject silence during waveform synthesis (post-WaveRNN)
> 
> Append samples of actual zero-valued waveform data. This simulates digital silence.
> 
> ```python
> def append_silence_to_waveform(waveform, silence_duration_sec=0.2, sample_rate=22050):
>  silence_samples = int(silence_duration_sec * sample_rate)
>  silence = np.zeros(silence_samples, dtype=waveform.dtype)
>  return np.concatenate([waveform, silence])
> ```
> 
> You’d do this after `wavernn.infer(...)` returns the waveform.
> 
> ---
> 
> ### When to Apply This
> Add silence **only if**:
> - `len(text_chunk) < min_chunk_len`
> - You're seeing garbled or truncated output
> - You want smoother transitions between chunks or avoid audio popping/glitching
> 
> ---
> 
> ### Recommendation for You
> 
> If your garbled audio is happening on short sentences and you're not sure where the issue is:
> 
> 1. Try **Option 1** first (append silence to mel spectrogram).
> 2. If that doesn’t help, try **Option 2** (append silence to waveform).
> 3. If both fail, I’ll help you investigate model normalization, vocoder conditioning, and chunk transitions.
> 
> Would you like help patching this into your actual `tts_pipeline.py` or similar code?
<!-- UID: 498b0039-5692-46e5-8572-f80540831d1d -->

---


