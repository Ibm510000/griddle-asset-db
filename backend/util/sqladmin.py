from fastapi import FastAPI
from sqladmin import Admin, ModelView

from database.connection import engine
from database.models import Asset, Version


class AssetAdmin(ModelView, model=Asset):
    column_list = [
        Asset.asset_name,
        Asset.author_pennkey,
        Asset.keywords,
        Asset.versions,
    ]


class VersionAdmin(ModelView, model=Version):
    column_list = [
        Version.semver,
        Version.message,
        Version.author_pennkey,
        Version.date,
        Version.file_key,
        Version.asset,
    ]


def config_sqladmin(app: FastAPI):
    admin = Admin(app, engine)
    admin.add_view(AssetAdmin)
    admin.add_view(VersionAdmin)
