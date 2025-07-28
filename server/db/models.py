from typing import Optional
from sqlmodel import SQLModel, Field, Column, JSON


class Image(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    img_path: str
    regions: list = Field(sa_column=Column(JSON))
    boxes: list = Field(sa_column=Column(JSON))
    classification: str  # one classification;
