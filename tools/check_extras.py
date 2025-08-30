#!/usr/bin/env python3
"""
CI tool to validate that services only use the extras they actually need.
This enforces minimal dependency usage and prevents bloated environments.
"""

import argparse
import ast
import sys
from pathlib import Path
from typing import Dict, List, Set


# Mapping of import names to required extras
IMPORT_TO_EXTRAS = {
    # Core
    "dotenv": ["core"],
    "pydantic": ["core"],
    "requests": ["core"],
    # I/O
    "pymongo": ["io"],
    "aiofiles": ["io"],
    # Web
    "fastapi": ["web"],
    "uvicorn": ["web"],
    "websockets": ["web"],
    "starlette": ["web"],
    # NLP
    "transformers": ["nlp", "hf"],
    "tokenizers": ["nlp"],
    "sentence_transformers": ["nlp"],
    "huggingface_hub": ["nlp", "hf"],
    # Audio ML
    "torch": ["audio-ml", "vision-ml", "nlp"],
    "torchaudio": ["audio-ml"],
    "librosa": ["audio-ml"],
    "soundfile": ["audio-ml"],
    # Vision ML
    "torchvision": ["vision-ml"],
    "PIL": ["vision-ml"],
    "cv2": ["vision-ml"],
    # HuggingFace
    "datasets": ["hf"],
    "accelerate": ["hf"],
    "safetensors": ["hf"],
    # Data
    "pandas": ["data"],
    "numpy": ["data", "audio-ml", "vision-ml"],
    "scipy": ["data"],
    "sklearn": ["data"],
    # Discord
    "discord": ["discord"],
    "aiohttp": ["discord"],
    # Embeddings
    "chromadb": ["embeddings"],
    "faiss": ["embeddings"],
    "hnswlib": ["embeddings"],
    # Metrics
    "prometheus_client": ["metrics"],
    "psutil": ["metrics"],
    # K8s
    "kubernetes": ["k8s"],
    "yaml": ["k8s"],
    # OpenVINO
    "openvino": ["openvino"],
    "optimum": ["openvino"],
}


def extract_imports_from_file(file_path: Path) -> Set[str]:
    """Extract all import names from a Python file."""
    imports = set()

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            tree = ast.parse(f.read(), filename=str(file_path))
    except (SyntaxError, UnicodeDecodeError) as e:
        print(f"Warning: Could not parse {file_path}: {e}")
        return imports

    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                imports.add(alias.name.split(".")[0])
        elif isinstance(node, ast.ImportFrom):
            if node.module:
                imports.add(node.module.split(".")[0])

    return imports


def extract_imports_from_service(service_path: Path) -> Set[str]:
    """Extract all imports from all Python files in a service."""
    all_imports = set()

    for py_file in service_path.rglob("*.py"):
        # Skip __pycache__ and .venv directories
        if "__pycache__" in str(py_file) or ".venv" in str(py_file):
            continue
        all_imports.update(extract_imports_from_file(py_file))

    return all_imports


def get_required_extras(imports: Set[str]) -> Set[str]:
    """Determine which extras are required based on imports."""
    required_extras = set()

    for import_name in imports:
        if import_name in IMPORT_TO_EXTRAS:
            required_extras.update(IMPORT_TO_EXTRAS[import_name])

    return required_extras


def parse_requirements_extras(requirements_path: Path) -> Set[str]:
    """Parse extras from a requirements file."""
    if not requirements_path.exists():
        return set()

    extras = set()
    content = requirements_path.read_text()

    for line in content.splitlines():
        line = line.strip()
        if "promethean-shared[" in line:
            # Extract extras from promethean-shared[extra1,extra2]
            start = line.find("[") + 1
            end = line.find("]")
            if start > 0 and end > start:
                extras_str = line[start:end]
                extras.update(e.strip() for e in extras_str.split(","))

    return extras


def check_service_extras(
    service_path: Path, expected_extras: Set[str] = None
) -> Dict[str, any]:
    """Check if a service uses appropriate extras."""
    result = {
        "service": service_path.name,
        "path": str(service_path),
        "imports": set(),
        "required_extras": set(),
        "declared_extras": set(),
        "missing_extras": set(),
        "unused_extras": set(),
        "valid": True,
        "errors": [],
    }

    # Extract imports
    result["imports"] = extract_imports_from_service(service_path)

    # Determine required extras
    result["required_extras"] = get_required_extras(result["imports"])

    # Parse declared extras from requirements
    req_files = [
        service_path / "requirements.cpu.in",
        service_path / "requirements.gpu.in",
    ]

    for req_file in req_files:
        if req_file.exists():
            result["declared_extras"].update(parse_requirements_extras(req_file))

    # Use expected extras if provided
    if expected_extras:
        result["declared_extras"] = expected_extras

    # Check for missing and unused extras
    result["missing_extras"] = result["required_extras"] - result["declared_extras"]
    result["unused_extras"] = result["declared_extras"] - result["required_extras"]

    # Remove legacy-cpu from unused check (it's a migration helper)
    result["unused_extras"].discard("legacy-cpu")

    # Validate
    if result["missing_extras"]:
        result["valid"] = False
        result["errors"].append(f"Missing extras: {sorted(result['missing_extras'])}")

    if result["unused_extras"]:
        result["errors"].append(f"Unused extras: {sorted(result['unused_extras'])}")

    return result


def main():
    """Main function."""
    parser = argparse.ArgumentParser(description="Check service extras usage")
    parser.add_argument("--service", help="Service directory name")
    parser.add_argument("--expected", help="Comma-separated list of expected extras")
    parser.add_argument("--all", action="store_true", help="Check all services")
    parser.add_argument("--verbose", "-v", action="store_true", help="Verbose output")

    args = parser.parse_args()

    services_dir = Path("services/py")
    if not services_dir.exists():
        print("❌ services/py directory not found")
        return 1

    results = []

    if args.all:
        # Check all services
        for service_path in services_dir.iterdir():
            if service_path.is_dir() and not service_path.name.startswith("."):
                result = check_service_extras(service_path)
                results.append(result)
    elif args.service:
        # Check specific service
        service_path = services_dir / args.service
        if not service_path.exists():
            print(f"❌ Service {args.service} not found")
            return 1

        expected_extras = None
        if args.expected:
            expected_extras = set(e.strip() for e in args.expected.split(","))

        result = check_service_extras(service_path, expected_extras)
        results.append(result)
    else:
        parser.print_help()
        return 1

    # Print results
    all_valid = True
    for result in results:
        if not result["valid"]:
            all_valid = False
            print(f"❌ {result['service']}")
            for error in result["errors"]:
                print(f"   {error}")
        elif args.verbose:
            print(f"✅ {result['service']}")
            if result["declared_extras"]:
                print(f"   Extras: {sorted(result['declared_extras'])}")
            if result["required_extras"]:
                print(f"   Required: {sorted(result['required_extras'])}")

    if all_valid:
        print("✅ All services use appropriate extras")
        return 0
    else:
        print("\n💡 Fix by updating requirements.cpu.in to include missing extras")
        print("   Example: promethean-shared[web,io,discord]==0.1.0")
        return 1


if __name__ == "__main__":
    sys.exit(main())
