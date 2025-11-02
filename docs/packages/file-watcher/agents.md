# File Watcher Service

## Overview

File system monitoring service that tracks changes to files and directories in real-time. Supports recursive directory watching, file pattern filtering, and event debouncing. Publishes file system events (create, modify, delete, move) through the message broker for reactive workflows. Includes configurable ignore patterns, batch event processing, and integration with build systems and development tools.

## Broker Usage

Publish events via `@promethean-os/legacy/brokerClient.js`. Do not instantiate raw `WebSocket` clients.

## Paths

- [file-watcher|services/ts/file-watcher]

## Tags

#service #ts
