from typing import Optional
from uuid import UUID
from pydantic import BaseModel


class AssetBase(BaseModel):
    asset_name: str
    keywords: str
    image_uri: Optional[str]


class AssetCreate(AssetBase):
    pass


class Asset(AssetBase):
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

    class Config:
        from_attributes = True
