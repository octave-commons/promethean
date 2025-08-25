#!/bin/bash

git add .;git commit -m "preserving pre-test state."
sibilant -x ./tests/base.sibilant
