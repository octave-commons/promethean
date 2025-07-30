# === Global Settings ===
PY_BUILD_DIR=shared/py
JS_BUILD_DIR=shared/js
HYPHON_SRC=shared/hy
SIBILANT_SRC=shared/sibilant
TS_SRC=shared/ts
TS_OUT=shared/js

# === High-Level Targets ===

.PHONY: all build clean lint format test setup start stop start-tts start-stt stop-tts stop-stt \
	board-sync kanban-from-tasks kanban-to-hashtags kanban-to-issues coverage coverage-python coverage-js

SERVICES_PY=services/stt services/tts services/discord-indexer
SERVICES_JS=services/cephalon services/discord-embedder

all: build

build: build-python build-js

clean: clean-python clean-js clean-ts

lint: lint-python lint-js

format: format-python format-js

test: test-python test-js

# === Python/HY ===

build-python:
	@echo "Transpiling Hy to Python..."
	# Add real transpilation if needed
	@echo "Done."

clean-python:
	find $(PY_BUILD_DIR) -name '*.pyc' -delete

lint-python:
	flake8 services/ shared/py/

format-python:
	black services/ shared/py/

test-python:
	pytest tests/

# === JS/TS/Sibilant ===

build-js: build-ts build-sibilant

build-sibilant:
	@echo "Transpiling Sibilant to JS..."
	npx sibilant $(SIBILANT_SRC)/common -o $(JS_BUILD_DIR)/common
	npx sibilant $(SIBILANT_SRC)/server -o $(JS_BUILD_DIR)/server
	npx sibilant $(SIBILANT_SRC)/client -o $(JS_BUILD_DIR)/client

build-ts:
	@echo "Transpiling TS to JS..."
	tsc -p $(TS_SRC)

clean-js:
	rm -rf $(JS_BUILD_DIR)/*

clean-ts:
	rm -rf $(TS_OUT)/*

lint-js:
	eslint shared/js/ services/**/ --ext .js,.ts

format-js:
	prettier --write shared/js/ services/**/

test-js:
	npm test

# === Coverage ===

coverage-python:
	pytest --cov=./ --cov-report=xml --cov-report=term

coverage-js:
	npx c8 --reporter=text --reporter=lcov npm test

coverage: coverage-python coverage-js

# === Service Management ===

setup:
	pipenv install --dev
	@for d in $(SERVICES_PY); do \
	cd $$d && pipenv install --dev && cd - >/dev/null; \
	done
	@for d in $(SERVICES_JS); do \
		cd $$d && npm install && cd - >/dev/null; \
	done

start:
	pm2 start ecosystem.config.js

stop:
	pm2 stop ecosystem.config.js || true

start-%:
	pm2 start ecosystem.config.js --only $*

stop-%:
	pm2 stop $* || true

# === Kanban Board ===

board-sync:
	python scripts/github_board_sync.py

kanban-from-tasks:
	python scripts/hashtags_to_kanban.py > docs/agile/boards/kanban.md

kanban-to-hashtags:
	python scripts/kanban_to_hashtags.py

kanban-to-issues:
	python scripts/kanban_to_issues.py
