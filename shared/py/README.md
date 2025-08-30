# Promethean Shared Core Package

This package provides a modular dependency management system using extras to replace the monolithic shared requirements approach.

## Installation

Install the base package with minimal dependencies:
```bash
pip install -e .
```

Install with specific extras for your service needs:
```bash
# Web service
pip install -e ".[web,io]"

# Discord bot
pip install -e ".[discord,io]"

# ML service with embeddings
pip install -e ".[nlp,embeddings,data]"

# Legacy compatibility (migration helper)
pip install -e ".[legacy-cpu]"
```

## Available Extras

### Core Functionality
- **`core`**: Base dependencies (python-dotenv, pydantic, requests)
- **`io`**: I/O operations (pymongo, aiofiles)
- **`web`**: Web services (fastapi, uvicorn, websockets)

### Machine Learning
- **`nlp`**: Natural language processing (transformers, sentence-transformers)
- **`audio-ml`**: Audio processing and ML (torch, librosa, soundfile)
- **`vision-ml`**: Computer vision (torch, torchvision, pillow, opencv)
- **`hf`**: HuggingFace ecosystem (transformers, datasets, accelerate)
- **`data`**: Data processing (pandas, numpy, scipy, scikit-learn)
- **`embeddings`**: Vector databases (chromadb, faiss, hnswlib)

### Infrastructure
- **`metrics`**: Monitoring (prometheus-client, psutil)
- **`k8s`**: Kubernetes deployment (kubernetes, pyyaml)
- **`openvino`**: Intel optimization (openvino, optimum)

### Integrations
- **`discord`**: Discord bots (discord.py, aiohttp)

### Development
- **`dev`**: Development tools (pytest, black, flake8, mypy)

### Migration Support
- **`legacy-cpu`**: Compatibility extra for gradual migration from shared requirements

## Usage in Services

Replace shared requirements includes with extras:

**Before:**
```
# requirements.cpu.in
-r ../../shared/py/requirements.cpu.in
discord.py==2.5.2
```

**After:**
```
# requirements.cpu.in
promethean-shared[discord,io]==0.1.0
-c ../../../constraints.txt
```

## Import-time Validation

The package includes import-time hints to fail loudly if required extras are missing:

```python
try:
    import discord
except ImportError:
    raise ImportError(
        "Discord integration requires: pip install promethean-shared[discord]"
    )
```

## Migration Strategy

1. **Phase 0**: Use constraints.txt for version pinning
2. **Phase 1**: Migrate services to use `legacy-cpu` extra
3. **Phase 2**: Gradually replace `legacy-cpu` with specific extras
4. **Phase 3**: Remove legacy extra once all services are migrated

## CI Validation

Use `tools/check_extras.py` to validate that services only use the extras they need:

```bash
python tools/check_extras.py --service discord_indexer --expected discord,io
```
