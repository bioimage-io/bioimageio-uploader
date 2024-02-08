import io
import json
import os
from dataclasses import dataclass, field
from datetime import timedelta
from pathlib import Path
from typing import Iterator

# import requests  # type: ignore
from loguru import logger  # type: ignore
from minio import Minio  # type: ignore


@dataclass
class VersionStatus:
    version: str
    status: str
    path: str


@dataclass
class Client:
    host: str
    bucket: str
    prefix: str
    access_key: str = field(repr=False)
    secret_key: str = field(repr=False)
    _client: Minio = field(init=False, repr=False)

    def __post_init__(self):
        self._client = Minio(
            self.host,
            access_key=self.access_key,
            secret_key=self.secret_key,
        )
        found = self.bucket_exists(self.bucket)
        if not found:
            raise Exception("target bucket does not exist: {self.bucket}")
        logger.debug("Created S3-Client: {}", self)

    def bucket_exists(self, bucket):
        return self._client.bucket_exists(bucket)

    def put(
        self, path, file_object, length=-1, content_type="application/octet-stream"
    ):
        # For unknown length (ie without reading file into mem) give `part_size`
        part_size = 0
        if length == -1:
            part_size = 10 * 1024 * 1024
        path = f"{self.prefix}/{path}"
        self._client.put_object(
            self.bucket,
            path,
            file_object,
            length=length,
            part_size=part_size,
            # content_type="application/json",
        )

    def get_file_urls(
        self,
        path="",
        exclude_files=("status.json"),
        lifetime=timedelta(hours=1),
    ) -> list[str]:
        """Checks an S3 'folder' for its list of files"""
        logger.debug("Getting file list using {}, at {}", self, path)
        path = f"{self.prefix}/{path}"
        objects = self._client.list_objects(self.bucket, prefix=path, recursive=True)
        file_urls: list[str] = []
        for obj in objects:
            if obj.is_dir:
                continue
            filename = Path(obj.object_name).name
            if filename in exclude_files:
                continue
            # Option 1:
            url = self._client.get_presigned_url(
                "GET",
                obj.bucket_name,
                obj.object_name,
                expires=lifetime,
            )
            file_urls.append(url)
            # Option 2: Work with minio.datatypes.Object directly
        return file_urls

    def ls(self, path, only_folders=False, only_files=False) -> Iterator[str]:
        """
        List folder contents, non-recursive, ala `ls`
        but no "." or ".."
        """
        # path = str(Path(self.prefix, path))
        path = f"{self.prefix}/{path}"
        logger.debug("Running ls at path: {}", path)
        objects = self._client.list_objects(self.bucket, prefix=path, recursive=False)
        for obj in objects:
            if only_files and obj.is_dir:
                continue
            if only_folders and not obj.is_dir:
                continue
            yield Path(obj.object_name).name

    def load_file(self, path) -> str:
        """Load file from S3"""
        path = f"{self.prefix}/{path}"
        try:
            response = self._client.get_object(self.bucket, path)
            content = response.read()
        except Exception:
            logger.critical("Failed to get object at path {}", path)
            logger.critical("Using client: {}", self)
            raise
        try:
            response.close()
            response.release_conn()
        except Exception:
            pass
        return content

        # url = self.client.get_presigned_url(
        # "GET",
        # self.bucket,
        # str(Path(self.prefix, path)),
        # expires=timedelta(minutes=10),
        # )
        # response = requests.get(url)
        # return response.content

    def check_versions(self, resource_path: str) -> Iterator[VersionStatus]:
        """
        Check model repository for version of model-name.

        Returns dictionary of version-status pairs.
        """
        logger.debug("Checking versions for {}", resource_path)
        version_folders = self.ls(f"{resource_path}/", only_folders=True)

        # For each folder get the contents of status.json
        for version in version_folders:

            yield self.get_version_status(resource_path, version)

    def get_unpublished_version(self, resource_path: str) -> str:
        """Get the unpublisted version"""
        versions = list(self.check_versions(resource_path))
        if len(versions) == 0:
            return "1"
        unpublished = [version for version in versions if version.status == "staging"]
        if len(unpublished) == 0:
            # Only published version exist, start a new one
            return f"{len(unpublished) + 1}"
        if len(unpublished) > 1:
            raise ValueError("Opps! We seem to have > 1 staging versions!!")
        return unpublished[0].version

    def get_version_status(self, resource_path: str, version: str) -> VersionStatus:
        status = self.get_status(resource_path, version)
        status_str = status.get("status", "status-field-unset")
        version_path = f"{resource_path}/{version}"
        return VersionStatus(version, status_str, version_path)

    def get_status(self, resource_path: str, version: str) -> dict:
        version_path = f"{resource_path}/{version}"
        logger.debug("resource_path: {}, version: {}", resource_path, version)
        status_path = f"{version_path}/status.json"
        logger.debug("Getting status using path {}", status_path)
        status = self.load_file(status_path)
        status = json.loads(status)
        return status

    def put_status(self, resource_path: str, version: str, status: dict):
        logger.debug(
            "Updating status for {}-{}, with {}", resource_path, version, status
        )
        contents = json.dumps(status).encode()
        file_object = io.BytesIO(contents)

        self.put(
            f"{resource_path}/{version}/status.json",
            file_object,
            length=len(contents),
            content_type="application/json",
        )

    def get_log(self, resource_path: str, version: str) -> dict:
        version_path = f"{resource_path}/{version}"
        logger.debug("resource_path: {}, version: {}", resource_path, version)
        path = f"{version_path}/log.json"
        logger.debug("Getting log using path {}", path)
        log = self.load_file(path)
        log = json.loads(log)
        return log

    def put_log(self, resource_path: str, version: str, log: dict):
        logger.debug("Updating log for {}-{}, with {}", resource_path, version, log)
        contents = json.dumps(log).encode()
        file_object = io.BytesIO(contents)

        self.put(
            f"{resource_path}/{version}/log.json",
            file_object,
            length=len(contents),
            content_type="application/json",
        )


def create_client() -> Client:
    """
    Creates a Minio client using env settings
    """
    host = os.getenv("S3_HOST")
    root_folder = os.getenv("S3_FOLDER")
    bucket = os.getenv("S3_BUCKET")
    access_key_id = os.getenv("S3_ACCESS_KEY_ID")
    secret_access_key = os.getenv("S3_SECRET_ACCESS_KEY")

    assert isinstance(host, str)
    assert isinstance(bucket, str)
    assert isinstance(root_folder, str)
    assert isinstance(access_key_id, str)
    assert isinstance(secret_access_key, str)

    client = Client(
        host=host,
        bucket=bucket,
        prefix=root_folder,
        access_key=access_key_id,
        secret_key=secret_access_key,
    )
    return client
