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

model_router = APIRouter()

# load model at server startup
models = {
    "detect": YOLO(Path(__file__).parent.parent / "models" / "detection" / "best.pt"),
    "segment": YOLO(Path(__file__).parent.parent / "models" / "segment" / "best.pt"),
    "classify": YOLO(Path(__file__).parent.parent / "models" / "classify" / "best.pt"),
}

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


@model_router.post("/{operation}")
def run(
    background_tasks: BackgroundTasks,
    operation: str = FastAPIPath(..., description="Model Type"),
    images: list[UploadFile] = File(...),
):
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
        elif operation == "all":
            manual = True
        else:
            return JSONResponse(
                status_code=400, content={"error": f"Unknown operation: {operation}"}
            )

        with tempfile.TemporaryDirectory() as tmpdir:
            tmpdir_path = Path(tmpdir)

            # save images
            for img in images:
                img_path = tmpdir_path / img.filename
                with img_path.open("wb") as buffer:
                    shutil.copyfileobj(img.file, buffer)

            output_dir = Path(__file__).parent.parent.parent / "runs"

            # whether manually or auto (for single operation)
            if manual:
                runAll(str(tmpdir_path), output_dir)
            else:
                model = models[operation]
                # here the model is used;
                result = model(source=str(tmpdir_path), save=True, show_conf=False)
                # if other things require, use yaml instead
                # result = model(source=str(tmpdir_path), save=True, cfg=config_path)
                # output result

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
        import traceback

        print("Exception occurred:", e)
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})


# helper fun runAll
def runAll(src: str, output_dir: str):
    """
    Run all the models and manually draw the results.
    """

    res_dec = models["detect"](source=src, save=False, show_conf=False)
    res_seg = models["segment"](source=src, save=False, show_conf=False)
    res_cls = models["classify"](source=src, save=False, show_conf=False)

    res_dec_map = {Path(r.path).name: r for r in res_dec}
    res_seg_map = {Path(r.path).name: r for r in res_seg}
    res_cls_map = {Path(r.path).name: r for r in res_cls}
    # draw

    # read and get all images
    image_paths = glob.glob(src + "/*.jpg")
    for img_path in image_paths:
        img_name = Path(img_path).name
        img = cv2.imread(img_path)

        # retrieve matching result
        res_dec_r = res_dec_map[img_name]
        res_seg_r = res_seg_map[img_name]
        res_cls_r = res_cls_map[img_name]
        boxes = res_dec_r.boxes

        for box in boxes:
            xyxy = box.xyxy[0].cpu().numpy().astype(int)
            cv2.rectangle(img, (xyxy[0], xyxy[1]), (xyxy[2], xyxy[3]), (255, 0, 0), 2)
            cv2.putText(
                img,
                f"{int(box.cls.item())} {box.conf.item():.2f}",
                (xyxy[0], xyxy[1] - 10),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                (255, 0, 0),
                2,
            )

        # Draw segmentation masks
        masks = res_seg_r.masks
        if masks is not None:
            masks_data = masks.data.cpu().numpy()
            seg_boxes = res_seg_r.boxes
            for mask_idx in range(masks_data.shape[0]):
                mask = masks_data[mask_idx] * 255
                colored_mask = cv2.merge([mask.astype("uint8")] * 3)
                color = np.random.randint(0, 255, size=3).tolist()
                colored_mask = (colored_mask * (np.array(color) / 255)).astype("uint8")
                if colored_mask.shape != img.shape:
                    colored_mask = cv2.resize(
                        colored_mask, (img.shape[1], img.shape[0])
                    )
                img = cv2.addWeighted(img, 1.0, colored_mask, 1, 0)

        # Draw classification result
        probs = res_cls_r.probs
        if probs is not None:
            top1 = probs.top1
            label = models["classify"].model.names[top1]
            cv2.putText(
                img,
                f"Classification: {label}",
                (10, 30),
                cv2.FONT_HERSHEY_SIMPLEX,
                1.0,
                (0, 255, 255),
                2,
            )

        # Save the annotated image
        cv2.imwrite(str(output_dir / f"{img_name}.jpg"), img)
