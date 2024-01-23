import argparse
from io import BytesIO
import logging
import os
from pathlib import Path
from urllib.parse import urlparse
from typing import Optional
from datetime import timedelta
from dataclasses import dataclass, field

import requests  # type: ignore
from minio import Minio
from loguru import logger  # type: ignore


GOOD_STATUS_CODES = (
    200,  # OK 	Request succeeded. Response included. Usually sent for GET/PUT/PATCH requests.
    201,  # Created 	Request succeeded. Response included. Usually sent for POST requests
    202,  # Accepted 	Request succeeded. Response included. Usually sent for POST requests,
          # where background processing is needed to fulfill the request.
    204,  # No Content 	Request succeeded. No response included. Usually sent for DELETE requests.
)
ACCESS_TOKEN = os.getenv('ZENODO_API_ACCESS_TOKEN')
S3_HOST = os.getenv('S3_HOST')
S3_ACCESS_KEY = os.getenv('S3_ACCESS_KEY_ID')
S3_SECRET_KEY = os.getenv('S3_SECRET_ACCESS_KEY')
S3_BUCKET = os.getenv('S3_BUCKET')
S3_FOLDER = os.getenv('S3_FOLDER')
ZENODO_URL = os.getenv('ZENODO_HOST')

ROOT_URL='https://sandbox.zenodo.org'
ROOT_URL='https://zenodo.org'

logging.basicConfig()
logging.getLogger().setLevel(logging.DEBUG)
requests_log = logging.getLogger("requests.packages.urllib3")
requests_log.setLevel(logging.DEBUG)
requests_log.propagate = True


def create_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser()
    parser.add_argument("--model_name", help="Model name", required=True)
    return parser


def get_args(argv: Optional[list] = None):
    """
    $Get command-line arguments
    """
    parser = create_parser()
    return parser.parse_args(argv)


def main():
    args = get_args()
    headers = {"Content-Type": "application/json"}
    params = {'access_token': ACCESS_TOKEN}

    # print("TOKEN", ACCESS_TOKEN)
    # print("S3_HOST", S3_HOST)
    # print("S3_BUCKET", S3_BUCKET)
    # print("model_name", args.model_name)

    # List the files at the model URL
    file_urls = get_file_urls(
            S3Settings(
                host=S3_HOST,
                bucket=S3_BUCKET,
                prefix=f'{S3_FOLDER}/{args.model_name}',
                access_key=S3_ACCESS_KEY,
                secret_key=S3_SECRET_KEY))
    logger.info("Using file URLs:\n{}", '\n'.join((str(obj) for obj in file_urls)))

    # Create empty deposition
    response = requests.post(
            f'{ROOT_URL}/api/deposit/depositions',
            params=params,
            json={},
            headers=headers)
    assert response.status_code in GOOD_STATUS_CODES, "Failed to create deposition"

    # Use the bucket link
    bucket_url = response.json()["links"]["bucket"]

    # PUT files to the deposition
    for file_url in file_urls:
        response = put_file_from_url(file_url, bucket_url, params)
        assert response.status_code in GOOD_STATUS_CODES, f"Failed to PUT file from {file_url}"


@dataclass
class S3Settings:
    host: str
    bucket: str
    prefix: str
    access_key: str = field(repr=False)
    secret_key: str = field(repr=False)


def get_file_urls(s3_settings: S3Settings, exclude_files=("status.json")) -> list[str]:
    """Checks an S3 'folder' for its list of files"""
    logger.debug("Getting file list from {}", s3_settings)
    client = Minio(
        s3_settings.host,
        access_key=s3_settings.access_key,
        secret_key=s3_settings.secret_key,
    )
    objects = client.list_objects(s3_settings.bucket, prefix=s3_settings.prefix, recursive=True)
    file_urls : list[str] = []
    for obj in objects:
        if obj.is_dir:
            continue
        filename = Path(obj.object_name).name
        if filename in exclude_files:
            continue
        # Option 1:
        url = client.get_presigned_url(
            "GET",
            obj.bucket_name,
            obj.object_name,
            expires=timedelta(hours=1),
        )
        file_urls.append(url)
        # Option 2: Work with minio.datatypes.Object directly
    return file_urls


def put_file_from_url(file_url: str, destination_url: str, params: dict) -> dict:
    """Gets a remote file and pushes it up to a destination"""
    # TODO: Can we use stream=True and pass response.raw into requests.put?
    filename = Path(urlparse(file_url).path).name
    # response = requests.get(file_url)
    # file_like = BytesIO(response.content)
    # return put_file(file_like, filename, destination_url, params)
    response = requests.get(file_url, stream=True)
    return put_file(response.raw, filename, destination_url, params)



def put_file_path(path: str|Path, url: str, params: dict) -> dict:
    """PUT file to url with params, given a file-path"""
    path = Path(path)
    filename = path.name
    with path.open(mode="rb") as fileobj:
        response = put_file(fileobj, filename, url, params)
    return response


def put_file(file_object, name, url, params):
    response = requests.put(
        "%s/%s" % (url, name),
        data=file_object,
        params=params,
    )
    return response


if __name__ == "__main__":
    main()


