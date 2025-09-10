#!/bin/bash


OLLAMA_PORT=${OLLAMA_PORT:-11434}
FASTAPI_PORT=${FASTAPI_PORT:-8821}
MODEL_NAME=${MODEL_NAME:-theonemarket}
BASE_MODEL=${BASE_MODEL:-"gemma3:27b-it-qat"} 
MODEL_FILE_PATH=${MODEL_FILE_PATH:-"/Modelfile_qat.txt"} 

echo "--- Configuration ---"
echo "Ollama Port: $OLLAMA_PORT"
echo "FastAPI Port: $FASTAPI_PORT"
echo "Model Name: $MODEL_NAME"
echo "Base Model: $BASE_MODEL"
echo "Model File Path: $MODEL_FILE_PATH"
echo "---------------------"


echo "Starting Ollama server on port $OLLAMA_PORT..."

ollama serve &
OLLAMA_PID=$!
echo "Ollama server started with PID $OLLAMA_PID"

echo "Waiting for Ollama server at http://localhost:$OLLAMA_PORT..."
WAIT_LIMIT=180 
WAIT_COUNT=0
while ! curl --output /dev/null --silent --head --fail http://localhost:$OLLAMA_PORT; do
  if [ $WAIT_COUNT -ge $WAIT_LIMIT ]; then
    echo "Ollama server did not start within $WAIT_LIMIT seconds. Exiting."
    kill $OLLAMA_PID 
    exit 1
  fi
  echo "Waiting for Ollama server (attempt $((WAIT_COUNT/5 + 1)))..."
  sleep 5
  WAIT_COUNT=$((WAIT_COUNT + 5))
done
echo "Ollama server is up on port $OLLAMA_PORT."


echo "Creating custom model $MODEL_NAME using $MODEL_FILE_PATH..."
ollama create $MODEL_NAME -f $MODEL_FILE_PATH
echo "Custom model $MODEL_NAME created."

echo "Starting FastAPI application on port $FASTAPI_PORT..."
cd /app
uvicorn transcribe_app:app --host 0.0.0.0 --port $FASTAPI_PORT &
FASTAPI_PID=$!
echo "FastAPI app started with PID $FASTAPI_PID"
cd /

echo "Entrypoint script finished initialization. Container will keep running."

wait $OLLAMA_PID
wait $FASTAPI_PID
echo "Background processes finished. Exiting entrypoint script."
