# main.py

**Path**: `services/py/embedding_service/main.py`

**Description**: FastAPI application exposing `/embed` to generate vector embeddings using pluggable drivers such as naive, transformers, or Ollama implementations.

## Dependencies
- fastapi
- pydantic
- functools.lru_cache
- services/py/embedding_service/drivers

## Dependents
- `services/py/embedding_service/tests/test_service.py`
