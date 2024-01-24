import os
import io
import argparse
from typing import Optional
import json
from minio import Minio  # type: ignore
# from minio.error import S3Error

def create_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser()
    parser.add_argument("model_name", help="Model name")
    parser.add_argument("status", help="Status")
    parser.add_argument("step", help="Step", nargs="?", default=0, type=int)
    parser.add_argument("num_steps", help="Status", nargs="?", default=0, type=int)
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
    step = args.step
    num_steps = args.num_steps
    status = args.status
    update_status(model_name, status, step, num_steps)


def update_status(model_name, status, step=None, num_steps=None):
    s3_host = os.getenv("S3_HOST")
    s3_bucket = os.getenv("S3_BUCKET")
    s3_root_folder = os.getenv("S3_FOLDER")
    s3_access_key_id = os.getenv("S3_ACCESS_KEY_ID")
    s3_secret_access_key = os.getenv("S3_SECRET_ACCESS_KEY")
    filename = "status.json"

    client = Minio(
        s3_host,
        access_key=s3_access_key_id,
        secret_key=s3_secret_access_key,
    )
    s3_path = f"{s3_root_folder}/{model_name}/{filename}"

    try:
        response = client.get_object(s3_bucket, s3_path)
        # Read data from response.
        status_message = json.load(response)
    except Exception:
        status_message = {"messages": []}
    finally:
        try:
            response.close()
            response.release_conn()
        except Exception:
            pass

    found = client.bucket_exists(s3_bucket)
    if not found:
        raise Exception("target bucket does not exist: {s3_bucket}")

    if step is not None:
        status_message["step"] = step
    if num_steps is not None:
        status_message["num_steps"] = num_steps
    status_message["last_message"] = status
    status_message["messages"].append(status)

    status_file_object = io.BytesIO(json.dumps(status_message).encode())

    client.put_object(
        s3_bucket,
        s3_path,
        status_file_object,
        length=len(status_message),
        content_type="application/json",
    )


if __name__ == "__main__":
    main()
