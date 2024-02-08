import argparse
import io
import traceback
import urllib.request
import zipfile
from typing import Optional

from s3_client import create_client
from update_status import update_status


def create_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser()
    parser.add_argument("resource_path", help="Resource ID")
    parser.add_argument(
        "package_url",
        help="Resource package URL (needs to be publicly accessible or presigned)",
    )
    return parser


def get_args(argv: Optional[list] = None):
    """
    Get command-line arguments
    """
    parser = create_parser()
    return parser.parse_args(argv)


def main():
    args = get_args()
    resource_path = args.resource_path
    package_url = args.package_url
    try:
        unzip_from_url(resource_path, package_url)
    except Exception:
        err_message = f"An error occurred in the CI:\n {traceback.format_exc()}"
        print(err_message)
        update_status(resource_path, {"status": err_message})
        raise


def unzip_from_url(resource_path, package_url):
    filename = "model.zip"
    client = create_client()

    versions = client.check_versions(resource_path)
    if len(versions) == 0:
        version = "1"

    else:
        # TODO handle if a staging version exists vs
        # if only published version exist
        raise NotImplementedError("Updating/publishing new version not implemented")

    # TODO: Need to make sure status is staging
    status = client.get_status(resource_path, version)
    status_str = status.get("status", "missing-status")
    if status_str != "staging":
        raise ValueError(
            "Model {} at version {} is status: {}", resource_path, version, status_str
        )

    # Download the model zip file
    remotezip = urllib.request.urlopen(package_url)
    # Unzip the zip file
    zipinmemory = io.BytesIO(remotezip.read())
    zipobj = zipfile.ZipFile(zipinmemory)
    for filename in zipobj.namelist():
        # file_object = io.BytesIO(zipobj)
        file_object = zipobj.open(filename)
        path = f"{resource_path}/{version}/files/{filename}"

        client.put(
            path,
            file_object,
        )


if __name__ == "__main__":
    main()
