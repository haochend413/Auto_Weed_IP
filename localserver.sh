echo "Starting local server"
cd server
source venv/bin/activate
# mkcert will not work for distribution. 
uvicorn main:app \
    --host 0.0.0.0 \
    --port 8000 \
    --ssl-certfile ./certs/192.168.10.252.pem \
    --ssl-keyfile ./certs/192.168.10.252-key.pem \
    --reload