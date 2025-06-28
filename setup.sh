#!/bin/bash

set -e

echo "Setting up Python backend environment"
cd server
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
deactivate 
cd ..

echo "Setting up Go frontend environment"
cd frontend
# Download Go modules
go mod tidy

cd ..

echo "=== Setup complete! ==="
echo ""

echo "To build and run the frontend CLI:"
echo "  cd frontend"
echo "  go build -o awd"
echo "  ./awd"