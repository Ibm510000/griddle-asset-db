import os
from os.path import join, dirname
from dotenv import load_dotenv

dotenv_path = join(dirname(__file__), ".env")
load_dotenv(dotenv_path, override=False)

is_prod = os.environ.get("PRODUCTION") == "true"
is_dev = not is_prod

if is_dev:
    dev_dotenv_path = join(dirname(__file__), ".env.development")
    load_dotenv(dev_dotenv_path, override=False)

DATABASE_URL = os.getenv("DATABASE_URL") or "unset"
if DATABASE_URL == "unset":
    raise Exception("DATABASE_URL is not set")
