#!/usr/bin/env bash

git status


git log --all -- services/js/broker

# Replace <SHA> with the commit from step 1
git restore --source 4b3b12087759e6967918b4e3e5b0828b5813a370 -- services/js/broker
