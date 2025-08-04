"""Convenience script for invoking the STT service."""

from shared.py.speech.service_clients import send_wav_as_pcm


if __name__ == "__main__":
    send_wav_as_pcm("longer_recording.wav", url="http://localhost:5001/transcribe_pcm")

    send_wav_as_pcm(
        "longer_recording.wav",
        url="http://localhost:5001/transcribe_pcm/equalized",
    )

    # Config 1 – Standard voice cleanup
    send_wav_as_pcm(
        "longer_recording.wav",
        url="http://localhost:5001/transcribe_pcm/equalized",
        query_params={
            "highpass": 100,
            "lowpass": 7500,
            "notch1": "200-300",
            "notch2": "400-700",
        },
    )

    # Config 2 – Brighter voice, no lowpass
    send_wav_as_pcm(
        "longer_recording.wav",
        url="http://localhost:5001/transcribe_pcm/equalized",
        query_params={
            "highpass": 120,
            "notch1": "180-280",
            "notch2": "500-800",
            "boost": "3000-4000",
        },
    )

    # Config 3 – Softer high end
    send_wav_as_pcm(
        "longer_recording.wav",
        url="http://localhost:5001/transcribe_pcm/equalized",
        query_params={
            "highpass": 80,
            "lowpass": 5000,
            "notch1": "250-350",
        },
    )

    # Config 4 – No notch filters, just broad shaping
    send_wav_as_pcm(
        "longer_recording.wav",
        url="http://localhost:5001/transcribe_pcm/equalized",
        query_params={
            "highpass": 90,
            "lowpass": 6800,
        },
    )
