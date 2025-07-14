from fastapi import (
    FastAPI,
    UploadFile,
    File,
    APIRouter,
    BackgroundTasks,
    Path as FastAPIPath,
)
from fastapi.responses import JSONResponse, StreamingResponse
from ultralytics import YOLO
import tempfile
from pathlib import Path
import zipfile
import shutil
import io
import cv2
import glob
import numpy as np

# only handle upload; two routers right now;

gui_router = APIRouter()


@gui_router.post("/upload")
def upload(img: UploadFile = File(...)):
    # save the file to the server folder, ready to be processed;
    # Define raw_upload and processed folders
    base_dir = Path(__file__).parent.parent
    raw_upload_dir = base_dir / "raw_upload"
    processed_dir = base_dir / "processed"
    raw_upload_dir.mkdir(exist_ok=True)
    processed_dir.mkdir(exist_ok=True)

    img_path = raw_upload_dir / img.filename
    with img_path.open("wb") as buffer:
        shutil.copyfileobj(img.file, buffer)
    return {"filename": img.filename, "url": f"/raw_upload/{img.filename}"}
