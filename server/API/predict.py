from fastapi import FastAPI, UploadFile, File, APIRouter
from fastapi.responses import JSONResponse, StreamingResponse
from ultralytics import YOLO
import tempfile
from pathlib import Path
from zipfile import zipfile
import shutil
from main import app
import io

detect_router = APIRouter()


@detect_router.post("/detect")
def detect(images: list[UploadFile] = File(...)):
    # is this right? maybe
    # create a temp dir for auto-deletion

    model = YOLO("server/models/detection/best.pt")
    with tempfile.TemporaryDirectory() as tmpdir:
        tmpdir_path = Path(tmpdir)

        # save images
        for img in images:
            img_path = tmpdir_path / img.filename
            with img_path.open("wb") as buffer:
                shutil.copyfileobj(img.file, buffer)

        # inference; default conf : 0.25
        result = model(source=str(tmpdir_path), save=True)

        # output result
        # this might work ?
        output_dir = Path(result[0].path).parent
        # put the output in a zip file and send it to the users
        # Create a BytesIO buffer to hold the zip archive in memory
        zip_buffer = io.BytesIO()

        # Zip the contents of the output folder
        with zipfile.ZipFile(zip_buffer, "w") as zip_file:
            for file_path in output_dir.rglob("*"):
                if file_path.is_file():
                    zip_file.write(file_path, arcname=file_path.relative_to(output_dir))
        zip_buffer.seek(0)  # Reset buffer pointer to the start
        # need input path
        return StreamingResponse(
            zip_buffer,
            media_type="application/x-zip-compressed",
            headers={"Content-Disposition": 'attachment; filename="yolo_results.zip"'},
        )
