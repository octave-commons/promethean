---
nexus: nexus-ai-chat-importer
plugin_version: "1.2.0"
provider: chatgpt
aliases: "OllamaEmbeddingFunction setup"
conversation_id: 68b5f62a-2924-832e-bdfe-0f9883fb2706
create_time: 09/01/2025 at 2:38 PM
update_time: 09/01/2025 at 2:39 PM
---

# Title: OllamaEmbeddingFunction setup

Created: 09/01/2025 at 2:38 PM
Last Updated: 09/01/2025 at 2:39 PM
Chat URL: https://chat.openai.com/c/68b5f62a-2924-832e-bdfe-0f9883fb2706


>[!nexus_user] **User** - 09/01/2025 at 2:38 PM
> OllamaEmbeddingFunction
<!-- UID: 90719db2-a4db-4075-a6b5-2cc7987c6590 -->




>[!nexus_agent] **Assistant** - 09/01/2025 at 2:38 PM
> ​The `OllamaEmbeddingFunction` is a utility provided by ChromaDB to generate text embeddings using Ollama's local embedding models. It's particularly useful for building applications like semantic search and retrieval-augmented generation (RAG).
> 
> ---
> 
> ### 🔧 Setting Up `OllamaEmbeddingFunction`
> 
> To use `OllamaEmbeddingFunction`, you need to have a local Ollama instance running with an appropriate embedding model. Here's how you can set it up:
> 
> 1. **Install and Start Ollama:**
> 
>  Ensure you have Ollama installed and running.
> 
>  ```bash
>  ollama serve
>  ```
> 
> 2. **Pull an Embedding Model:**
> 
>  Choose and download an embedding model. For instance:
> 
>  ```bash
>  ollama pull nomic-embed-text
>  ```
> 
>  This model is optimized for generating text embeddings.
> 
> 3. **Install ChromaDB:**
> 
>  If you haven't already, install ChromaDB:
> 
>  ```bash
>  pip install chromadb
>  ```
> 
> 4. **Initialize `OllamaEmbeddingFunction`:**
> 
>  In your Python code, set up the embedding function:
> 
>  ```python
>  from chromadb.utils.embedding_functions import OllamaEmbeddingFunction
> 
>  ollama_embedder = OllamaEmbeddingFunction(
>  model_name="nomic-embed-text",
>  url="http://localhost:11434/api/embeddings"
>  )
>  ```
> 
> 5. **Generate Embeddings:**
> 
>  Now, you can generate embeddings for your documents:
> 
>  ```python
>  documents = ["Document 1 text", "Document 2 text"]
>  embeddings = ollama_embedder(documents)
>  ```
> 
> ---
> 
> ### ⚙️ Key Parameters
> 
> - **`model_name`**: Specifies the embedding model to use. Models like `nomic-embed-text` are optimized for embeddings.
> 
> - **`url`**: The endpoint of your local Ollama server, typically `http://localhost:11434/api/embeddings`.
> 
> ---
> 
> ### 🧠 Model Recommendations
> 
> While you can use various models with Ollama, it's advisable to use models specifically trained for embeddings to ensure efficiency and accuracy. Some recommended models include:
> 
> - `nomic-embed-text`
> 
> - `mxbai-embed-large`
> 
> - `snowflake-arctic-embed`
> 
> These models are designed to produce high-quality embeddings suitable for tasks like semantic search.
> 
> ---
> 
> ### 🔄 Integration with ChromaDB
> 
> ChromaDB seamlessly integrates with `OllamaEmbeddingFunction`, allowing you to store and retrieve embeddings efficiently. You can create a persistent client and use it in conjunction with the embedding function to build robust applications.
> 
> ---
> 
> If you're interested in integrating `OllamaEmbeddingFunction` with frameworks like LangChain or LlamaIndex, or need assistance with specific use cases, feel free to ask!
<!-- UID: 8350bd77-0636-4b4a-bd2b-e2764fbc80e9 -->

---


