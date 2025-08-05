# download_chroma_data.sh

**Path**: `agents/duck/scripts/download_chroma_data.sh`

**Purpose**: Retrieve the prebuilt Chroma embedding database used by Duck for semantic search. The archive is downloaded and extracted into `agents/duck/chroma_data/`.

## Usage
```bash
./agents/duck/scripts/download_chroma_data.sh
```
Run from the repository root. The script creates the `chroma_data` directory if it does not exist and fetches the archive from Hugging Face.

## Environment variables
None. The script uses static URLs and only relies on local file paths.
