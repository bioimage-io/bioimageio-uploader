import datetime
from typing import Annotated

from loguru import logger
from s3_client import create_client, version_from_resource_path_or_s3
from typer import Argument, run


def add_log_entry(
    resource_path: Annotated[str, Argument(help="resource_id/version")],
    category: Annotated[str, Argument(help="log category")],
    summary: Annotated[str, Argument(help="log message")],
):
    timenow = datetime.datetime.now().isoformat()
    client = create_client()
    logger.info(
        "Updating log for {} with category {} and summary",
        resource_path,
        category,
        summary,
    )

    resource_path, version = version_from_resource_path_or_s3(resource_path)
    log = client.get_log(resource_path, version)

    if category not in log:
        log[category] = []
    log[category].append({"timestamp": timenow, "log": summary})
    client.put_log(resource_path, version, log)


if __name__ == "__main__":
    run(add_log_entry)
