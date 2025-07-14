echo "Starting local server"
cd server
source venv/bin/activate
uvicorn main:app --host 0.0.0.0 --reload # use --reload flag for automatic reload;  