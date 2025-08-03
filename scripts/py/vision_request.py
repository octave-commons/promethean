import requests

url = "http://localhost:5003/capture"
response = requests.get(url)

if response.status_code == 200:
    with open("capture.png", "wb") as f:
        f.write(response.content)
    print("Saved capture.png")
else:
    print("Request failed", response.status_code)
