"""Convenience script for invoking the TTS service."""

from shared.py.speech.service_clients import synthesize_text_to_file


if __name__ == "__main__":
    synthesize_text_to_file(
        "This is a test of the text to speech system",
        output_path="output.wav",
    )
