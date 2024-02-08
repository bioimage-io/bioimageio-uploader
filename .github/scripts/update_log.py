import argparse
import datetime
from typing import Optional

from loguru import logger
from s3_client import create_client, version_from_resource_path_or_s3


def create_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser()
    parser.add_argument("resource_path", help="Resource name")
    parser.add_argument("category", help="Log category")
    parser.add_argument("summary", help="Log summary")
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
    category = args.category
    summary = args.summary
    add_log_entry(resource_path, category, summary)


def add_log_entry(resource_path, category, summary):
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
    main()
