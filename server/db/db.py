from sqlmodel import SQLModel, create_engine, text
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv
from sqlalchemy.orm import sessionmaker
from typing import AsyncGenerator
import asyncio

# get dataurl from postgre;
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_async_engine(DATABASE_URL, echo=True)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        yield session


# Init function
async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)


# end coonection function;
async def on_shutdown():
    await engine.dispose()
    print("🔌 DB engine disposed")


# if __name__ == "__main__":

#     async def main():
#         await init_db()
#         async with async_session() as session:
#             result = await session.execute(text("SELECT 1"))
#             print(result.scalar())

#     asyncio.run(main())
