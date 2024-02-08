#!/bin/sh
SCRIPT_DIR="$( dirname -- "$( readlink -f -- "$0"; )"; )"

set -o allexport
source $SCRIPT_DIR/.env 
set +o allexport

DATE=$( date )
resource_path="willing-pig"
echo "Testing update_log on $resource_path" 
python $SCRIPT_DIR/../.github/scripts/validate_format.py "$resource_path" 
 

