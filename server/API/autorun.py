from fastapi import (
    FastAPI,
    UploadFile,
    File,
    APIRouter,
    BackgroundTasks,
    Body,
    Path as FastAPIPath,
)
from fastapi.responses import JSONResponse, StreamingResponse
from ultralytics import YOLO
import tempfile
from pathlib import Path
import zipfile
import shutil
import io
import os
import cv2
import glob
import numpy as np
from pydantic import BaseModel
from model import models, get_models


model_router = APIRouter()

# models = {
#     "detect": YOLO(Path(__file__).parent.parent / "models" / "detection" / "best.pt"),
#     "segment": YOLO(Path(__file__).parent.parent / "models" / "segment" / "best.pt"),
#     "classify": YOLO(Path(__file__).parent.parent / "models" / "classify" / "best.pt"),
# }

# # Add model class names
# models["classify"].model.names = {
#     0: "ziziphus mauritiana",
#     1: "lantana camara",
#     2: "parkinsonia aculeata",
#     3: "parthenium hysterophorus",
#     4: "vachellia nilotica",
#     5: "cryptostegia grandiflora",
#     6: "chromolaena odorata",
#     7: "gutierrezia sarothrae",
#     8: "none",
# }

models = get_models()


@model_router.post("/auto/{operation}")
def run(
    background_tasks: BackgroundTasks,
    operation: str = FastAPIPath(..., description="Model Type"),
    images: list[UploadFile] = File(...),
):
    print("request received")
    try:
        manual = False
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
            print(operation)
            return JSONResponse(
                status_code=400, content={"error": f"Unknown operation: {operation}"}
            )

        # Define raw_upload and processed folders
        base_dir = Path(__file__).parent.parent
        raw_upload_dir = base_dir / "raw_upload"
        processed_dir = base_dir / "processed"
        raw_upload_dir.mkdir(exist_ok=True)
        processed_dir.mkdir(exist_ok=True)

        for img in images:
            img_path = raw_upload_dir / img.filename
            with img_path.open("wb") as buffer:
                shutil.copyfileobj(img.file, buffer)

        if manual:
            runCombined(CombinedRequest(ops=[False, True, True]))
        else:
            model = models[operation]
            result = model(
                source=str(raw_upload_dir),
                save=True,
                show_conf=False,
                project=processed_dir,
            )

        # buffer to store & send zip file
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, "w") as zip_file:
            for file_path in processed_dir.rglob("*"):
                if file_path.is_file():
                    zip_file.write(
                        file_path, arcname=file_path.relative_to(processed_dir)
                    )
        zip_buffer.seek(0)

        # freeup server space after task
        def clear_processed():
            for item in processed_dir.iterdir():
                if item.is_dir():
                    shutil.rmtree(item, ignore_errors=True)
                else:
                    item.unlink(missing_ok=True)

        if background_tasks is not None:
            background_tasks.add_task(clear_processed)

        return StreamingResponse(
            zip_buffer,
            media_type="application/x-zip-compressed",
            headers={"Content-Disposition": 'attachment; filename="yolo_results.zip"'},
        )

    except Exception as e:
        import traceback

        print("Exception occurred:", e)
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": str(e)})


class CombinedRequest(BaseModel):
    ops: list[bool]
    TopOnly: bool


# useful: to_json(), save_txt() (for data output);
@model_router.post("/combined")
# helper fun runAll
def runCombined(request: CombinedRequest = Body(...)):
    """
    Run all the models and manually draw the results.
    """

    ops = request.ops
    TopOnly = request.TopOnly

    # if everything is false, do nothing
    allfalse = True
    for i in ops:
        if i:
            allfalse = False
    if allfalse:
        return

    result = {}

    base_dir = Path(__file__).parent.parent
    raw_upload_dir = base_dir / "raw_upload"
    processed_dir = base_dir / "processed"
    raw_upload_dir.mkdir(exist_ok=True)
    processed_dir.mkdir(exist_ok=True)

    i_src = str(raw_upload_dir)

    # Only run models that are enabled in ops
    res_dec = res_seg = res_cls = None
    res_dec_map = res_seg_map = res_cls_map = {}

    image_paths = glob.glob(str(i_src) + "/*.jpg")
    # Sort by time;
    image_paths = sorted(image_paths, key=lambda x: os.path.getmtime(x), reverse=True)
    if TopOnly:
        image_paths = image_paths[:1]
    src = image_paths
    if ops[0]:
        res_dec = models["detect"](
            source=src, save=False, show_conf=False, project=processed_dir
        )
        res_dec_map = {Path(r.path).name: r for r in res_dec}
    if ops[1]:
        res_seg = models["segment"](
            source=src, save=False, show_conf=False, project=processed_dir
        )

        res_seg_map = {Path(r.path).name: r for r in res_seg}
    if ops[2]:
        res_cls = models["classify"](
            source=src, save=False, show_conf=False, project=processed_dir
        )
        res_cls_map = {Path(r.path).name: r for r in res_cls}
    # store info
    # read and get all images

    print(image_paths)
    for img_path in image_paths:
        img_name = Path(img_path).name
        img = cv2.imread(img_path)
        height, width = img.shape[:2]

        # Initialize result entry for this image
        result[img_name] = {}

        # Draw detection boxes and store
        if ops[0] and img_name in res_dec_map:
            res_dec_r = res_dec_map[img_name]
            boxes = res_dec_r.boxes
            # print(res_dec_r.to_json())
            result[img_name]["detect"] = []
            for box in boxes:
                xyxy = box.xyxy[0].cpu().numpy().astype(int)
                print(xyxy)
                result[img_name]["detect"].append(xyxy.tolist())
                # draw on original image;
                cv2.rectangle(
                    img, (xyxy[0], xyxy[1]), (xyxy[2], xyxy[3]), (255, 0, 0), 2
                )
                cv2.putText(
                    img,
                    f"{int(box.cls.item())} {box.conf.item():.2f}",
                    (xyxy[0], xyxy[1] - 10),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.5,
                    (255, 0, 0),
                    2,
                )

        # Draw segmentation masks and store
        if ops[1] and img_name in res_seg_map:
            res_seg_r = res_seg_map[img_name]
            masks = res_seg_r.masks
            # print(res_seg_r.to_json())
            if masks is not None:
                masks_data = masks.data.cpu().numpy()
                result[img_name]["segment"] = []
                for mask_idx in range(masks_data.shape[0]):
                    mask = masks_data[mask_idx] * 255

                    # resize the masks for GUI demo, and suit original image size;
                    if mask.shape[0] != height or mask.shape[1] != width:
                        mask_resized = cv2.resize(
                            mask.astype("uint8"),
                            (width, height),
                            interpolation=cv2.INTER_NEAREST,
                        )
                    else:
                        mask_resized = mask.astype("uint8")

                    contours, _ = cv2.findContours(
                        mask_resized,
                        cv2.RETR_EXTERNAL,
                        cv2.CHAIN_APPROX_SIMPLE,
                    )
                    contours_serializable = []
                    for cnt in contours:
                        points = cnt.squeeze().tolist()
                        contours_serializable.append(points)
                        print(contours_serializable)
                    result[img_name]["segment"].append(contours_serializable)

                    # draw on original image;
                    colored_mask = cv2.merge([mask.astype("uint8")] * 3)
                    color = np.random.randint(0, 255, size=3).tolist()
                    colored_mask = (colored_mask * (np.array(color) / 255)).astype(
                        "uint8"
                    )
                    if colored_mask.shape != img.shape:
                        colored_mask = cv2.resize(
                            colored_mask, (img.shape[1], img.shape[0])
                        )
                    img = cv2.addWeighted(img, 1.0, colored_mask, 1, 0)

        # Draw classification result and store
        if ops[2] and img_name in res_cls_map:
            res_cls_r = res_cls_map[img_name]
            probs = res_cls_r.probs
            result[img_name]["classify"] = probs
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

        # Save the annotated image to output
        cv2.imwrite(str(Path(processed_dir) / f"{img_name}.jpg"), img)
        # use stored data to produce json contour

        return result
