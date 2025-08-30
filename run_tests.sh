#!/bin/bash

# Run core tests
echo "Running core tests..."
bb -e "(require 'mk.mcp-core-test) (require '[clojure.test :as t]) (t/run-tests 'mk.mcp-core-test)"

# Run TOML adapter tests
echo -e "\nRunning TOML adapter tests..."
bb -e "(require 'mk.mcp-adapter-codex-toml-test) (require '[clojure.test :as t]) (t/run-tests 'mk.mcp-adapter-codex-toml-test)"
