---
uuid: "test-malformed-yaml-001"
title: "Test Malformed YAML Detection"
status: "incoming"
priority: "P1"
labels: ["test", "validation"]
created_at: "2025-10-28T00:00:00Z"
estimates:
  complexity: 3
  scale: "medium"
  # Missing closing quote - should break YAML parsing
  time_to_completion: "2 hours
storyPoints: 3
extra_field_with_no_value:
  # This creates an uneven map structure
  only_key_no_value:
---

# Test Malformed YAML

This task intentionally has malformed YAML to test if the system properly detects and rejects it.
