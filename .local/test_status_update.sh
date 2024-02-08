#!/bin/sh
SCRIPT_DIR="$( dirname -- "$( readlink -f -- "$0"; )"; )"

set -o allexport
source $SCRIPT_DIR/.env 
set +o allexport

DATE=$( date )
resource_name="willing-pig"
echo "Testing update-status on $resource_name"
python $SCRIPT_DIR/../.github/scripts/update_status.py $resource_name "Setting random status from testing at $DATE" 
 

