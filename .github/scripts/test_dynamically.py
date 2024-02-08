import traceback
from functools import partialmethod
from pathlib import Path
from typing import Optional

import typer
from bioimageio.spec import load_raw_resource_description
from bioimageio.spec.shared import yaml
from update_log import add_log_entry

try:
    from tqdm import tqdm
except ImportError:
    pass
else:
    tqdm.__init__ = partialmethod(tqdm.__init__, disable=True)  # silence tqdm


def test_summary_from_exception(name: str, exception: Exception):
    return dict(
        name=name,
        status="failed",
        error=str(exception),
        traceback=traceback.format_tb(exception.__traceback__),
    )


def test_dynamically(
    descr_id: str,
    source: str,
    weight_format: Optional[str] = typer.Argument(
        ..., help="weight format to test model with."
    ),
    create_env_outcome: str = "success",
):
    if weight_format is None:
        # no dynamic tests for non-model resources yet...
        return

    if create_env_outcome == "success":
        try:
            from bioimageio.core.resource_tests import test_resource
        except Exception as e:
            summaries = [
                test_summary_from_exception(
                    "import test_resource from test environment", e
                )
            ]
        else:
            try:
                rdf = yaml.load(source)
                test_kwargs = (
                    rdf.get("config", {})
                    .get("bioimageio", {})
                    .get("test_kwargs", {})
                    .get(weight_format, {})
                )
            except Exception as e:
                summaries = [test_summary_from_exception("check for test kwargs", e)]
            else:
                try:
                    rd = load_raw_resource_description(source)
                    summaries = test_resource(
                        rd, weight_format=weight_format, **test_kwargs
                    )
                except Exception as e:
                    summaries = [test_summary_from_exception("call 'test_resource'", e)]

    else:
        env_path = Path(f"conda_env_{weight_format}.yaml")
        if env_path.exists():
            error = "Failed to install conda environment:\n" + env_path.read_text()
        else:
            error = f"Conda environment yaml file not found: {env_path}"

        summaries = [
            dict(name="install test environment", status="failed", error=error)
        ]

    add_log_entry(descr_id, "validation_summaries", summaries)


if __name__ == "__main__":
    typer.run(test_dynamically)
