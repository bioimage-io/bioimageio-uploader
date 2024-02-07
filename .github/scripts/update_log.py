import argparse
from typing import Optional
import datetime
from loguru import logger

from s3_client import create_client

def create_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser()
    parser.add_argument("model_name", help="Model name")
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
    model_name = args.model_name
    category = args.category
    summary = args.summary
    version = args.version
    add_log_entry(model_name, category, summary, version=version)

def add_log_entry(model_name, category, summary, version=None):
    timenow = datetime.datetime.now().isoformat()
    client = create_client()
    logger.info("Updating log for {} with category {} and summary",
                model_name,
                category,
                summary)

    if version is None:
        version = client.get_unpublished_version(model_name)
        logger.info("Version detected: {}", version)
    else:
        logger.info("Version requested: {}", version)
    log = client.get_log(model_name, version)

    if category not in log:
        log[category] = []
    log[category].append({"timestamp": timenow, "log": summary})
    client.put_log(model_name, version, log)


if __name__ == "__main__":
    main()
