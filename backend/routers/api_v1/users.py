from datetime import timedelta
from typing import Annotated, Sequence
from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from util.auth import create_access_token, get_current_user
from util.crud.users import (
    authenticate_user,
    create_user,
    read_user_exists,
    read_user,
    read_users,
)
from database.connection import get_db
from schemas.models import UserCreate, User, Token


ACCESS_TOKEN_EXPIRE_MINUTES = 30


router = APIRouter(
    prefix="/users",
    tags=["users"],
    responses={404: {"description": "Not found"}},
)


@router.get(
    "/",
    summary="Get a list of users",
    description="Fetches a list of users from the database. Optionally, add a search parameter to filter results.",
)
def get_users(
    db: Annotated[Session, Depends(get_db)],
    query: str | None = None,
    offset: int = 0,
) -> Sequence[User]:
    return read_users(db, query=query, offset=offset)


@router.post(
    "/",
    summary="Create a new user in the database",
)
async def new_user(user: UserCreate, db: Annotated[Session, Depends(get_db)]) -> User:
    # make sure user doesn't already exist
    if read_user_exists(db, user.pennkey):
        raise HTTPException(400, "User already exists")

    try:
        result = create_user(db, user)
        if result is None:
            raise HTTPException(status_code=400, detail="User could not be created")
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Trolma")

    return result


@router.post(
    "/token",
    summary="Login with PennKey and password",
)
def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    db: Annotated[Session, Depends(get_db)],
) -> Token:
    # authenticate user
    user = authenticate_user(db, form_data.username, form_data.password)
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # create JWT access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.pennkey}, expires_delta=access_token_expires
    )

    return Token(access_token=access_token, token_type="bearer")


@router.get(
    "/me",
    summary="Get info about the current user",
    description="Based on the provided token, fetches information on the current user.",
)
def read_users_me(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    return current_user


@router.get(
    "/{pennkey}",
    summary="Get info about a specific user",
    description="Based on `pennkey`, fetches information on a specific user.",
)
def get_user_info(db: Annotated[Session, Depends(get_db)], pennkey: str) -> User:
    result = read_user(db, pennkey)
    if result is None:
        raise HTTPException(status_code=404, detail="User not found")
    return result
