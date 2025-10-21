#!/bin/bash
# Continuous monitoring for evaluation progress

set -e

INTERVAL=30
LOG_FILE="logs/evaluation_monitor.log"

echo "Starting continuous monitoring (interval: $INTERVAL seconds)"

while true; do
  echo "\n=== $(date) ===" >> $LOG_FILE
  
  # Check queue status
  echo "Queue Status:" >> $LOG_FILE
  ollama-queue_getQueueInfo >> $LOG_FILE 2>&1
  
  # Check system resources
  echo "\nSystem Resources:" >> $LOG_FILE
  free -h >> $LOG_FILE
  uptime >> $LOG_FILE
  
  if command -v nvidia-smi &> /dev/null; then
    echo "\nGPU Status:" >> $LOG_FILE
    nvidia-smi --query-gpu=utilization.gpu,memory.used,memory.total --format=csv,noheader >> $LOG_FILE
  fi
  
  # Generate status report
  node scripts/monitor_evaluation.cjs
  
  sleep $INTERVAL
done
