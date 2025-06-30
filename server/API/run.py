from fastapi import FastAPI, UploadFile, File, APIRouter, BackgroundTasks,Path as FastAPIPath
from fastapi.responses import JSONResponse, StreamingResponse
from ultralytics import YOLO
import tempfile
from pathlib import Path
import zipfile
import shutil
import io

model_router = APIRouter()


@model_router.post("/{operation}") 
def detect( background_tasks: BackgroundTasks,
           operation: str = FastAPIPath(..., description="Model Type"), 
           images: list[UploadFile] = File(...)):
    print("request received")
    try:
        # is this right? maybe
        # create a temp dir for auto-deletion
        # Choose model path based on operation 
        if operation == "detect":
            model_path = Path(__file__).parent.parent / "models" / "detection" / "best.pt"
        elif operation == "segment":
            model_path = Path(__file__).parent.parent / "models" / "segment" / "best.pt"
        elif operation == "classify":
            model_path = Path(__file__).parent.parent / "models" / "classify" / "best.pt"
        else:
            return JSONResponse(status_code=400, content={"error": f"Unknown operation: {operation}"})
        model = YOLO(model_path)

        with tempfile.TemporaryDirectory() as tmpdir:
            tmpdir_path = Path(tmpdir)

            # save images
            for img in images:
                img_path = tmpdir_path / img.filename
                with img_path.open("wb") as buffer:
                    shutil.copyfileobj(img.file, buffer)
            result = model(source=str(tmpdir_path), save=True)

            # output result
            output_dir = Path(__file__).parent.parent.parent / "runs"

            # buffer to store & send zip file 
            zip_buffer = io.BytesIO()
            with zipfile.ZipFile(zip_buffer, "w") as zip_file:
                for file_path in output_dir.rglob("*"):
                    if file_path.is_file():
                        zip_file.write(
                            file_path, arcname=file_path.relative_to(output_dir)
                        )
            zip_buffer.seek(0)

            # bgtask: free server space after sending result to user
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
