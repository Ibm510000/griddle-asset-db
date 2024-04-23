import bcrypt
from fastapi import HTTPException
from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from schemas.models import UserCreate

from database.models import User


def read_users(db: Session, query: str | None = None, offset: int = 0):
    q = select(User).offset(offset).limit(40)

    if query is not None:
        q = q.filter(
            or_(
                User.first_name.ilike(f"%{query}%"),
                User.last_name.ilike(f"%{query}%"),
                User.pennkey.ilike(f"%{query}%"),
            )
        )

    try:
        return db.execute(q).scalars().all()
    except Exception as e:
        raise e


# Create User
def create_user(db: Session, user: UserCreate):
    print("troll")
    hashed_password = bcrypt.hashpw(user.password.encode("utf-8"), bcrypt.gensalt())

    db_user = User(
        pennkey=user.pennkey,
        hashed_password=hashed_password,
        first_name=user.first_name,
        last_name=user.last_name,
        school=user.school,
    )

    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)

    except Exception as e:
        db.rollback()
        print(e)
        raise HTTPException(status_code=500, detail="User could not be created")

    return db_user


def read_user_exists(db: Session, pennkey: str):
    query = select(User).filter(User.pennkey == pennkey).limit(1)
    result = db.execute(query).scalars().first()

    return result is not None


def read_user(db: Session, pennkey: str):
    query = select(User).filter(User.pennkey == pennkey).limit(1)
    user = db.execute(query).scalars().first()

    if user is None:
        return None

    return user


def authenticate_user(db: Session, pennkey: str, password: str):
    user = read_user(db, pennkey)
    if user is None:
        return None

    if not bcrypt.checkpw(password.encode("utf-8"), user.hashed_password):
        return None

    return user
