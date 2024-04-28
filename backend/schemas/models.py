from typing import Literal, Optional
from uuid import UUID
from pydantic import BaseModel
from datetime import datetime


class AssetBase(BaseModel):
    keywords: str
    image_uri: Optional[str]


class AssetCreate(AssetBase):
    asset_name: str
    pass


class AssetUpdate(AssetBase):
    pass


class Asset(AssetBase):
    asset_name: str
    id: UUID
    author_pennkey: str

    class Config:
        from_attributes = True


class VersionBase(BaseModel):
    message: str


class VersionCreate(VersionBase):
    is_major: bool


class Version(VersionBase):
    asset_id: UUID
    semver: str
    author_pennkey: str
    date: datetime

    class Config:
        from_attributes = True


# User class
class UserBase(BaseModel):
    pennkey: str
    first_name: str
    last_name: str
    school: Literal["sas", "seas", "wharton"]


class UserCreate(UserBase):
    password: str


class User(UserBase):
    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    pennkey: str | None = None
