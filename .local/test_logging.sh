#!/bin/sh
SCRIPT_DIR="$( dirname -- "$( readlink -f -- "$0"; )"; )"

set -o allexport
source $SCRIPT_DIR/.env 
set +o allexport

DATE=$( date )
resource_name="willing-pig"
echo "Testing update_log on $resource_name"
python $SCRIPT_DIR/../.github/scripts/update_log.py $resource_name "ci_testing" "Adding a log at $DATE" 
 

