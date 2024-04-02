from contextlib import contextmanager
import os
from pathlib import Path
import shutil
from tempfile import NamedTemporaryFile, TemporaryDirectory, TemporaryFile, gettempdir
from fastapi import UploadFile

from util.s3 import assets_bucket
from botocore.exceptions import NoCredentialsError


def save_upload_file_temp(upload_file: UploadFile) -> Path | None:
    if (upload_file.filename is None) or (upload_file.filename == ""):
        return None
    try:
        suffix = Path(upload_file.filename).suffix
        with NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            shutil.copyfileobj(upload_file.file, tmp)
            temp_path = Path(tmp.name)
    finally:
        upload_file.file.close()
    return temp_path


def temp_s3_download(file_key: str):
    temp_path = Path(gettempdir()) / file_key
    assets_bucket.download_file(file_key, str(temp_path))

    def cleanup():
        try:
            os.remove(temp_path)
        except FileNotFoundError:
            pass

    return (temp_path, cleanup)
