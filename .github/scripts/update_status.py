import datetime
from typing import Optional

from loguru import logger
from s3_client import create_client, version_from_resource_path_or_s3
from typer import Argument, run
from typing_extensions import Annotated


def update_status(
    resource_path: Annotated[str, Argument(help="resource_id/version")],
    message: Annotated[str, Argument(help="status message")],
    step: Annotated[
        Optional[int], Argument(help="optional step in multi-step process")
    ] = None,
    num_steps: Annotated[int, Argument(help="total steps of multi-step process")] = 6,
):
    assert step is None or step <= num_steps, (step, num_steps)
    timenow = datetime.datetime.now().isoformat()
    client = create_client()
    logger.info(
        "Updating status for {} with text {} [steps={}, num_steps={}]",
        resource_path,
        message,
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
    status["last_message"] = message
    status["messages"].append({"timestamp": timenow, "text": message})
    client.put_status(resource_path, version, status)


if __name__ == "__main__":
    run(update_status)
