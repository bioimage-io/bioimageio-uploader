import argparse
import io
import traceback
from typing import Optional
import urllib.request
import zipfile


from update_status import update_status
from s3_client import create_client


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
    client = create_client()

    versions = client.check_versions(model_name)
    if len(versions) == 0:
        version = "1"

    else:
        # TODO handle if a staging version exists vs
        # if only published version exist
        raise NotImplementedError("Updating/publishing new version not implemented")

    # TODO: Need to make sure status is staging
    status = client.get_status(model_name, version)
    status_str = status.get("status", "missing-status")
    if status_str != "staging":
        raise ValueError(
                "Model {} at version {} is status: {}",
                model_name, version, status_str)

    # Download the model zip file
    remotezip = urllib.request.urlopen(model_zip_url)
    # Unzip the zip file
    zipinmemory = io.BytesIO(remotezip.read())
    zipobj = zipfile.ZipFile(zipinmemory)
    for filename in zipobj.namelist():
        # file_object = io.BytesIO(zipobj)
        file_object = zipobj.open(filename)
        path = f"{model_name}/{version}/{filename}"

        client.put(
            path,
            file_object,
        )


if __name__ == "__main__":
    main()
