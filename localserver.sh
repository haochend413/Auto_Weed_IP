echo "Starting local server"
cd server
source venv/bin/activate
uvicorn main:app --reload 