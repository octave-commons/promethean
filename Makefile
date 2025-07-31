# === Global Settings ===
HYPHON_SRC=shared/hy
SIBILANT_SRC=shared/sibilant
include Makefile.core
include Makefile.python
include Makefile.js
include Makefile.ts
include Makefile.hy
include Makefile.sibilant


# === High-Level Targets ===

.PHONY: all build clean lint format test setup install system-deps start stop start-tts start-stt stop-tts stop-stt \
        board-sync kanban-from-tasks kanban-to-hashtags kanban-to-issues coverage coverage-python coverage-js coverage-ts simulate-ci


all: build

build: build-python build-js build-ts
clean: clean-python clean-js clean-ts
lint: lint-python lint-js lint-ts
format: format-python format-js lint-ts
test: test-python-services test-js-services test-js-services
coverage: coverage-python coverage-js coverage-ts
setup:
	@echo "Setting up all services..."
	@$(MAKE) setup-python
	@$(MAKE) setup-js
	@$(MAKE) setup-ts
	@$(MAKE) setup-hy
	@$(MAKE) setup-sibilant

install: setup

system-deps:
	sudo apt-get update && sudo apt-get install -y libsndfile1

start:
	pm2 start ecosystem.config.js

stop:
	pm2 stop ecosystem.config.js || true

start-%:
	pm2 start ecosystem.config.js --only $*

stop-%:
	pm2 stop $* || true

board-sync:
	python scripts/github_board_sync.py

kanban-from-tasks:
	python scripts/hashtags_to_kanban.py > docs/agile/boards/kanban.md

kanban-to-hashtags:
	python scripts/kanban_to_hashtags.py

kanban-to-issues:
	python scripts/kanban_to_issues.py
