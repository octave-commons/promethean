# Usage Examples

This document provides comprehensive examples for using all commands in the OpenCode CLI client.

## Table of Contents

- [Global Options](#global-options)
- [Session Commands](#session-commands)
- [Events Commands](#events-commands)
- [Messages Commands](#messages-commands)
- [Indexer Commands](#indexer-commands)
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
opencode-client --verbose sessions list

# Disable colored output
opencode-client --no-color sessions list
```

### Environment Setup

```bash
# Set OpenCode server URL
export OPENCODE_BASE_URL="http://localhost:4096"

# Set authentication token
export OPENCODE_API_KEY="your-api-key"

# Set request timeout
export OPENCODE_TIMEOUT="60000"

# Enable debug logging
export DEBUG="opencode-client:*"
```

## Session Commands

### Session Management

#### List Sessions

```bash
# List all sessions
opencode-client sessions list

# List with pagination
opencode-client sessions list --limit 10 --offset 20

# List with verbose output
opencode-client --verbose sessions list
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

# Session with initial message
opencode-client sessions create \
  --title "Bug Investigation" \
  --message "Investigate the authentication issue reported by users"

# Quick session creation with spawn
opencode-client sessions spawn "Help me debug this TypeScript error" \
  --title "Debug Session"
```

#### Close Sessions

```bash
# Close specific session
opencode-client sessions close sess_1234567890

# Close multiple sessions (using jq)
opencode-client sessions list | jq -r '.[].id' | head -5 | xargs -I {} opencode-client sessions close {}
```

#### Search Sessions

```bash
# Search for sessions
opencode-client sessions search "bug fix authentication"

# Search with limited results
opencode-client sessions search "performance optimization" --k 3

# Search and extract titles
opencode-client sessions search "code review" | jq -r '.[].title'
```

#### Diagnose Sessions

```bash
# Diagnose overall system
opencode-client sessions diagnose

# Diagnose specific session
opencode-client sessions diagnose sess_1234567890
```

## Events Commands

### Event Management

#### List Events

```bash
# List recent events
opencode-client events list

# List events with filters
opencode-client events list --eventType "message_sent" --k 20

# List events for specific session
opencode-client events list --sessionId sess_1234567890

# List events with query filter
opencode-client events list --query "session_created" --k 10
```

#### Subscribe to Events

```bash
# Subscribe to all events
opencode-client events subscribe

# Subscribe to specific event type
opencode-client events subscribe --eventType "message_sent"

# Subscribe to session-specific events
opencode-client events subscribe --sessionId sess_1234567890

# Subscribe with query filter
opencode-client events subscribe --query "session_updated"
```

## Messages Commands

### Message Management

#### List Messages

```bash
# List messages in a session
opencode-client messages list sess_1234567890

# List with limit
opencode-client messages list sess_1234567890 --limit 20
```

#### Get Specific Message

```bash
# Get message details
opencode-client messages get sess_1234567890 msg_0987654321

# Extract message content
opencode-client messages get sess_1234567890 msg_0987654321 | jq -r '.content'
```

#### Send Messages

```bash
# Send a simple message
opencode-client messages send sess_1234567890 "Hello, can you help me with this code?"

# Send a multi-line message
opencode-client messages send sess_1234567890 "Here's the code I'm having trouble with:
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}"
```

## Indexer Commands

### Indexer Management

#### Start Indexer Service

```bash
# Start indexer in foreground
opencode-client indexer start

# Start with verbose logging
opencode-client indexer start --verbose

# Start as PM2 daemon
opencode-client indexer start --pm2

# Start with custom server URL
opencode-client indexer start --baseUrl "https://api.opencode.com"
```

## Advanced Workflows

### Code Review Workflow

```bash
#!/bin/bash
# code-review-workflow.sh

# 1. Create a session for code review
SESSION_ID=$(opencode-client sessions create \
  --title "Code Review - $(date +%Y-%m-%d)" \
  --message "Starting code review session for the latest changes" | jq -r '.id')

echo "Created session: $SESSION_ID"

# 2. Send initial context
opencode-client messages send "$SESSION_ID" "Please review the following changes:
- Updated authentication logic
- Added input validation
- Improved error handling"

# 3. Monitor for responses
echo "Monitoring for responses..."
opencode-client events subscribe --sessionId "$SESSION_ID" &
SUBSCRIBE_PID=$!

# 4. Wait for some time to collect responses
sleep 30

# 5. Kill the subscription process
kill $SUBSCRIBE_PID 2>/dev/null

# 6. Get final session state
echo "Final session state:"
opencode-client sessions get "$SESSION_ID"

# 7. Close session
opencode-client sessions close "$SESSION_ID"

echo "Code review workflow completed!"
```

### Session Analysis Workflow

```bash
#!/bin/bash
# session-analysis.sh

# Analyze recent sessions
echo "Analyzing recent sessions..."

# Get all sessions
SESSIONS=$(opencode-client sessions list --limit 50)

# Extract session IDs and analyze each
echo "$SESSIONS" | jq -r '.[].id' | while read -r session_id; do
  echo "Analyzing session: $session_id"

  # Get session details
  SESSION_DETAILS=$(opencode-client sessions get "$session_id")

  # Extract key information
  TITLE=$(echo "$SESSION_DETAILS" | jq -r '.title // "Untitled"')
  MESSAGE_COUNT=$(opencode-client messages list "$session_id" --limit 1000 | jq '. | length')

  echo "  Title: $TITLE"
  echo "  Messages: $MESSAGE_COUNT"

  # Get recent events
  RECENT_EVENTS=$(opencode-client events list --sessionId "$session_id" --k 5)
  echo "  Recent events: $(echo "$RECENT_EVENTS" | jq '. | length')"

  echo "---"
done
```

### Real-time Event Monitoring

```bash
#!/bin/bash
# event-monitor.sh

echo "Starting real-time event monitoring..."
echo "Press Ctrl+C to stop"

# Subscribe to all events
opencode-client events subscribe | while read -r event; do
  # Parse event JSON
  EVENT_TYPE=$(echo "$event" | jq -r '.type')
  SESSION_ID=$(echo "$event" | jq -r '.sessionId // "global"')
  TIMESTAMP=$(echo "$event" | jq -r '.timestamp')

  # Format timestamp
  FORMATTED_TIME=$(date -d "@$TIMESTAMP" '+%Y-%m-%d %H:%M:%S')

  echo "[$FORMATTED_TIME] $EVENT_TYPE (Session: $SESSION_ID)"

  # Show additional details for specific event types
  case "$EVENT_TYPE" in
    "session_created")
      TITLE=$(echo "$event" | jq -r '.data.title // "Untitled"')
      echo "  → New session: $TITLE"
      ;;
    "message_sent")
      CONTENT=$(echo "$event" | jq -r '.data.content' | head -c 100)
      echo "  → Message: $CONTENT..."
      ;;
    "session_closed")
      echo "  → Session closed"
      ;;
  esac
done
```

### Interactive Session Management

```bash
#!/bin/bash
# interactive-session.sh

# Create an interactive session
echo "Creating new session..."
read -p "Enter session title: " TITLE
read -p "Enter initial message: " MESSAGE

# Create session
SESSION_ID=$(opencode-client sessions create \
  --title "$TITLE" \
  --message "$MESSAGE" | jq -r '.id')

echo "Created session: $SESSION_ID"

# Interactive loop
while true; do
  echo
  echo "Session: $TITLE ($SESSION_ID)"
  echo "1. Send message"
  echo "2. List messages"
  echo "3. Show session details"
  echo "4. Search sessions"
  echo "5. Monitor events"
  echo "6. Close session"
  echo "7. Exit"
  read -p "Choose an option: " CHOICE

  case $CHOICE in
    1)
      read -p "Enter your message: " MSG
      opencode-client messages send "$SESSION_ID" "$MSG"
      echo "Message sent."
      ;;
    2)
      echo "Messages in session:"
      opencode-client messages list "$SESSION_ID" --limit 10
      ;;
    3)
      echo "Session details:"
      opencode-client sessions get "$SESSION_ID"
      ;;
    4)
      read -p "Enter search query: " QUERY
      opencode-client sessions search "$QUERY" --k 5
      ;;
    5)
      echo "Monitoring events for 30 seconds..."
      timeout 30 opencode-client events subscribe --sessionId "$SESSION_ID" || true
      ;;
    6)
      opencode-client sessions close "$SESSION_ID"
      echo "Session closed."
      exit 0
      ;;
    7)
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
// automated-session-manager.js
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

class OpenCodeClient {
  constructor() {
    this.baseUrl = process.env.OPENCODE_BASE_URL || 'http://localhost:4096';
    this.apiKey = process.env.OPENCODE_API_KEY;
  }

  async runCommand(command) {
    try {
      const result = execSync(`opencode-client ${command}`, {
        encoding: 'utf8',
        env: {
          ...process.env,
          OPENCODE_BASE_URL: this.baseUrl,
          OPENCODE_API_KEY: this.apiKey,
        },
      });
      return JSON.parse(result);
    } catch (error) {
      console.error(`Command failed: ${command}`);
      throw error;
    }
  }

  async createSessionWithMessages(title, messages) {
    console.log(`Creating session: ${title}`);

    // Create session
    const session = await this.runCommand(
      `sessions create --title "${title}" --message "${messages[0]}"`,
    );

    console.log(`Created session: ${session.id}`);

    // Send additional messages
    for (let i = 1; i < messages.length; i++) {
      await this.runCommand(`messages send ${session.id} "${messages[i]}"`);
      console.log(`Sent message ${i + 1}/${messages.length}`);
    }

    return session;
  }

  async analyzeSession(sessionId) {
    console.log(`Analyzing session: ${sessionId}`);

    // Get session details
    const session = await this.runCommand(`sessions get ${sessionId}`);

    // Get messages
    const messages = await this.runCommand(`messages list ${sessionId} --limit 100`);

    // Get events
    const events = await this.runCommand(`events list --sessionId ${sessionId} --k 50`);

    return {
      session,
      messages,
      events,
      analysis: {
        messageCount: messages.length,
        eventCount: events.length,
        duration: session.updatedAt - session.createdAt,
        activityStatus: session.activityStatus,
      },
    };
  }

  async monitorSession(sessionId, duration = 60000) {
    console.log(`Monitoring session ${sessionId} for ${duration}ms...`);

    return new Promise((resolve, reject) => {
      const child = execSync(`opencode-client events subscribe --sessionId ${sessionId}`, {
        encoding: 'utf8',
        stdio: 'pipe',
      });

      // Process events as they come in
      const events = child.split('\n').filter((line) => line.trim());

      setTimeout(() => {
        resolve(events);
      }, duration);
    });
  }

  async cleanupOldSessions(maxAge = 7 * 24 * 60 * 60 * 1000) {
    // 7 days
    console.log('Cleaning up old sessions...');

    const sessions = await this.runCommand('sessions list --limit 1000');
    const now = Date.now();
    let cleaned = 0;

    for (const session of sessions.sessions) {
      if (now - session.createdAt > maxAge) {
        await this.runCommand(`sessions close ${session.id}`);
        cleaned++;
        console.log(`Closed old session: ${session.id}`);
      }
    }

    console.log(`Cleaned up ${cleaned} old sessions`);
    return cleaned;
  }
}

// Usage examples
async function main() {
  const client = new OpenCodeClient();

  // Example 1: Create a session with multiple messages
  const session = await client.createSessionWithMessages('Development Planning', [
    'I need to plan the next sprint for our project.',
    'We have 3 main features to implement.',
    'Let me break down the tasks and estimate timelines.',
  ]);

  // Example 2: Analyze the session
  const analysis = await client.analyzeSession(session.id);
  console.log('Session analysis:', analysis.analysis);

  // Example 3: Monitor for new events
  console.log('Monitoring for new events...');
  // await client.monitorSession(session.id, 30000); // 30 seconds

  // Example 4: Cleanup old sessions
  // await client.cleanupOldSessions();

  // Close the session
  await client.runCommand(`sessions close ${session.id}`);
  console.log('Session workflow completed!');
}

main().catch(console.error);
```

### Python Script

```python
#!/usr/bin/env python3
# session_analyzer.py

import subprocess
import json
import time
import os
from typing import Dict, List, Any, Optional
from datetime import datetime

class OpenCodeCLI:
    def __init__(self):
        self.base_url = os.getenv('OPENCODE_BASE_URL', 'http://localhost:4096')
        self.api_key = os.getenv('OPENCODE_API_KEY')

    def run_command(self, command: str) -> Dict[str, Any]:
        """Run opencode-client command and return JSON result"""
        env = os.environ.copy()
        env['OPENCODE_BASE_URL'] = self.base_url
        env['OPENCODE_API_KEY'] = self.api_key

        try:
            result = subprocess.run(
                ['opencode-client'] + command.split(),
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

    def create_research_session(self, topic: str, research_questions: List[str]) -> str:
        """Create a research session and explore questions"""
        print(f"Creating research session for: {topic}")

        # Create session with initial message
        initial_message = f"I want to research {topic}. Here are my questions:\n" + \
                         "\n".join([f"{i+1}. {q}" for i, q in enumerate(research_questions)])

        session = self.run_command(f'sessions create --title "Research: {topic}" --message "{initial_message}"')
        session_id = session['id']
        print(f"Created session: {session_id}")

        return session_id

    def analyze_session_activity(self, session_id: str) -> Dict[str, Any]:
        """Analyze activity patterns in a session"""
        print(f"Analyzing activity for session: {session_id}")

        # Get session details
        session = self.run_command(f'sessions get {session_id}')

        # Get all messages
        messages = self.run_command(f'messages list {session_id} --limit 1000')

        # Get all events
        events = self.run_command(f'events list --sessionId {session_id} --k 1000')

        # Analyze patterns
        analysis = {
            'session_id': session_id,
            'title': session.get('title', 'Untitled'),
            'created_at': datetime.fromtimestamp(session['createdAt']).isoformat(),
            'updated_at': datetime.fromtimestamp(session['updatedAt']).isoformat(),
            'duration_hours': (session['updatedAt'] - session['createdAt']) / 3600,
            'message_count': len(messages),
            'event_count': len(events),
            'activity_status': session['activityStatus'],
            'message_frequency': len(messages) / max(1, (session['updatedAt'] - session['createdAt']) / 3600),
            'event_types': {}
        }

        # Count event types
        for event in events:
            event_type = event['type']
            analysis['event_types'][event_type] = analysis['event_types'].get(event_type, 0) + 1

        return analysis

    def monitor_session_realtime(self, session_id: str, duration: int = 60):
        """Monitor a session in real-time for specified duration"""
        print(f"Monitoring session {session_id} for {duration} seconds...")

        try:
            # Start event subscription
            process = subprocess.Popen(
                ['opencode-client', 'events', 'subscribe', '--sessionId', session_id],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                env={**os.environ, 'OPENCODE_BASE_URL': self.base_url}
            )

            start_time = time.time()
            events_received = []

            while time.time() - start_time < duration:
                try:
                    # Read line with timeout
                    output = process.stdout.readline()
                    if output:
                        event = json.loads(output.strip())
                        events_received.append(event)

                        timestamp = datetime.fromtimestamp(event['timestamp']).strftime('%H:%M:%S')
                        print(f"[{timestamp}] {event['type']}")

                        if event['type'] == 'message_sent':
                            content = event['data']['content'][:100] + "..." if len(event['data']['content']) > 100 else event['data']['content']
                            print(f"  → {content}")
                except json.JSONDecodeError:
                    continue
                except Exception as e:
                    print(f"Error processing event: {e}")

                time.sleep(0.1)

            # Terminate the process
            process.terminate()
            process.wait()

            print(f"\nMonitoring complete. Received {len(events_received)} events.")
            return events_received

        except KeyboardInterrupt:
            print("\nMonitoring interrupted by user.")
            process.terminate()
            process.wait()
            return []

    def generate_session_report(self, session_id: str) -> str:
        """Generate a comprehensive report for a session"""
        analysis = self.analyze_session_activity(session_id)

        report = f"""
# Session Report: {analysis['title']}

## Overview
- **Session ID**: {analysis['session_id']}
- **Created**: {analysis['created_at']}
- **Last Updated**: {analysis['updated_at']}
- **Duration**: {analysis['duration_hours']:.2f} hours
- **Status**: {analysis['activity_status']}

## Activity Summary
- **Total Messages**: {analysis['message_count']}
- **Total Events**: {analysis['event_count']}
- **Message Frequency**: {analysis['message_frequency']:.2f} messages/hour

## Event Breakdown
"""

        for event_type, count in analysis['event_types'].items():
            report += f"- **{event_type}**: {count}\n"

        report += f"""
## Insights
- Average session activity: {'High' if analysis['message_frequency'] > 5 else 'Medium' if analysis['message_frequency'] > 1 else 'Low'}
- Most common event type: {max(analysis['event_types'], key=analysis['event_types'].get) if analysis['event_types'] else 'None'}
- Session duration category: {'Long' if analysis['duration_hours'] > 2 else 'Medium' if analysis['duration_hours'] > 0.5 else 'Short'}
"""

        return report

def main():
    cli = OpenCodeCLI()

    # Example 1: Create a research session
    topic = "Machine Learning Model Optimization"
    questions = [
        "What are the main techniques for model optimization?",
        "How do quantization and pruning affect model performance?",
        "What tools are available for automated optimization?"
    ]

    session_id = cli.create_research_session(topic, questions)

    # Example 2: Analyze the session
    analysis = cli.analyze_session_activity(session_id)
    print("Session Analysis:")
    print(json.dumps(analysis, indent=2))

    # Example 3: Monitor for new activity (optional)
    # print("Monitoring for new activity...")
    # cli.monitor_session_realtime(session_id, 30)  # Monitor for 30 seconds

    # Example 4: Generate report
    report = cli.generate_session_report(session_id)

    # Save report
    report_file = f"session_report_{session_id}.md"
    with open(report_file, 'w') as f:
        f.write(report)

    print(f"Report saved to: {report_file}")

    # Clean up
    cli.run_command(f'sessions close {session_id}')
    print("Session closed.")

if __name__ == "__main__":
    main()
```

### PowerShell Script

```powershell
# session-manager.ps1

param(
    [Parameter(Mandatory=$false)]
    [string]$BaseURL = "http://localhost:4096",

    [Parameter(Mandatory=$false)]
    [string]$OutputDir = "session-reports"
)

# Create output directory
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

# Set environment variables
$env:OPENCODE_BASE_URL = $BaseURL

Write-Host "OpenCode Session Manager"
Write-Host "======================="

function Invoke-OpenCode {
    param(
        [string]$Command
    )

    try {
        $result = opencode-client $Command | ConvertFrom-Json
        return $result
    }
    catch {
        Write-Error "Command failed: $Command"
        Write-Error $_.Exception.Message
        throw
    }
}

function New-AnalysisSession {
    param(
        [string]$Title,
        [string[]]$Topics
    )

    Write-Host "Creating analysis session: $Title"

    $message = "I need to analyze the following topics:`n" + ($Topics -join "`n")

    $session = Invoke-OpenCode "sessions create --title `"$Title`" --message `"$message`""

    Write-Host "Created session: $($session.id)"
    return $session
}

function Get-SessionInsights {
    param(
        [string]$SessionId
    )

    Write-Host "Gathering insights for session: $SessionId"

    # Get session details
    $session = Invoke-OpenCode "sessions get $SessionId"

    # Get messages
    $messages = Invoke-OpenCode "messages list $SessionId --limit 1000"

    # Get events
    $events = Invoke-OpenCode "events list --sessionId $SessionId --k 1000"

    # Calculate insights
    $duration = $session.updatedAt - $session.createdAt
    $durationHours = $duration / 3600
    $messageFrequency = if ($durationHours -gt 0) { $messages.Count / $durationHours } else { 0 }

    $insights = @{
        SessionId = $SessionId
        Title = $session.title
        Duration = [timespan]::FromMilliseconds($duration)
        MessageCount = $messages.Count
        EventCount = $events.Count
        MessageFrequency = [math]::Round($messageFrequency, 2)
        ActivityStatus = $session.activityStatus
        EventTypes = @{}
    }

    # Count event types
    foreach ($event in $events) {
        $type = $event.type
        if ($insights.EventTypes.ContainsKey($type)) {
            $insights.EventTypes[$type]++
        } else {
            $insights.EventTypes[$type] = 1
        }
    }

    return $insights
}

function Export-SessionReport {
    param(
        [object]$Insights,
        [string]$OutputPath
    )

    $report = @"
# Session Analysis Report

## Session Information
- **Session ID**: $($Insights.SessionId)
- **Title**: $($Insights.Title)
- **Duration**: $($Insights.Duration.ToString('hh\:mm\:ss'))
- **Status**: $($Insights.ActivityStatus)

## Activity Metrics
- **Total Messages**: $($Insights.MessageCount)
- **Total Events**: $($Insights.EventCount)
- **Message Frequency**: $($Insights.MessageFrequency) messages/hour

## Event Distribution
"@

    foreach ($eventType in $Insights.EventTypes.GetEnumerator()) {
        $report += "- **$($eventType.Key)**: $($eventType.Value)`n"
    }

    $report += @"

## Analysis Summary
- Activity Level: $(if ($Insights.MessageFrequency -gt 5) { 'High' } elseif ($Insights.MessageFrequency -gt 1) { 'Medium' } else { 'Low' })
- Most Common Event: $(($Insights.EventTypes.GetEnumerator() | Sort-Object Value -Descending | Select-Object -First 1).Key)
- Session Length Category: $(if ($Insights.Duration.TotalHours -gt 2) { 'Long' } elseif ($Insights.Duration.TotalHours -gt 0.5) { 'Medium' } else { 'Short' })

Generated on: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
"@

    $report | Out-File -FilePath $OutputPath -Encoding UTF8
    Write-Host "Report saved to: $OutputPath"
}

# Main workflow
try {
    # Example 1: Create a session for project analysis
    $analysisTopics = @(
        "Code quality and maintainability",
        "Performance bottlenecks",
        "Security vulnerabilities",
        "Testing coverage and strategies"
    )

    $session = New-AnalysisSession -Title "Project Health Analysis" -Topics $analysisTopics

    # Example 2: Wait a bit and analyze
    Write-Host "Waiting 5 seconds before analysis..."
    Start-Sleep -Seconds 5

    $insights = Get-SessionInsights -SessionId $session.id

    # Example 3: Generate and save report
    $reportPath = Join-Path $OutputDir "session_$($session.id)_report.md"
    Export-SessionReport -Insights $insights -OutputPath $reportPath

    # Example 4: Display summary
    Write-Host "`nSession Summary:" -ForegroundColor Green
    Write-Host "  ID: $($insights.SessionId)"
    Write-Host "  Title: $($insights.Title)"
    Write-Host "  Duration: $($insights.Duration)"
    Write-Host "  Messages: $($insights.MessageCount)"
    Write-Host "  Events: $($insights.EventCount)"
    Write-Host "  Frequency: $($insights.MessageFrequency) msg/hr"

    # Example 5: Clean up
    Invoke-OpenCode "sessions close $($session.id)" | Out-Null
    Write-Host "Session closed."
}
catch {
    Write-Error "An error occurred: $($_.Exception.Message)"
    exit 1
}

Write-Host "`nSession management completed!" -ForegroundColor Green
```

These examples demonstrate various ways to use the OpenCode CLI client, from simple command-line usage to complex automated workflows and scripting integrations for session management, event monitoring, and analysis.
