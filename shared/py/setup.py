#!/usr/bin/env python3
"""
Shared core package with extras-based dependency management.
This replaces the monolithic shared requirements approach.
"""

from setuptools import setup, find_packages

# Core dependencies - minimal base requirements
CORE_DEPS = [
    "python-dotenv>=1.0.0",
    "pydantic>=2.0.0",
    "requests>=2.28.0",
]

# Extras buckets for different functionality groups
EXTRAS = {
    # Core functionality
    "core": CORE_DEPS,
    # I/O and data handling
    "io": [
        "pymongo>=4.0.0",
        "aiofiles>=23.0.0",
    ],
    # Web services
    "web": [
        "fastapi>=0.100.0",
        "uvicorn>=0.20.0",
        "websockets>=11.0.0",
        "starlette>=0.27.0",
    ],
    # Natural Language Processing
    "nlp": [
        "transformers>=4.30.0",
        "tokenizers>=0.13.0",
        "sentence-transformers>=2.2.0",
        "huggingface-hub>=0.16.0",
    ],
    # Audio and ML
    "audio-ml": [
        "torch>=2.0.0",
        "torchaudio>=2.0.0",
        "librosa>=0.10.0",
        "soundfile>=0.12.0",
    ],
    # Vision and ML
    "vision-ml": [
        "torch>=2.0.0",
        "torchvision>=0.15.0",
        "pillow>=10.0.0",
        "opencv-python>=4.8.0",
    ],
    # HuggingFace ecosystem
    "hf": [
        "transformers>=4.30.0",
        "datasets>=2.12.0",
        "accelerate>=0.20.0",
        "safetensors>=0.3.0",
    ],
    # OpenVINO optimization
    "openvino": [
        "openvino>=2023.0.0",
        "optimum[openvino]>=1.9.0",
    ],
    # Metrics and monitoring
    "metrics": [
        "prometheus-client>=0.16.0",
        "psutil>=5.9.0",
    ],
    # Kubernetes and deployment
    "k8s": [
        "kubernetes>=26.1.0",
        "pyyaml>=6.0.0",
    ],
    # Data processing
    "data": [
        "pandas>=2.0.0",
        "numpy>=1.24.0",
        "scipy>=1.10.0",
        "scikit-learn>=1.3.0",
    ],
    # Discord integration
    "discord": [
        "discord.py>=2.3.0",
        "aiohttp>=3.8.0",
    ],
    # Vector databases and embeddings
    "embeddings": [
        "chromadb>=0.4.0",
        "faiss-cpu>=1.7.0",
        "hnswlib>=0.7.0",
    ],
    # Development tools
    "dev": [
        "pytest>=7.0.0",
        "pytest-asyncio>=0.21.0",
        "black>=23.0.0",
        "flake8>=6.0.0",
        "mypy>=1.0.0",
        "pre-commit>=3.0.0",
    ],
}

# Legacy compatibility - includes most heavy dependencies
# This allows gradual migration from the old shared requirements
EXTRAS["legacy-cpu"] = list(
    set(
        CORE_DEPS
        + EXTRAS["io"]
        + EXTRAS["web"]
        + EXTRAS["nlp"]
        + EXTRAS["audio-ml"]
        + EXTRAS["data"]
        + EXTRAS["discord"]
        + EXTRAS["embeddings"]
        + ["torch==2.7.1+cpu"]  # Specific CPU version
    )
)

# All extras combined (for development/testing)
EXTRAS["all"] = list(set(sum(EXTRAS.values(), [])))

setup(
    name="promethean-shared",
    version="0.1.0",
    description="Shared core package for Promethean services",
    packages=find_packages(),
    python_requires=">=3.9",
    install_requires=CORE_DEPS,
    extras_require=EXTRAS,
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Developers",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
    ],
)
