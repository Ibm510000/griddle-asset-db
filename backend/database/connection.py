from settings import DATABASE_URL

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


engine = create_engine(DATABASE_URL, connect_args={})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
