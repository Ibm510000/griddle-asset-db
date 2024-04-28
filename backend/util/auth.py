from datetime import datetime, timedelta, timezone
from typing import Annotated
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from database.connection import get_db
from schemas.models import TokenData
from settings import SECRET_KEY
from util.crud.users import read_user

ALGORITHM = "HS256"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/users/token")


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


async def get_current_user(
    db: Annotated[Session, Depends(get_db)],
    token: Annotated[str, Depends(oauth2_scheme)],
):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        pennkey: str = payload.get("sub")  # type: ignore
        if pennkey is None:
            raise credentials_exception
        token_data = TokenData(pennkey=pennkey)
    except JWTError:
        raise credentials_exception
    user = read_user(db, pennkey=token_data.pennkey)  # type: ignore
    if user is None:
        raise credentials_exception
    return user
