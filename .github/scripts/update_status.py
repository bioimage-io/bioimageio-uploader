import argparse
import datetime
from typing import Optional

from loguru import logger
from s3_client import create_client, version_from_resource_path_or_s3

def create_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser()
    parser.add_argument("resource_path", help="Model name")
    parser.add_argument("status", help="Status")
    parser.add_argument("step", help="Step", default=0, type=int, nargs="?")
    parser.add_argument("--num_steps", help="Status", default=0, type=int)
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
    step = args.step
    num_steps = args.num_steps
    status = args.status
    update_status(resource_path, status, step=step, num_steps=num_steps)


def update_status(resource_path: str, status_text: str, step: Optional[int]=None, num_steps: int = 6):
    assert step is None or step <= num_steps
    timenow = datetime.datetime.now().isoformat()
    client = create_client()
    logger.info(
        "Updating status for {} with text {} [steps={}, num_steps={}]",
        resource_path,
        status_text,
        step,
        num_steps,
    )

    resource_path, version = version_from_resource_path_or_s3(resource_path, client)
    status = client.get_status(resource_path, version)

    if "messages" not in status:
        status["messages"] = []
    if step is not None:
        status["step"] = step
    if num_steps is not None:
        status["num_steps"] = num_steps
    status["last_message"] = status_text
    status["messages"].append({"timestamp": timenow, "text": status_text})
    client.put_status(resource_path, version, status)


if __name__ == "__main__":
    main()
