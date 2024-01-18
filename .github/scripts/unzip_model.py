import argparse
import io
import os
import traceback
from typing import Optional
import urllib.request
import zipfile

from minio import Minio  # type: ignore

from update_status import update_status


def create_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser()
    parser.add_argument("model_name", help="Model name")
    parser.add_argument("model_zip_url", help="Model URL (needs to be publicly accessible or presigned)")
    return parser


def get_args(argv: Optional[list] = None):
    """
    Get command-line arguments
    """
    parser = create_parser()
    return parser.parse_args(argv)


def main():
    args = get_args()
    model_name = args.model_name
    model_zip_url = args.model_zip_url
    try:
        unzip_from_url(model_name, model_zip_url)
    except Exception:
        err_message = f"An error occurred in the CI:\n {traceback.format_exc()}"
        print(err_message)
        update_status(model_name, {'status' : err_message})
        raise

def unzip_from_url(model_name, model_zip_url):
    filename = "model.zip"
    s3_host = os.getenv("S3_HOST")
    s3_bucket = os.getenv("S3_BUCKET")
    s3_root_folder = os.getenv("S3_ROOT_FOLDER")
    s3_access_key_id = os.getenv("S3_ACCESS_KEY_ID")
    s3_secret_access_key = os.getenv("S3_SECRET_ACCESS_KEY")

    client = Minio(
        s3_host,
        access_key=s3_access_key_id,
        secret_key=s3_secret_access_key,
    )
    found = client.bucket_exists(s3_bucket)
    if not found:
        raise Exception("target bucket does not exist: {s3_bucket}")

    # Download the model zip file
    remotezip = urllib.request.urlopen(model_zip_url)
    # Unzip the zip file
    zipinmemory = io.BytesIO(remotezip.read())
    zipobj = zipfile.ZipFile(zipinmemory)
    for filename in zipobj.namelist():
        # file_object = io.BytesIO(zipobj)
        file_object = zipobj.open(filename)
        s3_path = f"{s3_root_folder}/{model_name}/{filename}"

        # For unknown length (ie without reading file into mem) give `part_size`
        client.put_object(
            s3_bucket,
            s3_path,
            file_object,
            length=-1,
            part_size=10*1024*1024,
            # length=len(status_message),
            # content_type="application/json",
        )


if __name__ == "__main__":
    main()
