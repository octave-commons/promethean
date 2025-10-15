#!/bin/bash
# Ollama Batch Execution Script
# Execute optimized batches of model evaluations

set -e

BATCH_ID=${1:-1}
MAX_RETRIES=3
RETRY_DELAY=60

echo "Starting batch execution for batch $BATCH_ID"

# Function to execute job with retry
execute_job() {
  local job_name=$1
  local model=$2
  local task=$3
  local priority=$4
  local timeout=$5
  
  echo "Executing: $job_name ($model) - Priority: $priority"
  
  for ((i=1; i<=MAX_RETRIES; i++)); do
    if ollama-queue_submitJob \
      --jobName "$job_name" \
      --modelName "$model" \
      --jobType "generate" \
      --priority "$priority" \
      --timeout $timeout; then
      echo "✅ Job submitted successfully: $job_name"
      return 0
    else
      echo "❌ Job submission failed (attempt $i/$MAX_RETRIES): $job_name"
      if [ $i -lt $MAX_RETRIES ]; then
        echo "Waiting $RETRY_DELAY seconds before retry..."
        sleep $RETRY_DELAY
      fi
    fi
  done
  
  echo "🚨 Job failed after $MAX_RETRIES attempts: $job_name"
  return 1
}

# Load batch configuration
BATCH_CONFIG="scripts/batch_${BATCH_ID}.json"
if [ ! -f "$BATCH_CONFIG" ]; then
  echo "❌ Batch configuration not found: $BATCH_CONFIG"
  exit 1
fi

# Execute jobs in batch (parallel where appropriate)
echo "Loading batch configuration from $BATCH_CONFIG"
# Add actual job execution logic here based on batch config

echo "Batch $BATCH_ID execution completed"
