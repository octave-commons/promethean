# main.py

**Path**: `services/py/embedding_service/main.py`

**Description**: Async worker built on the shared `start_service` template to
generate vector embeddings. Listens for tasks on `embedding.generate` and
publishes results to the `embedding.result` topic using pluggable drivers such
as naive, transformers, or Ollama implementations.

## Dependencies
- asyncio
- os
- functools.lru_cache
- shared.py.service_template
- services/py/embedding_service/drivers

## Dependents
- `services/py/embedding_service/tests/test_service.py`
