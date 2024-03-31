from settings import DATABASE_URI, is_dev

from fastapi import FastAPI
from fastapi.concurrency import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from alembic.config import Config
from alembic import command

from routers.api_v1 import router as api_v1_router
from util.sqladmin import config_sqladmin


def init_db():
    alembic_cfg = Config("alembic.ini")
    alembic_cfg.set_main_option("sqlalchemy.url", DATABASE_URI)
    command.upgrade(alembic_cfg, "head")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Pre-startup code
    init_db()
    yield
    # Post-shutdown code
    pass


app = FastAPI(lifespan=lifespan)

# TODO: figure out allowing any electron frontend
origins = ["http://localhost:5173"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if is_dev:
    config_sqladmin(app)

app.include_router(api_v1_router)
