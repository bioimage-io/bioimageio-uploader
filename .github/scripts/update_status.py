import os
import io
import argparse
from typing import Optional
import json
from minio import Minio
# from minio.error import S3Error

def create_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser()
    parser.add_argument("model_name", help="Model name")
    parser.add_argument("status", help="Status")
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
    filename = "status.json"
    status = args.status
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

    status_message = json.dumps({"status": status}).encode()

    status_file_object = io.BytesIO(status_message)
    s3_path = f"{s3_root_folder}/{model_name}/{filename}"

    client.put_object(
        s3_bucket,
        s3_path,
        status_file_object,
        length=len(status_message),
        content_type="application/json",
    )


if __name__ == "__main__":
    main()
