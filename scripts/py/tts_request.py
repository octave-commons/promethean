import requests

url = "http://localhost:5000/synth_voice"
data = {
    "input_text": "This is a test of the text to speech system"
}

response = requests.post(url, data=data)

if response.status_code == 200:
    with open("output.wav", "wb") as f:
        f.write(response.content)
    print("Audio saved as output.wav")
else:
    print("Request failed with status code:", response.status_code)
    print("Response:", response.text)
