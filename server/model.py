from ultralytics import YOLO
from pathlib import Path


# Function to initialize models
def load_models():
    print("Loading AI models...")
    models = {
        "detect": YOLO(Path(__file__).parent / "models" / "detection" / "best.pt"),
        "segment": YOLO(Path(__file__).parent / "models" / "segment" / "best.pt"),
        "classify": YOLO(Path(__file__).parent / "models" / "classify" / "best.pt"),
    }

    # Add model class names
    models["classify"].model.names = {
        0: "ziziphus mauritiana",
        1: "lantana camara",
        2: "parkinsonia aculeata",
        3: "parthenium hysterophorus",
        4: "vachellia nilotica",
        5: "cryptostegia grandiflora",
        6: "chromolaena odorata",
        7: "gutierrezia sarothrae",
        8: "none",
    }

    print("AI models loaded successfully!")
    return models


# Declare models variable but don't load yet
# It will be initialized in main.py during startup
models = None
