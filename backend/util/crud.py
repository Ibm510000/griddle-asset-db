from pathlib import Path
from typing import Sequence, Literal
from uuid import uuid4
from pydantic import BaseModel
import semver
from sqlalchemy import select
from sqlalchemy.orm import Session
import csv

from schemas.models import (
    AssetCreate,
    VersionCreate,
    Asset as MAsset,
    Version as MVersion,
)
from database.models import Asset, Version

from util.files import temp_s3_download
from util.s3 import assets_bucket
from sqlalchemy import or_, func
from sqlalchemy.sql.expression import case

# https://fastapi.tiangolo.com/tutorial/sql-databases/#crud-utils


def read_asset(db: Session, asset_id: str):
    return db.execute(select(Asset.filter(Asset.id == asset_id)).limit(1)).first()


def read_assets(
    db: Session,
    search: str | None = None,
    offset=0,
    sort: Literal["date_asc", "name_asc", "date_dsc", "name_dsc"] = "date_dsc",
):
    # TODO: figure out the join nonsense
    # 1. distance between str and asset name should be small
    # 2. Each word in search are tested against keywords,
    query = select(Asset)
    # query = query.join(Version, Asset.id == Version.asset_id, isouter=True)
    # query = query.distinct(Asset.id)
    if search is not None:
        # If search contains commas, split by commas, otherwise split by spaces
        if "," in search:
            reader = csv.reader([search], skipinitialspace=True)
            keywords = next(reader)
        else:
            keywords = search.split()
        # check if asset name contains search
        asset_name_conditions = []
        asset_name_conditions.append(
            or_(
                *[Asset.asset_name.ilike(f"%{search}%")],
                *[Asset.asset_name.ilike(f"%{kw}%") for kw in keywords],
            )
        )
        # check if keywords or author contain search words
        query = query.filter(
            or_(
                *asset_name_conditions,
                *[Asset.keywords.ilike(f"%{kw}%") for kw in keywords],
                *[Asset.author_pennkey.ilike(f"%{search}%")],
            )
        )

    # sort by date or name
    # if sort == "date_asc":
    #     query = query.order_by(Version.date.asc())
    if sort == "name_asc":
        query = query.order_by(Asset.asset_name.asc())
    # elif sort == "date_dsc":
    #     query = query.order_by(Version.date.desc())
    elif sort == "name_dsc":
        query = query.order_by(Asset.asset_name.desc())

    # limit and offset query, then return
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


def read_asset_exists(db: Session, asset_id: str):
    try:
        query = select(Asset.asset_name).filter(Asset.id == asset_id).limit(1)
        result = db.execute(query).scalars().first()
        return result is not None
    except Exception as e:
        print(e)
        return False


class AssetInfo(BaseModel):
    asset: MAsset
    versions: Sequence[MVersion]


def read_asset_info(db: Session, asset_id: str):
    query = (
        select(Asset, Version)
        .outerjoin(Version, Version.asset_id == Asset.id)
        .filter(Asset.id == asset_id)
        .order_by(Version.date.desc())
        .limit(3)
    )
    results = db.execute(query).mappings().all()

    if len(results) == 0:
        return None

    noVersions = results[0].Version is None
    return AssetInfo(
        asset=results[0].Asset,
        versions=[] if noVersions else [result.Version for result in results],
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
        return (None, lambda: None)

    return temp_s3_download(version.file_key)


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
