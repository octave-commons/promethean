import requests
from urllib.parse import urlencode
from scipy.io import wavfile


def send_wav_as_pcm(file_path, url='http://localhost:5001/transcribe_pcm', query_params=None):
    sample_rate, data = wavfile.read(file_path)

    if data.dtype != 'int16':
        raise ValueError("Only 16-bit PCM WAV files are supported.")

    pcm_data = data.tobytes()

    # Add query params to URL if provided
    if query_params:
        url += '?' + urlencode(query_params)

    headers = {
        'Content-Type': 'application/octet-stream',
        'X-Sample-Rate': str(sample_rate),
        'X-Dtype': 'int16'
    }

    print(f"\n=== Transcribing '{file_path}' ===")
    print("POST", url)

    response = requests.post(url, data=pcm_data, headers=headers)

    if response.ok:
        print("Transcription:", response.json().get('transcription'))
    else:
        print("Error:", response.status_code, response.text)


# === Example Usages ===

send_wav_as_pcm("longer_recording.wav", url='http://localhost:5001/transcribe_pcm')

send_wav_as_pcm("longer_recording.wav", url='http://localhost:5001/transcribe_pcm/equalized')

# Config 1 – Standard voice cleanup
send_wav_as_pcm(
    "longer_recording.wav",
    url='http://localhost:5001/transcribe_pcm/equalized',
    query_params={
        'highpass': 100,
        'lowpass': 7500,
        'notch1': '200-300',
        'notch2': '400-700'
    }
)

# Config 2 – Brighter voice, no lowpass
send_wav_as_pcm(
    "longer_recording.wav",
    url='http://localhost:5001/transcribe_pcm/equalized',
    query_params={
        'highpass': 120,
        'notch1': '180-280',
        'notch2': '500-800',
        'boost': '3000-4000'
    }
)

# Config 3 – Softer high end
send_wav_as_pcm(
    "longer_recording.wav",
    url='http://localhost:5001/transcribe_pcm/equalized',
    query_params={
        'highpass': 80,
        'lowpass': 5000,
        'notch1': '250-350'
    }
)

# Config 4 – No notch filters, just broad shaping
send_wav_as_pcm(
    "longer_recording.wav",
    url='http://localhost:5001/transcribe_pcm/equalized',
    query_params={
        'highpass': 90,
        'lowpass': 6800
    }
)
