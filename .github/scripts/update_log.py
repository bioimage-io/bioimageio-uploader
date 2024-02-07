import argparse
import datetime
from typing import Optional

from loguru import logger
from s3_client import create_client


def create_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser()
    parser.add_argument("resource_path", help="Model name")
    parser.add_argument("category", help="Log category")
    parser.add_argument("summary", help="Log summary")
    parser.add_argument("--version", help="Version")
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
    version = args.version
    add_log_entry(resource_path, category, summary, version=version)


def add_log_entry(resource_path, category, summary, version=None):
    timenow = datetime.datetime.now().isoformat()
    client = create_client()
    logger.info(
        "Updating log for {} with category {} and summary",
        resource_path,
        category,
        summary,
    )

    if version is None:
        version = client.get_unpublished_version(resource_path)
        logger.info("Version detected: {}", version)
    else:
        logger.info("Version requested: {}", version)
    log = client.get_log(resource_path, version)

    if category not in log:
        log[category] = []
    log[category].append({"timestamp": timenow, "log": summary})
    client.put_log(resource_path, version, log)


if __name__ == "__main__":
    main()
