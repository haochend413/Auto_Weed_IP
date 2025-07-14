echo "Starting local server"
cd server
source venv/bin/activate
uvicorn main:app --reload # use --reload flag for automatic reload;  