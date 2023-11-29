#!/bin/sh 
curl -X PUT -H 'Content-Type: application/json' -d '{"status": "'"$2"'"}' "$1"  

