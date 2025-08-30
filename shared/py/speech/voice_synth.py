from pathlib import Path
import requests


def synthize_speech(
    text: str,
    output_path: str | Path,
    url: str = "http://localhost:8080/tts/synth_voice_pcm",
) -> Path:
    """Request speech synthesis and save the audio to ``output_path``.

    Parameters
    ----------
    text:
        Text to synthesize.
    output_path:
        Location where the resulting WAV file will be written.
    url:
        Endpoint of the TTS service.

    Returns
    -------
    pathlib.Path
        Path to the written audio file.
    """

    response = requests.post(url, data={"input_text": text})
    response.raise_for_status()
    output_file = Path(output_path)
    with output_file.open("wb") as f:
        f.write(response.content)
    return output_file
