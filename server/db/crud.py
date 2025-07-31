from sqlmodel import SQLModel, create_engine, text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
import os
from dotenv import load_dotenv
from sqlalchemy.orm import sessionmaker
from typing import List, Optional, Any
import asyncio
from db.db import get_session
from db.models import Image
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

db_router = APIRouter()


# fetch all the imgs as their paths;
@db_router.get("/getAllPhotosDB")
async def get_images(session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(Image.img_path))
    namelist = [
        img_path[0] for img_path in result.fetchall()
    ]  # turn tuples into clean list;
    return namelist


# fetch the data
@db_router.get("/getImage/")
async def get_images(img_path: str, session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(Image).where(Image.img_path == img_path))
    return result.scalars().all()


# put a image;
@db_router.post("/putImage/")
async def put_image(image: Image, session: AsyncSession = Depends(get_session)):
    session.add(image)
    await session.commit()  # save
    await session.refresh(image)
    return image


# delete a image;
@db_router.post("/deleteImage/")
async def delete_image(img_path: str, session: AsyncSession = Depends(get_session)):
    result = await session.execute(select(Image).where(Image.img_path == img_path))
    imgs = result.scalars().all()
    for img in imgs:
        await session.delete(img)
    await session.commit()
    return {"deleted": len(imgs)}


# Define model for the update request
class ImageUpdate(BaseModel):
    img_path: str
    regions: Optional[List[Any]] = None
    boxes: Optional[List[Any]] = None
    classification: Optional[str] = None


# edit a image;
@db_router.post("/editImage")
async def edit_image(
    imgUpdate: ImageUpdate, session: AsyncSession = Depends(get_session)
):
    # fetch
    result = await session.execute(
        select(Image).where(Image.img_path == imgUpdate.img_path)
    )
    image = result.scalars().first()

    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    # update
    if imgUpdate.regions is not None:
        image.regions = imgUpdate.regions

    if imgUpdate.boxes is not None:
        image.boxes = imgUpdate.boxes

    if imgUpdate.classification is not None:
        image.classification = imgUpdate.classification

    # commit
    await session.commit()
    await session.refresh(image)

    return image
