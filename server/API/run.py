from fastapi import FastAPI, UploadFile, File, APIRouter, BackgroundTasks,Path as FastAPIPath
from fastapi.responses import JSONResponse, StreamingResponse
from ultralytics import YOLO
import tempfile
from pathlib import Path
import zipfile
import shutil
import io

model_router = APIRouter()

# load model at server startup
models = {
    "detect": YOLO(Path(__file__).parent.parent / "models" / "detection" / "best.pt"),
    "segment": YOLO(Path(__file__).parent.parent / "models" / "segment" / "best.pt"),
    "classify": YOLO(Path(__file__).parent.parent / "models" / "classify" / "best.pt"),
}



@model_router.post("/{operation}") 
def detect( background_tasks: BackgroundTasks,
           operation: str = FastAPIPath(..., description="Model Type"), 
           images: list[UploadFile] = File(...)):
    print("request received")
    try:
        # is this right? maybe
        # create a temp dir for auto-deletion
        # Choose model path & config file based on operation 
        if operation == "detect":
            config_path = Path(__file__).parent.parent / "configs" / "detect.yaml"
        elif operation == "segment":
            config_path = Path(__file__).parent.parent / "configs" / "segment.yaml"

        elif operation == "classify":
            config_path = Path(__file__).parent.parent / "configs" / "classify.yaml"

        else: 
            return JSONResponse(status_code=400, content={"error": f"Unknown operation: {operation}"})
        
        model = models[operation]
        
        with tempfile.TemporaryDirectory() as tmpdir:
            tmpdir_path = Path(tmpdir) 

            # save images
            for img in images: 
                img_path = tmpdir_path / img.filename
                with img_path.open("wb") as buffer:
                    shutil.copyfileobj(img.file, buffer)

            # here the model is used; 
            print(config_path)
            result = model(source=str(tmpdir_path), save=True, show_conf = False)
            # if other things require, use yaml instead 
            # result = model(source=str(tmpdir_path), save=True, cfg=config_path)

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
