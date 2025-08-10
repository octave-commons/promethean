# Embedding Service

Provides a broker-driven service for generating embeddings via multiple backends.
Uses the shared Python `start_service` template and listens on the
`embedding.generate` queue, publishing results to the `embedding.result` topic.
Supports naive, transformers, and Ollama drivers, keeping only the last used model
in an LRU cache.

#hashtags: #embeddings #service
