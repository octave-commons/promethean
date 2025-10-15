#!/bin/bash

echo "=== OLLAMA EVALUATION MONITOR ==="
echo "Timestamp: $(date)"
echo ""

# Queue status
echo "📊 QUEUE STATUS:"
ollama-queue_getQueueInfo | jq -r '
  "Total Jobs: \(.total)",
  "Pending: \(.pending)", 
  "Running: \(.running)",
  "Completed: \(.completed)",
  "Failed: \(.failed)",
  "Max Concurrent: \(.maxConcurrent)"
'
echo ""

# Currently running jobs
echo "🔄 RUNNING JOBS:"
ollama-queue_listJobs --status running --limit 10 | jq -r '
  .[] | "• \(.name) (\(.modelName)) - Priority: \(.priority)"
'
echo ""

# Recent completions
echo "✅ RECENT COMPLETIONS:"
ollama-queue_listJobs --status completed --limit 5 | jq -r '
  .[] | "• \(.name) - Completed: \(.completedAt)"
'
echo ""

# Failed jobs with error analysis
echo "❌ FAILED JOBS:"
ollama-queue_listJobs --status failed --limit 5 | jq -r '
  .[] | "• \(.name) (\(.modelName)) - Failed: \(.completedAt)"
'
echo ""

# System resources
echo "💻 SYSTEM RESOURCES:"
echo "Memory Usage:"
free -h | head -2
echo ""
echo "CPU Load:"
uptime
echo ""

if command -v nvidia-smi &> /dev/null; then
  echo "🎮 GPU STATUS:"
  nvidia-smi --query-gpu=name,memory.used,memory.total,utilization.gpu --format=csv,noheader,nounits
  echo ""
fi

echo "==============================="