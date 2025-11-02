# Heartbeat Service

## Overview

Heartbeat service that provides periodic status signals for distributed system components. Generates and publishes heartbeat events to indicate service availability and health status. Supports configurable intervals, custom metadata inclusion, and failure detection. Integrates with monitoring systems to track service uptime, detect outages, and trigger automated recovery procedures for distributed applications.

## Broker Usage

This client now relies on `@promethean-os/legacy/brokerClient.js` for publishing heartbeats; avoid direct `WebSocket` use.

## Paths

- [heartbeat|services/legacy/heartbeat]

## Tags

#service #js
