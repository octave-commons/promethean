#!/bin/bash
# Fetch chroma embedding data for Duck agent

set -e
DATA_DIR="$(dirname "$0")/../chroma_data"
mkdir -p "$DATA_DIR"

# Placeholder URL - replace with actual storage location
curl -L -o "$DATA_DIR/chroma_data.tar.gz" "https://huggingface.co/riatzukiza/duck-chroma/resolve/main/chroma_data.tar.gz"

tar -xzf "$DATA_DIR/chroma_data.tar.gz" -C "$DATA_DIR"

echo "Chroma data downloaded to $DATA_DIR"
