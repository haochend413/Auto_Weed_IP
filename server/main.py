from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from fastapi.middleware.cors import CORSMiddleware
from API.autorun import model_router
from API.upload import gui_router


app = FastAPI()
# mount for common access
app.mount("/raw_upload", StaticFiles(directory="raw_upload"), name="raw_upload")
app.include_router(model_router, prefix="/model")
app.include_router(gui_router, prefix="/gui")

# security
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # or ["*"] for all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"Auto Weed Image Processing"}
