# Discord Indexer Service

Archives Discord messages for later processing using the Discord API.
Implemented in Python.

## Setup

```bash
pipenv install
```

## Usage

Run the crawler:

```bash
pipenv run python main.py
```

The service starts a broker-tied heartbeat using the canonical
`shared.py.broker_client.BrokerClient` (via `shared.py.heartbeat_broker`). If
broker connectivity is lost, heartbeats stop and the heartbeat service will
reap the process.

#hashtags: #discord #service #promethean
