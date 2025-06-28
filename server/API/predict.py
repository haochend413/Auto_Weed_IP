from fastapi import FastAPI, UploadFile, File, APIRouter, BackgroundTasks
from fastapi.responses import JSONResponse, StreamingResponse
from ultralytics import YOLO
import tempfile
from pathlib import Path
import zipfile
import shutil
import io

detect_router = APIRouter()


@detect_router.post("/detect")
def detect(background_tasks: BackgroundTasks, images: list[UploadFile] = File(...)):
    try:
        # is this right? maybe
        # create a temp dir for auto-deletion

        model = YOLO("/Users/haochending/Auto_Weed_IP/server/models/detection/best.pt")
        with tempfile.TemporaryDirectory() as tmpdir:
            tmpdir_path = Path(tmpdir)

            # save images
            for img in images:
                img_path = tmpdir_path / img.filename
                with img_path.open("wb") as buffer:
                    shutil.copyfileobj(img.file, buffer)

            # inference; default conf : 0.25
            # results saved to /Users/haochending/Auto_Weed_IP/runs
            result = model(source=str(tmpdir_path), save=True)

            # output result
            # this might work ?
            output_dir = Path("/Users/haochending/Auto_Weed_IP/runs")
            # put the output in a zip file and send it to the users
            # Create a BytesIO buffer to hold the zip archive in memory
            zip_buffer = io.BytesIO()

            # Zip the contents of the output folder
            with zipfile.ZipFile(zip_buffer, "w") as zip_file:
                for file_path in output_dir.rglob("*"):
                    if file_path.is_file():
                        zip_file.write(
                            file_path, arcname=file_path.relative_to(output_dir)
                        )
            zip_buffer.seek(0)  # Reset buffer pointer to the start

            # Schedule the runs folder for deletion after response
            def clear_runs():
                for item in output_dir.iterdir():
                    if item.is_dir():
                        shutil.rmtree(item, ignore_errors=True)
                    else:
                        item.unlink(missing_ok=True)

            if background_tasks is not None:
                background_tasks.add_task(clear_runs)

            return StreamingResponse(
                zip_buffer,
                media_type="application/x-zip-compressed",
                headers={
                    "Content-Disposition": 'attachment; filename="yolo_results.zip"'
                },
            )

    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
