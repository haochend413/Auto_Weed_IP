from fastapi import (
    FastAPI,
    UploadFile,
    File,
    Request,
    APIRouter,
    Body,
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
from typing import List
from pydantic import BaseModel

# only handle upload; two routers right now;
file_router = APIRouter()


@file_router.get("/getAllImageNames")
def getAllImageNames():
    base_dir = Path(__file__).parent.parent
    raw_upload_dir = base_dir / "raw_upload"
    # check
    if not raw_upload_dir.exists():
        return []
    # I want to return all the file names;
    files = []
    for file_path in raw_upload_dir.iterdir():
        if file_path.is_file():
            files.append(file_path.name)
    return files
