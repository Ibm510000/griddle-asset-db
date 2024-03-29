from pathlib import Path
from typing import Literal, Sequence
from uuid import uuid4
from pydantic import BaseModel
import semver
from sqlalchemy import select
from sqlalchemy.orm import Session

from schemas.models import (
    AssetCreate,
    VersionCreate,
    Asset as MAsset,
    Version as MVersion,
)
from database.models import Asset, Version

from util.s3 import assets_bucket

# https://fastapi.tiangolo.com/tutorial/sql-databases/#crud-utils


def read_asset(db: Session, asset_id: str):
    return db.execute(select(Asset.filter(Asset.id == asset_id)).limit(1)).first()


def read_assets(db: Session, search: str | None = None, offset=0):
    query = select(Asset)
    if search != None:
        query = query.filter(Asset.asset_name.ilike("%{}%".format(search)))
    query = query.limit(24).offset(offset)
    return db.execute(query).scalars().all()


def create_asset(db: Session, asset: AssetCreate, author_pennkey: str):
    db_asset = Asset(
        asset_name=asset.asset_name,
        author_pennkey=author_pennkey,
        keywords=asset.keywords,
        image_uri=asset.image_uri,
    )
    db.add(db_asset)
    db.commit()
    db.refresh(db_asset)
    return db_asset


def update_asset(db: Session, asset_id: str, asset: AssetCreate):
    db_asset = (
        db.execute(select(Asset).filter(Asset.id == asset_id).limit(1))
        .scalars()
        .first()
    )
    if db_asset is None:
        return None
    db_asset.asset_name = asset.asset_name
    db_asset.keywords = asset.keywords
    db_asset.image_uri = asset.image_uri
    db.commit()
    db.refresh(db_asset)
    return db_asset


class AssetInfo(BaseModel):
    asset: MAsset
    versions: Sequence[MVersion]


def read_asset_info(db: Session, asset_id: str):
    query = (
        select(Asset, Version)
        .outerjoin(Version, Asset.id == Version.asset_id)
        .filter(Asset.id == asset_id)
        .order_by(Version.date.desc())
        .limit(3)
    )
    results = db.execute(query).mappings().all()
    return AssetInfo(
        asset=results[0].Asset,
        versions=[result.Version for result in results],
    )


def read_asset_versions(
    db: Session, asset_id: str, sort: Literal["asc", "desc"] = "desc", offset=0
):
    query = (
        select(Version)
        .filter(Version.asset_id == asset_id)
        .order_by(Version.date.desc() if sort == "desc" else Version.date.asc())
        .limit(24)
        .offset(offset)
    )
    return db.execute(query).scalars().all()


# TODO: download asset to temp directory then return file response
def read_version_file(db: Session, asset_id: str, semver: str):
    version = (
        db.execute(
            select(Version)
            .filter(Version.asset_id == asset_id, Version.semver == semver)
            .limit(1)
        )
        .scalars()
        .first()
    )
    if version is None:
        return None
    return version.file_key


def create_version(
    db: Session,
    filePath: Path,
    asset_id: str,
    author_pennkey: str,
    info: VersionCreate,
):
    file_key = f"{uuid4()}"
    assets_bucket.upload_file(str(filePath.resolve()), file_key)

    # check for existing version to bump semver
    existing_version = (
        db.execute(
            select(Version)
            .filter(Version.asset_id == asset_id)
            .order_by(Version.semver.desc())
            .limit(1)
        )
        .scalars()
        .first()
    )

    # if no existing version, use 0.1
    if existing_version is None:
        new_semver = "0.1"
    else:
        ver = semver.Version.parse(f"{existing_version.semver}.0")
        new_semver = str(ver.next_version("major" if info.is_major else "minor"))[:-2]

    db_version = Version(
        asset_id=asset_id,
        semver=new_semver,
        author_pennkey=author_pennkey,
        file_key=file_key,
        message=info.message,
    )
    db.add(db_version)
    db.commit()
    db.refresh(db_version)
    return db_version
