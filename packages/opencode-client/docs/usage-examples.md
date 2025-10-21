# Usage Examples

This document provides comprehensive examples for using all commands in the OpenCode CLI client.

## Table of Contents

- [Global Options](#global-options)
- [Ollama Commands](#ollama-commands)
- [Session Commands](#session-commands)
- [PM2 Commands](#pm2-commands)
- [Advanced Workflows](#advanced-workflows)
- [Scripting Examples](#scripting-examples)

## Global Options

### Basic Usage

```bash
# Get help
opencode-client --help

# Show version
opencode-client --version

# Enable verbose output
opencode-client --verbose ollama list

# Disable colored output
opencode-client --no-color ollama list
```

### Environment Setup

```bash
# Set server URL
export OPENCODE_SERVER_URL="https://api.opencode.com"

# Set authentication token
export OPENCODE_AUTH_TOKEN="your-bearer-token"

# Set default model
export OPENCODE_DEFAULT_MODEL="llama2"

# Use with custom configuration
opencode-client --config /path/to/config.json ollama list
```

## Ollama Commands

### Job Management

#### Submit a Generation Job

```bash
# Basic generation job
opencode-client ollama submit \
  --model llama2 \
  --prompt "Explain quantum computing in simple terms"

# With custom options
opencode-client ollama submit \
  --model llama2 \
  --prompt "Write a Python function to calculate factorial" \
  --name "factorial-function" \
  --priority high \
  --temperature 0.7 \
  --num-predict 500

# With JSON output format
opencode-client ollama submit \
  --model llama2 \
  --prompt "List 3 programming languages" \
  --format json \
  --name "language-list"
```

#### Submit a Chat Job

```bash
# Simple chat
opencode-client ollama submit \
  --model llama2 \
  --job-type chat \
  --messages '[{"role": "user", "content": "Hello, how are you?"}]'

# Multi-turn conversation
opencode-client ollama submit \
  --model llama2 \
  --job-type chat \
  --messages '[
    {"role": "user", "content": "What is TypeScript?"},
    {"role": "assistant", "content": "TypeScript is a typed superset of JavaScript..."},
    {"role": "user", "content": "What are its main benefits?"}
  ]' \
  --name "typescript-discussion"

# Chat with system message
opencode-client ollama submit \
  --model llama2 \
  --job-type chat \
  --messages '[
    {"role": "system", "content": "You are a helpful programming assistant."},
    {"role": "user", "content": "Help me debug this code."}
  ]'
```

#### Submit an Embedding Job

```bash
# Single text embedding
opencode-client ollama submit \
  --model all-minilm \
  --job-type embedding \
  --input "This is a sample text for embedding"

# Multiple texts
opencode-client ollama submit \
  --model all-minilm \
  --job-type embedding \
  --input '["First text", "Second text", "Third text"]' \
  --name "batch-embeddings"
```

#### List and Monitor Jobs

```bash
# List all jobs
opencode-client ollama list

# List pending jobs only
opencode-client ollama list --status pending

# List with limit
opencode-client ollama list --limit 10

# List non-agent jobs
opencode-client ollama list --agent-only false

# List with verbose output
opencode-client --verbose ollama list
```

#### Check Job Status

```bash
# Check specific job
opencode-client ollama status job_1234567890

# Monitor job progress
watch -n 5 "opencode-client ollama status job_1234567890"
```

#### Get Job Results

```bash
# Get result as JSON
opencode-client ollama result job_1234567890

# Get result and save to file
opencode-client ollama result job_1234567890 > result.json

# Pretty print JSON result
opencode-client ollama result job_1234567890 | jq '.'
```

#### Cancel Jobs

```bash
# Cancel specific job
opencode-client ollama cancel job_1234567890

# Cancel all pending jobs
opencode-client ollama list --status pending | jq -r '.[].id' | xargs -I {} opencode-client ollama cancel {}
```

### Model Management

#### List Available Models

```bash
# Basic model list
opencode-client ollama models

# Detailed model information
opencode-client ollama models --detailed

# Filter models (if supported)
opencode-client ollama models | grep llama
```

#### Model Information

```bash
# Get detailed info about a specific model
opencode-client ollama models --detailed | jq '.[] | select(.name == "llama2")'
```

### Queue Management

#### Queue Information

```bash
# Get queue status
opencode-client ollama info

# Monitor queue in real-time
watch -n 2 "opencode-client ollama info"
```

#### Cache Management

```bash
# Get cache statistics
opencode-client ollama cache stats

# Clear expired cache entries
opencode-client ollama cache clear-expired

# Clear all cache
opencode-client ollama cache clear

# Performance analysis
opencode-client ollama cache performance-analysis
```

## Session Commands

### Session Management

#### List Sessions

```bash
# List all sessions
opencode-client sessions list

# List with pagination
opencode-client sessions list --limit 10 --offset 20

# List active sessions only
opencode-client sessions list | jq '.[] | select(.activityStatus == "active")'
```

#### Get Session Details

```bash
# Get specific session
opencode-client sessions get sess_1234567890

# Get session with full details
opencode-client --verbose sessions get sess_1234567890

# Extract session title
opencode-client sessions get sess_1234567890 | jq -r '.title'
```

#### Create Sessions

```bash
# Basic session
opencode-client sessions create --title "Code Review Session"

# Session with files
opencode-client sessions create \
  --title "Bug Investigation" \
  --files '["src/main.ts", "src/utils.ts", "README.md"]'

# Session with agent delegates
opencode-client sessions create \
  --title "Security Audit" \
  --delegates '["security-analyzer", "code-reviewer"]'

# Full session creation
opencode-client sessions create \
  --title "Feature Development" \
  --files '["src/feature.ts", "tests/feature.test.ts"]' \
  --delegates '["developer", "tester"]'
```

#### Close Sessions

```bash
# Close specific session
opencode-client sessions close sess_1234567890

# Close multiple sessions
opencode-client sessions list | jq -r '.[].id' | head -5 | xargs -I {} opencode-client sessions close {}
```

#### Search Sessions

```bash
# Search for sessions
opencode-client sessions search --query "bug fix authentication"

# Search with limited results
opencode-client sessions search --query "performance optimization" --k 3

# Search and extract titles
opencode-client sessions search --query "code review" | jq -r '.[].title'
```

## PM2 Commands

### Process Management

#### List Processes

```bash
# List all PM2 processes
opencode-client pm2 list

# Get detailed process information
opencode-client pm2 describe my-app

# Monitor specific process
watch -n 2 "opencode-client pm2 describe my-app"
```

#### Log Management

```bash
# Show recent logs
opencode-client pm2 logs my-app --lines 100

# Show error logs only
opencode-client pm2 logs my-app --type error --lines 50

# Show combined logs
opencode-client pm2 logs my-app --type combined --lines 200

# Follow logs in real-time
opencode-client pm2 logs my-app --lines 0 --follow
```

## Advanced Workflows

### Code Review Workflow

```bash
#!/bin/bash
# code-review-workflow.sh

# 1. Create a session for code review
SESSION_ID=$(opencode-client sessions create \
  --title "Code Review - $(date +%Y-%m-%d)" \
  --files '["src/**/*.ts", "tests/**/*.ts"]' \
  --delegates '["reviewer", "security-analyzer"]' | jq -r '.id')

echo "Created session: $SESSION_ID"

# 2. Submit security analysis job
SECURITY_JOB=$(opencode-client ollama submit \
  --model codellama \
  --prompt "Analyze the following code for security vulnerabilities and potential issues" \
  --name "security-analysis" \
  --priority high | jq -r '.id')

echo "Submitted security job: $SECURITY_JOB"

# 3. Submit code quality analysis
QUALITY_JOB=$(opencode-client ollama submit \
  --model codellama \
  --prompt "Review the code for best practices, performance, and maintainability" \
  --name "quality-analysis" \
  --priority medium | jq -r '.id')

echo "Submitted quality job: $QUALITY_JOB"

# 4. Wait for jobs to complete
echo "Waiting for jobs to complete..."
for job_id in $SECURITY_JOB $QUALITY_JOB; do
  while true; do
    status=$(opencode-client ollama status $job_id | jq -r '.status')
    if [[ "$status" == "completed" || "$status" == "failed" ]]; then
      break
    fi
    sleep 5
  done
done

# 5. Get results
echo "Getting results..."
opencode-client ollama result $SECURITY_JOB > security-report.json
opencode-client ollama result $QUALITY_JOB > quality-report.json

# 6. Close session
opencode-client sessions close $SESSION_ID

echo "Code review workflow completed!"
echo "Reports saved: security-report.json, quality-report.json"
```

### Batch Processing Workflow

```bash
#!/bin/bash
# batch-processing.sh

# Process multiple files with Ollama
FILES=("src/app.ts" "src/utils.ts" "src/config.ts")
MODEL="llama2"
RESULTS_DIR="results/$(date +%Y%m%d_%H%M%S)"

mkdir -p "$RESULTS_DIR"

echo "Processing ${#FILES[@]} files..."
JOB_IDS=()

# Submit jobs for each file
for file in "${FILES[@]}"; do
  echo "Processing $file..."

  job_id=$(opencode-client ollama submit \
    --model "$MODEL" \
    --prompt "Analyze the following TypeScript file and provide a summary: $(cat $file)" \
    --name "analyze-$(basename $file)" \
    --priority medium | jq -r '.id')

  JOB_IDS+=("$job_id")
  echo "Submitted job: $job_id"
done

# Monitor all jobs
echo "Monitoring ${#JOB_IDS[@]} jobs..."
completed=0

while [[ $completed -lt ${#JOB_IDS[@]} ]]; do
  completed=0
  for job_id in "${JOB_IDS[@]}"; do
    status=$(opencode-client ollama status "$job_id" | jq -r '.status')
    if [[ "$status" == "completed" || "$status" == "failed" ]]; then
      ((completed++))
    fi
  done

  echo "Progress: $completed/${#JOB_IDS[@]} jobs completed"
  sleep 10
done

# Collect results
echo "Collecting results..."
for i in "${!FILES[@]}"; do
  file="${FILES[$i]}"
  job_id="${JOB_IDS[$i]}"
  filename=$(basename "$file")

  opencode-client ollama result "$job_id" > "$RESULTS_DIR/${filename}.json"
  echo "Saved result for $filename"
done

echo "Batch processing completed! Results saved to: $RESULTS_DIR"
```

### Interactive Session Management

```bash
#!/bin/bash
# interactive-session.sh

# Create an interactive session
echo "Creating new session..."
read -p "Enter session title: " TITLE
read -p "Enter files (comma-separated): " FILES
read -p "Enter delegates (comma-separated): " DELEGATES

# Convert to JSON arrays
FILES_JSON=$(echo "$FILES" | sed 's/,/","/g' | sed 's/^/["/' | sed 's/$/"]/')
DELEGATES_JSON=$(echo "$DELEGATES" | sed 's/,/","/g' | sed 's/^/["/' | sed 's/$/"]/')

SESSION_ID=$(opencode-client sessions create \
  --title "$TITLE" \
  --files "$FILES_JSON" \
  --delegates "$DELEGATES_JSON" | jq -r '.id')

echo "Created session: $SESSION_ID"

# Interactive loop
while true; do
  echo
  echo "Session: $TITLE ($SESSION_ID)"
  echo "1. Submit job"
  echo "2. Check session status"
  echo "3. List jobs"
  echo "4. Search past sessions"
  echo "5. Close session"
  echo "6. Exit"
  read -p "Choose an option: " CHOICE

  case $CHOICE in
    1)
      read -p "Enter prompt: " PROMPT
      read -p "Enter model (default: llama2): " MODEL
      MODEL=${MODEL:-llama2}

      JOB_ID=$(opencode-client ollama submit \
        --model "$MODEL" \
        --prompt "$PROMPT" \
        --name "interactive-job" | jq -r '.id')

      echo "Submitted job: $JOB_ID"
      ;;
    2)
      opencode-client sessions get "$SESSION_ID"
      ;;
    3)
      opencode-client ollama list --limit 10
      ;;
    4)
      read -p "Enter search query: " QUERY
      opencode-client sessions search --query "$QUERY"
      ;;
    5)
      opencode-client sessions close "$SESSION_ID"
      echo "Session closed."
      exit 0
      ;;
    6)
      echo "Exiting..."
      exit 0
      ;;
    *)
      echo "Invalid option"
      ;;
  esac
done
```

## Scripting Examples

### Node.js Script

```javascript
// automated-analysis.js
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

class OpenCodeClient {
  constructor() {
    this.serverUrl = process.env.OPENCODE_SERVER_URL || 'http://localhost:3000';
    this.authToken = process.env.OPENCODE_AUTH_TOKEN;
  }

  async runCommand(command) {
    try {
      const result = execSync(`opencode-client ${command}`, {
        encoding: 'utf8',
        env: {
          ...process.env,
          OPENCODE_SERVER_URL: this.serverUrl,
          OPENCODE_AUTH_TOKEN: this.authToken,
        },
      });
      return JSON.parse(result);
    } catch (error) {
      console.error(`Command failed: ${command}`);
      throw error;
    }
  }

  async analyzeCodebase(directory) {
    console.log(`Analyzing codebase in ${directory}`);

    // Create session
    const session = await this.runCommand(
      `sessions create --title "Codebase Analysis" --files '["${directory}/**/*"]'`,
    );

    console.log(`Created session: ${session.id}`);

    // Get all TypeScript files
    const files = this.getFiles(directory, '.ts');
    const jobIds = [];

    // Submit analysis jobs
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      const prompt = `Analyze this TypeScript file for code quality, potential issues, and improvement suggestions:\n\n${content}`;

      const job = await this.runCommand(
        `ollama submit --model codellama --prompt "${prompt}" --name "analyze-${path.basename(file)}"`,
      );

      jobIds.push(job.id);
      console.log(`Submitted job for ${file}: ${job.id}`);
    }

    // Wait for completion
    await this.waitForJobs(jobIds);

    // Collect results
    const results = {};
    for (let i = 0; i < files.length; i++) {
      const result = await this.runCommand(`ollama result ${jobIds[i]}`);
      results[files[i]] = result;
    }

    // Close session
    await this.runCommand(`sessions close ${session.id}`);

    return results;
  }

  getFiles(dir, extension) {
    const files = [];

    function traverse(currentDir) {
      const items = fs.readdirSync(currentDir);

      for (const item of items) {
        const fullPath = path.join(currentDir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          traverse(fullPath);
        } else if (item.endsWith(extension)) {
          files.push(fullPath);
        }
      }
    }

    traverse(dir);
    return files;
  }

  async waitForJobs(jobIds) {
    console.log(`Waiting for ${jobIds.length} jobs to complete...`);

    while (true) {
      const completed = jobIds.filter(async (id) => {
        const status = await this.runCommand(`ollama status ${id}`);
        return ['completed', 'failed'].includes(status.status);
      });

      if (completed.length === jobIds.length) {
        break;
      }

      console.log(`Progress: ${completed.length}/${jobIds.length} completed`);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

// Usage
const client = new OpenCodeClient();
const results = await client.analyzeCodebase('./src');

// Save results
fs.writeFileSync('analysis-results.json', JSON.stringify(results, null, 2));
console.log('Analysis completed! Results saved to analysis-results.json');
```

### Python Script

```python
#!/usr/bin/env python3
# automated_session.py

import subprocess
import json
import time
import os
from typing import Dict, List, Any

class OpenCodeCLI:
    def __init__(self):
        self.server_url = os.getenv('OPENCODE_SERVER_URL', 'http://localhost:3000')
        self.auth_token = os.getenv('OPENCODE_AUTH_TOKEN')

    def run_command(self, command: str) -> Dict[str, Any]:
        """Run opencode-client command and return JSON result"""
        env = os.environ.copy()
        env['OPENCODE_SERVER_URL'] = self.server_url
        env['OPENCODE_AUTH_TOKEN'] = self.auth_token

        try:
            result = subprocess.run(
                ['opencode'] + command.split(),
                capture_output=True,
                text=True,
                env=env
            )

            if result.returncode != 0:
                raise Exception(f"Command failed: {result.stderr}")

            return json.loads(result.stdout)
        except Exception as e:
            print(f"Error running command '{command}': {e}")
            raise

    def create_research_session(self, topic: str, queries: List[str]) -> str:
        """Create a research session and submit queries"""
        print(f"Creating research session for: {topic}")

        # Create session
        session = self.run_command(f'sessions create --title "Research: {topic}"')
        session_id = session['id']
        print(f"Created session: {session_id}")

        # Submit queries
        job_ids = []
        for i, query in enumerate(queries):
            job = self.run_command(
                f'ollama submit --model llama2 --prompt "{query}" --name "research-query-{i+1}"'
            )
            job_ids.append(job['id'])
            print(f"Submitted query {i+1}: {job['id']}")

        # Wait for completion
        self._wait_for_jobs(job_ids)

        # Collect results
        results = {}
        for i, job_id in enumerate(job_ids):
            result = self.run_command(f'ollama result {job_id}')
            results[f'query_{i+1}'] = {
                'query': queries[i],
                'result': result
            }

        # Save results
        output_file = f"research_{topic.replace(' ', '_')}.json"
        with open(output_file, 'w') as f:
            json.dump(results, f, indent=2)

        # Close session
        self.run_command(f'sessions close {session_id}')

        print(f"Research completed! Results saved to: {output_file}")
        return output_file

    def _wait_for_jobs(self, job_ids: List[str]):
        """Wait for all jobs to complete"""
        print(f"Waiting for {len(job_ids)} jobs to complete...")

        while True:
            completed = 0
            for job_id in job_ids:
                status = self.run_command(f'ollama status {job_id}')
                if status['status'] in ['completed', 'failed']:
                    completed += 1

            print(f"Progress: {completed}/{len(job_ids)} completed")

            if completed == len(job_ids):
                break

            time.sleep(10)

def main():
    cli = OpenCodeCLI()

    # Example research session
    topic = "Machine Learning Best Practices"
    queries = [
        "What are the best practices for data preprocessing in machine learning?",
        "How to prevent overfitting in neural networks?",
        "What evaluation metrics should be used for classification models?",
        "How to handle imbalanced datasets in machine learning?"
    ]

    result_file = cli.create_research_session(topic, queries)
    print(f"Research session completed. Results in: {result_file}")

if __name__ == "__main__":
    main()
```

### PowerShell Script

```powershell
# automated-workflow.ps1

param(
    [Parameter(Mandatory=$true)]
    [string]$ProjectPath,

    [Parameter(Mandatory=$false)]
    [string]$Model = "llama2",

    [Parameter(Mandatory=$false)]
    [string]$OutputDir = "analysis-results"
)

# Create output directory
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

Write-Host "Starting automated analysis for project: $ProjectPath"

# Create session
$session = opencode-client sessions create --title "Automated Project Analysis" | ConvertFrom-Json
$sessionId = $session.id
Write-Host "Created session: $sessionId"

# Get all PowerShell and TypeScript files
$files = Get-ChildItem -Path $ProjectPath -Include "*.ps1", "*.ts" -Recurse
$jobIds = @()

# Submit analysis jobs
foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    $prompt = "Analyze this script for best practices, security, and performance issues: `n`n$content"

    $job = opencode-client ollama submit --model $Model --prompt $prompt --name "analyze-$($file.Name)" | ConvertFrom-Json
    $jobIds += $job.id

    Write-Host "Submitted analysis for $($file.Name): $($job.id)"
}

# Wait for jobs to complete
Write-Host "Waiting for $($jobIds.Count) jobs to complete..."
$completed = 0

while ($completed -lt $jobIds.Count) {
    $completed = 0
    foreach ($jobId in $jobIds) {
        $status = opencode-client ollama status $jobId | ConvertFrom-Json
        if ($status.status -in @("completed", "failed")) {
            $completed++
        }
    }

    Write-Host "Progress: $completed/$($jobIds.Count) completed"
    Start-Sleep -Seconds 10
}

# Collect results
Write-Host "Collecting results..."
for ($i = 0; $i -lt $files.Count; $i++) {
    $file = $files[$i]
    $jobId = $jobIds[$i]

    $result = opencode-client ollama result $jobId | ConvertFrom-Json
    $outputFile = Join-Path $OutputDir "$($file.BaseName)-analysis.json"

    $result | ConvertTo-Json -Depth 10 | Out-File -FilePath $outputFile
    Write-Host "Saved analysis for $($file.Name) to $outputFile"
}

# Close session
opencode-client sessions close $sessionId | Out-Null

Write-Host "Automated analysis completed! Results saved to: $OutputDir"
```

These examples demonstrate various ways to use the OpenCode CLI client, from simple command-line usage to complex automated workflows and scripting integrations.
