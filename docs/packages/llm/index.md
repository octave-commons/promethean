# LLM Service

The LLM service loads language models through pluggable drivers. Two drivers are provided:

- **ollama** – uses a local [Ollama](https://ollama.com) server.
- **huggingface** – uses models from the Hugging Face Hub via `transformers` or the Inference API.

## Configuration

Choose the driver and model in `config/config.yml`:

```yaml
llm:
    driver: ollama # or huggingface
    model: gemma3:latest
```

Environment variables override the config:

- `LLM_DRIVER` – provider name (`ollama` or `huggingface`).
- `LLM_MODEL` – model identifier for the selected provider.

## Usage

Python:

```python
from llm.main import load_model

driver, model = load_model()
```

TypeScript:

```ts
import { loadModel } from '../../../services/ts/llm/dist/index.js';

const driver = await loadModel();
```

See the driver implementations in `services/py/llm/drivers/` and `services/ts/llm/src/drivers/` for details.
