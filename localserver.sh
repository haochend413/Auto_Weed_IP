#!/bin/bash

echo "Starting local server"
cd server
# setup folders if non-exist
folders=("raw_upload" "processed")

for folder in "${folders[@]}"; do
  if [ ! -d "$folder" ]; then
    mkdir "$folder"
  fi
done
source venv/bin/activate
# mkcert will not work for distribution.
uvicorn main:app \
    --host 0.0.0.0 \
    --port 8000 \
    --reload

