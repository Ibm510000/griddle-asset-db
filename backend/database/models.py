from datetime import datetime
from typing import List, Literal, Optional, get_args
from uuid import UUID, uuid4

from sqlalchemy import Enum, ForeignKey, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, declarative_base, relationship

Base = declarative_base()


def random_uuid():
    return str(uuid4())


class Asset(Base):
    __tablename__ = "assets"

    # TODO: move these to Mapped[str] for easier manipulation
    id: Mapped[UUID] = mapped_column(
        Uuid(as_uuid=True), primary_key=True, insert_default=uuid4
    )
    asset_name: Mapped[str]

    author_pennkey: Mapped[str] = mapped_column(
        ForeignKey("users.pennkey", name="FK_user_asset")
    )
    author: Mapped["User"] = relationship(back_populates="assets")

    keywords: Mapped[str]
    image_uri: Mapped[Optional[str]]

    versions: Mapped[List["Version"]] = relationship(back_populates="asset")


class Version(Base):
    __tablename__ = "versions"

    asset_id: Mapped[UUID] = mapped_column(
        ForeignKey("assets.id", name="FK_asset_version"), primary_key=True
    )
    asset: Mapped["Asset"] = relationship(back_populates="versions")
    semver: Mapped[str] = mapped_column(insert_default="0.1", primary_key=True)

    author_pennkey: Mapped[str] = mapped_column(
        ForeignKey("users.pennkey", name="FK_user_version")
    )
    author: Mapped["User"] = relationship(back_populates="versions")

    date: Mapped[datetime] = mapped_column(insert_default=func.now())
    message: Mapped[str]
    file_key: Mapped[str]


# school for user model
School = Literal["sas", "seas", "wharton"]


# user class
class User(Base):
    __tablename__ = "users"

    pennkey: Mapped[str] = mapped_column(primary_key=True)
    hashed_password: Mapped[bytes]

    first_name: Mapped[str]
    last_name: Mapped[str]
    school: Mapped[School] = mapped_column(
        Enum(
            *get_args(School),
            name="school",
            create_constraint=True,
            validate_strings=True
        )
    )
    picture_uri: Mapped[Optional[str]]

    assets: Mapped[List[Asset]] = relationship(back_populates="author")
    versions: Mapped[List[Version]] = relationship(back_populates="author")
