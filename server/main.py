from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from API.autorun import model_router
from API.upload import gui_router
from db.crud import db_router
from ultralytics import YOLO

import os
import shutil
from db.db import engine
from sqlmodel import SQLModel

# from model import models, load_models
from pathlib import Path
from db.db import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):

    import model

    model.models = model.load_models()

    base_dir = Path(__file__).parent
    raw_upload_dir = base_dir / "raw_upload"
    processed_dir = base_dir / "processed"
    # print(model.models)
    # Server Running
    # load database
    await init_db()
    yield
    model.models.clear()
    # clear up local storage
    print("Cleaning up storage...")
    print(f"Cleaning up {processed_dir} ...")

    for item in processed_dir.iterdir():
        if item.is_dir():
            shutil.rmtree(item, ignore_errors=True)
        else:
            item.unlink(missing_ok=True)
    print(f"Cleaning up {raw_upload_dir} ...")
    for item in raw_upload_dir.iterdir():
        if item.is_dir():
            shutil.rmtree(item, ignore_errors=True)
        else:
            item.unlink(missing_ok=True)


# mount for common access
app = FastAPI(lifespan=lifespan)
app.mount("/raw_upload", StaticFiles(directory="raw_upload"), name="raw_upload")
app.include_router(model_router, prefix="/model")
app.include_router(gui_router, prefix="/gui")
app.include_router(db_router, prefix="/db")

# define app states;
app.state.curr_img = None

# security
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://auto-weed-ip.vercel.app",
    ],  # or ["*"] for all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"Auto Weed Image Processing"}
