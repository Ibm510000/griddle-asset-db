from typing import Annotated, Literal, Sequence
from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
)
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from database.models import User
from util.crud.assets import (
    AssetInfo,
    create_asset,
    create_version,
    read_asset_exists,
    read_asset_versions,
    read_assets,
    read_assets_names,
    read_asset_info,
    read_version_file,
    update_asset,
    remove_asset,
)
from database.connection import get_db
from schemas.models import Asset, AssetCreate, Version, VersionCreate
from util.files import save_upload_file_temp
from util.auth import get_current_user, oauth2_scheme

router = APIRouter(
    prefix="/assets",
    tags=["assets"],
    responses={404: {"description": "Not found"}},
)


@router.get(
    "/",
    summary="Get a list of assets",
    description="""Used for fetching a (paginated) list of assets stored in the database.

Allows searching by arbitrary strings, sorting by date or name, adding keyword filters, and adding offset for pagination.""",
)
def get_assets(
    db: Annotated[Session, Depends(get_db)],
    search: str | None = None,
    keywords: str | None = None,
    sort: Literal["date_asc", "name_asc", "date_dsc", "name_dsc"] = "date_dsc",
    offset: int = 0,
) -> Sequence[Asset]:
    # TODO: add fuzzy search somehow
    return read_assets(
        db, search=(search if search != "" else None), offset=offset, sort=sort
    )


@router.get(
    "/names",
    summary="Get a list of asset names",
    description="Used for fetching a list of the names of assets stored in the database.",
)
def get_assets_names(
    db: Session = Depends(get_db),
) -> Sequence[str]:
    return read_assets_names(db)


@router.post(
    "/",
    summary="Create a new asset, not including initial version",
    description="Creating a new asset in the database. Does not include initial version -- followed up with POST to `/assets/{uuid}` to upload an initial version.",
)
async def new_asset(
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
    asset: AssetCreate,
) -> Asset:
    return create_asset(db, asset, user.pennkey)


# TODO: add relatedAssets maybe
@router.get(
    "/{uuid}",
    summary="Get info about a specific asset",
    description="Based on `uuid`, fetches information on a specific asset.",
)
def get_asset_info(uuid: str, db: Annotated[Session, Depends(get_db)]) -> AssetInfo:
    result = read_asset_info(db, uuid)
    if result is None:
        raise HTTPException(status_code=404, detail="Asset not found")
    return result


@router.put(
    "/{uuid}",
    summary="Update asset metadata",
    description="Based on `uuid`, updates information for a specific asset.",
)
async def put_asset(
    db: Annotated[Session, Depends(get_db)],
    token: Annotated[str, Depends(oauth2_scheme)],
    uuid: str,
    asset: AssetCreate,
):
    result = update_asset(db, uuid, asset)
    if result is None:
        raise HTTPException(status_code=404, detail="Asset not found")
    return result


@router.delete(
    "/{uuid}",
    summary="Delete asset metadata ONLY FOR DEV PURPOSES",
    description="Based on `uuid`, deletes a specific asset.",
)
async def delete_asset(
    uuid: str,
    db: Session = Depends(get_db),
):
    result = remove_asset(db, uuid)
    if result is False:
        raise HTTPException(status_code=404, detail="Asset not found")
    return


@router.get("/{uuid}/versions", summary="Get a list of versions for a given asset")
def get_asset_versions(
    db: Annotated[Session, Depends(get_db)],
    uuid: str,
    sort: Literal["asc", "desc"] = "desc",
    offset: int = 0,
) -> Sequence[Version]:
    return read_asset_versions(db, uuid, sort, offset)


@router.post("/{uuid}/versions", summary="Upload a new version for a given asset")
def new_asset_version(
    db: Annotated[Session, Depends(get_db)],
    user: Annotated[User, Depends(get_current_user)],
    uuid: str,
    file: Annotated[UploadFile, File()],
    message: Annotated[str, Form()],
    is_major: Annotated[bool, Form()] = False,
):
    # TODO: reenable this sometime
    # if file.content_type != "application/zip":
    #     raise HTTPException(status_code=400, detail="File must be a ZIP archive")

    file_path = save_upload_file_temp(file)
    if file_path is None:
        raise HTTPException(status_code=400, detail="File uploaded incorrectly")

    if not read_asset_exists(db, uuid):
        raise HTTPException(status_code=404, detail="Asset not found")

    return create_version(
        db,
        file_path,
        uuid,
        user.pennkey,
        VersionCreate(message=message, is_major=is_major),
    )


@router.get(
    "/{uuid}/versions/{semver}/file",
    responses={
        200: {
            "content": {"application/zip": {}},
            "description": "Download the version file as a zip archive",
        }
    },
)
def download_version_file(
    db: Annotated[Session, Depends(get_db)],
    token: Annotated[str, Depends(oauth2_scheme)],
    background_tasks: BackgroundTasks,
    uuid: str,
    semver: str,
) -> FileResponse:
    (file_path, cleanup) = read_version_file(db, uuid, semver)
    background_tasks.add_task(cleanup)

    if file_path is None:
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(
        path=file_path,
        media_type="application/zip",
    )
