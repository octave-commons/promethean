---
uuid: 'test-malformed-yaml-001'
title: 'Test Malformed YAML Detection'
status: 'incoming'
priority: 'P1'
labels: ['test', 'validation']
created_at: '2025-10-28T00:00:00Z'
estimates:
  complexity: 3
  scale: 'medium'
  # Missing time_to_completion value - should cause YAML error
storyPoints: 3
extra_field_with_no_value:
---

# Test Malformed YAML

This task intentionally has malformed YAML to test if the system properly detects and rejects it.
