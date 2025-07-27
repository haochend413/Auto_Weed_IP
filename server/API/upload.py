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
gui_router = APIRouter()


@gui_router.post("/upload")
def upload(r: Request, img: UploadFile = File(...)):
    # save the file to the server folder, ready to be processed;
    # Define raw_upload and processed folders
    base_dir = Path(__file__).parent.parent
    raw_upload_dir = base_dir / "raw_upload"
    processed_dir = base_dir / "processed"
    raw_upload_dir.mkdir(exist_ok=True)
    processed_dir.mkdir(exist_ok=True)

    img_path = raw_upload_dir / img.filename

    r.app.state.curr_img = img_path  # set the current img path stored;
    with img_path.open("wb") as buffer:
        shutil.copyfileobj(img.file, buffer)
    return {"filename": img.filename, "url": f"/raw_upload/{img.filename}"}


class DownloadProcessedRequest(BaseModel):
    regions: List[List[List[float]]]
    boxes: List[List[List[float]]]


@gui_router.post("/download_p")
def download_p(r: Request, request: DownloadProcessedRequest = Body(...)):
    img_path = r.app.state.curr_img
    img = cv2.imread(img_path)
    height, width = img.shape[:2]
    # apply the data, draw them;
    regions = request.regions
    borders = request.boxes
    print(borders)
    # draw boxes
    for border in borders:
        pt1, pt2 = border
        pt1 = tuple(int(round(x)) for x in pt1)
        pt2 = tuple(int(round(x)) for x in pt2)
        cv2.rectangle(img, pt1, pt2, (255, 0, 0), 10)
        # draw regions

    # draw contours
    mask = np.zeros((height, width), dtype=np.uint8)

    for region in regions:
        arr = np.array(region, dtype=np.int32)
        if arr.ndim == 2:
            arr = arr.reshape((-1, 1, 2))
        cv2.drawContours(mask, [arr], -1, color=255, thickness=-1)

    red_mask = np.zeros_like(img)
    red_mask[:, :, 2] = mask

    img = cv2.addWeighted(img, 1.0, red_mask, 1, 0)

    # output
    _, buffer = cv2.imencode(".jpg", img)
    io_buf = io.BytesIO(buffer)

    return StreamingResponse(io_buf, media_type="image/jpeg")
