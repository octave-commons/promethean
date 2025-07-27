import pytest; pytest.skip("requires external dependencies", allow_module_level=True)
from ollama import AsyncClient
import asyncio
import json
ollama_client = AsyncClient("http://localhost:11434")

async def cleanup_transcript(raw_transcript, speakers=None, audio_blocks=None, voice_client=None):
    """
    Cleans up the transcript by clearing speakers and audio blocks.
    Optionally closes the voice client if provided.
    """
    response = await ollama_client.chat(
        model="llama3.2",
        format={
            "type":"object",
            "properties": {
                "transcript": {
                    "type": "string",
                    "description": "The cleaned up version of the transcript."
                }
            }
        },
        messages=[
            {
                "role": "system",
                "content": """Respond with JSON. You are a transcript cleaner. Your job is to take raw, messy transcripts generated from real-time speech-to-text and rewrite them into clear, coherent English. The original may contain filler words, stuttering, false starts, missing punctuation, poor spacing, or transcription errors. Your task is to:

Fix spelling and grammar issues.

Insert punctuation and sentence boundaries where appropriate.

Preserve the original speaker’s intent and tone.

Remove filler words, false starts, and repeated phrases unless they add meaning.

Do not add new information or make assumptions beyond what’s implied.

If a sentence is too garbled to understand, simplify it without guessing. It's okay to mark uncertain sections with brackets like: [unclear]"""},
            {"role": "user", "content": raw_transcript}])
    return json.loads(response['message']['content'])['transcript']

print("Ollama client initialized for transcript cleanup.")
# This code initializes the Ollama client for transcript cleanup.
# It defines a function to clean up transcripts using the Ollama model.

async def test(transcript): print(await transcript )



asyncio.run(cleanup_transcript("i'm goniyou random hs here tryto get this tbe alitle bit longer so that way i can y to li aout what's gonna onifand naturally s gotishouldnt worrytoo much about whether or not kei'm likestutteringer whatever enside because itany good it should be able topick up and deal with all the stuff that i'm doing here-like if its canbe natural languag interface it definitely should be able to deal with like inconcurrency spoken language verses textiothe outputs of this directly into a language model it's o tobe prompted with thenotification that thi is converted audio transcript and there might bn weirdstuff in sisshou try to not take it literally but anything at seems weard it needs to can understandill work ith pwork with omptdoesn't matter what i'm actually saying here because i'm just there's something aftesting sgod bye"))
