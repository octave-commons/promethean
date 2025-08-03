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

.PHONY: all build clean lint format test setup setup-quick install system-deps start stop start-tts start-stt stop-tts stop-stt \
        board-sync kanban-from-tasks kanban-to-hashtags kanban-to-issues coverage coverage-python coverage-js coverage-ts simulate-ci \
        generate-requirements generate-requirements-service-% setup-python-quick test-python test-js test-ts docker-build docker-up docker-down


all: build

build: build-js build-ts
clean: clean-js clean-ts
lint: lint-python lint-js lint-ts
test: test-python test-js test-ts
format: format-python format-js format-ts
coverage: coverage-python coverage-js coverage-ts
setup:
	@echo "Setting up all services..."
	@$(MAKE) setup-python
	@$(MAKE) setup-js
	@$(MAKE) setup-ts
	@$(MAKE) setup-hy
	@$(MAKE) setup-sibilant
	@command -v pm2 >/dev/null 2>&1 || npm install -g pm2

setup-quick:
	@echo "Quick setup using requirements.txt files..."
	@$(MAKE) setup-python-quick
	@$(MAKE) setup-js
	@$(MAKE) setup-ts
	@$(MAKE) setup-hy
	@$(MAKE) setup-sibilant
	@command -v pm2 >/dev/null 2>&1 || npm install -g pm2

install: setup

system-deps:
	sudo apt-get update && sudo apt-get install -y libsndfile1

start:
	pm2 start ecosystem.config.js

stop:
	pm2 stop ecosystem.config.js || true

start-tts:
	pm2 start ecosystem.config.js --only tts

start-stt:
	pm2 start ecosystem.config.js --only stt

stop-tts:
	pm2 stop tts || true

stop-stt:
	pm2 stop stt || true

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

simulate-ci:
	python scripts/simulate_ci.py

docker-build:
	docker compose build

docker-up:
	docker compose up -d

docker-down:
	docker compose down
