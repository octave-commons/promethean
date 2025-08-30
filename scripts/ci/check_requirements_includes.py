#!/usr/bin/env python3
"""
Check that requirements files don't use -r includes to shared requirements.
This enforces the new minimal requirements approach.
"""

import sys
import re
from pathlib import Path


def check_requirements_file(file_path: Path) -> list[str]:
    """Check a single requirements file for forbidden -r includes."""
    errors = []

    try:
        content = file_path.read_text()
        lines = content.splitlines()

        for line_num, line in enumerate(lines, 1):
            line = line.strip()

            # Skip comments and empty lines
            if not line or line.startswith("#"):
                continue

            # Check for -r includes to shared requirements
            if line.startswith("-r ") and "shared/" in line:
                errors.append(
                    f"{file_path}:{line_num}: Forbidden shared requirements include: {line}"
                )

    except Exception as e:
        errors.append(f"{file_path}: Error reading file: {e}")

    return errors


def main():
    """Main function to check all requirements files."""
    errors = []

    # Find all requirements files in services/
    services_dir = Path("services")
    if services_dir.exists():
        for req_file in services_dir.rglob("requirements*.in"):
            errors.extend(check_requirements_file(req_file))

    if errors:
        print("❌ Found forbidden shared requirements includes:")
        for error in errors:
            print(f"  {error}")
        print()
        print(
            "💡 Use constraints (-c ../../../constraints.txt) instead of shared requirements (-r)."
        )
        print("   Each service should declare only its direct dependencies.")
        return 1

    print("✅ No forbidden shared requirements includes found.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
