# Embedding Service Service

## Overview

TODO: Add service description.

Heartbeats: Use the canonical broker client. This service relies on
`shared.py.service_template` which publishes `heartbeat` events via the same
broker connection used for tasks. Do not use `shared.py.heartbeat_client`.

## Paths

- [embedding_service|services/py/embedding_service]

## Tags

#service #py
