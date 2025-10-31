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
  time_to_completion: '2 hours'
storyPoints: 3
content: 'This contains a quote that breaks Clojure string interpolation: "'
---

# Test Malformed YAML

This task intentionally has malformed YAML to test if the system properly detects and rejects it.
