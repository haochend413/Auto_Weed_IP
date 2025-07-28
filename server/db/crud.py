from sqlmodel import SQLModel, create_engine, text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select
import os
from dotenv import load_dotenv
from sqlalchemy.orm import sessionmaker
from typing import AsyncGenerator, List
import asyncio
from db.db import get_session
from db.models import Image
from fastapi import APIRouter, Depends

db_router = APIRouter()


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
