#!/bin/sh
# Updated to use S3 creds:
# S3_HOST
# S3_BUCKET
# S3_FOLDER
# S3_ACCESS_KEY_ID
# S3_SECRET_ACCESS_KEY
# First arg is now resource_id

FILENAME=status.json

RESOURCE_ID=$1
STATUS=$2

if [ -z "$RESOURCE_ID" ]; then
    printf '%s\n' "RESOURCE_ID is unset or empty" >&2;
    exit 1
fi
if [ -z "$S3_HOST" ]; then
    printf '%s\n' "S3_HOST is unset or empty" >&2;
    exit 1
fi
if [ -z "$S3_BUCKET" ]; then
    printf '%s\n' "S3_BUCKET is unset or empty" >&2;
    exit 1
fi
if [ -z "$S3_FOLDER" ]; then
    printf '%s\n' "S3_FOLDER is unset or empty" >&2;
    exit 1
fi
if [ -z "$S3_ACCESS_KEY_ID" ]; then
    printf '%s\n' "S3_ACCESS_KEY_ID is unset or empty" >&2;
    exit 1
fi
if [ -z "$S3_SECRET_ACCESS_KEY" ]; then
    printf '%s\n' "S3_SECRET_ACCESS_KEY is unset or empty" >&2;
    exit 1
fi


#curl -X PUT -H 'Content-Type: application/json' -d '{"status": "'"$2"'"}' "$1"

RESOURCE="/${S3_BUCKET}/${S3_FOLDER}/${RESOURCE_ID}/${FILENAME}"
CONTENT_TYPE="application/json"
DATE=`date -R`
_SIGNATURE="PUT\n\n${CONTENT_TYPE}\n${DATE}\n${RESOURCE}"
SIGNATURE=`echo -en ${_SIGNATURE} | openssl sha1 -hmac ${S3_SECRET_ACCESS_KEY} -binary | base64`

curl -X PUT -d '{"status": "'"$STATUS"'"}' \
          -H "Host: ${S3_HOST}" \
          -H "Date: ${DATE}" \
          -H "Content-Type: ${CONTENT_TYPE}" \
          -H "Authorization: AWS ${S3_ACCESS_KEY_ID}:${SIGNATURE}" \
          https://${S3_HOST}${RESOURCE}

