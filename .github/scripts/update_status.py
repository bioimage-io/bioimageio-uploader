import argparse
from typing import Optional
import datetime
from loguru import logger

from s3_client import create_client

def create_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser()
    parser.add_argument("model_name", help="Model name")
    parser.add_argument("status", help="Status")
    parser.add_argument("--version", help="Version")
    parser.add_argument("--step", help="Step", default=0, type=int)
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
    model_name = args.model_name
    version = args.version
    step = args.step
    num_steps = args.num_steps
    status = args.status
    update_status(model_name, status, version=version, step=step, num_steps=num_steps)


def update_status(model_name, status_text, version=None, step=None, num_steps=None):
    timenow = datetime.datetime.now().isoformat()
    client = create_client()
    logger.info("Updating status for {} with text {} [steps={}, num_steps={}]",
                model_name,
                status_text,
                step,
                num_steps)

    if version is None:
        version = client.get_unpublished_version(model_name)
        logger.info("Version detected: {}", version)
    else:
        logger.info("Version requested: {}", version)
    status = client.get_status(model_name, version)

    if "messages" not in status:
        status["messages"] = []
    if step is not None:
        status["step"] = step
    if num_steps is not None:
        status["num_steps"] = num_steps
    status["last_message"] = status_text
    status["messages"].append({"timestamp": timenow, "text": status_text})
    client.put_status(model_name, version, status)



if __name__ == "__main__":
    main()
