import requests
from pathlib import Path

folder_path = Path.home() / "Desktop" / "test_images"  # Correct path expansion
files = []

for img_path in folder_path.glob("*.*"):
    if img_path.suffix.lower() in [".jpg", ".jpeg", ".png"]:
        files.append(("images", (img_path.name, img_path.open("rb"), "image/jpeg")))

response = requests.post("http://127.0.0.1:8000/detect", files=files)

with open("yolo_results.zip", "wb") as f:
    f.write(response.content)

print("Results saved as yolo_results.zip")
