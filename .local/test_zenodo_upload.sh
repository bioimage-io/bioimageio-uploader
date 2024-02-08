#!/bin/sh
SCRIPT_DIR="$( dirname -- "$( readlink -f -- "$0"; )"; )"

set -o allexport
source $SCRIPT_DIR/.env 
set +o allexport

python $SCRIPT_DIR/../.github/scripts/upload_model_to_zenodo.py --help --resource_name=willing-pig 
