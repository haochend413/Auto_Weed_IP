#!/bin/bash

cd server
# setup folders if non-exist
echo "Setting up necessary folders..."
folders=("raw_upload" "processed")
for folder in "${folders[@]}"; do
  if [ ! -d "$folder" ]; then
    mkdir "$folder"
  fi
done

echo "Activating virtual environment..."
source venv/bin/activate
# mkcert will not work for distribution.
echo "Starting local server..."
uvicorn main:app \
    --host 0.0.0.0 \
    --port 8000 \
    --reload

