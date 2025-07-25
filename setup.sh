#!/bin/bash

set -e

echo "Setting up Python backend environment"
cd server

PYTHON_BIN="python3"
if ! command -v python3 &>/dev/null; then
  PYTHON_BIN="python3.11"
elif ! python3 -c 'import sys; exit(0) if sys.version_info >= (3,11) else exit(1)' ; then
  if command -v python3.11 &>/dev/null; then
    PYTHON_BIN="python3.11"
  else
    echo "Python 3.11 is required but not found."
    exit 1
  fi
fi

echo "Using $PYTHON_BIN"
$PYTHON_BIN -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
deactivate 
cd ..

echo "Setting up Go frontend environment"
cd client-cli
go mod tidy
cd ..

echo "=== Setup complete! ==="
echo ""
echo "To build and run the frontend CLI:"
echo "  cd frontend"
echo "  go build -o awd"
echo "  ./awd"