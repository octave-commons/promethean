from fastapi import FastAPI, Request, Header, Query, HTTPException
from fastapi.responses import JSONResponse

# from lib.speech.wisper_stt import transcribe_pcm
import asyncio

import sys

sys.path.append("../../")
from shared.py.speech.wisper_stt import transcribe_pcm

app = FastAPI()


@app.post("/transcribe_pcm")
async def transcribe_pcm_endpoint(
    request: Request, x_sample_rate: int = Header(16000), x_dtype: str = Header("int16")
):
    if x_dtype != "int16":
        return JSONResponse(
            {"error": "Only int16 PCM supported for now"}, status_code=400
        )

    pcm_data = bytearray()
    async for chunk in request.stream():
        pcm_data.extend(chunk)

    # Now call your transcription logic
    transcription = transcribe_pcm(pcm_data, x_sample_rate)
    # print("final transcription", transcription)
    return {"transcription": transcription}
