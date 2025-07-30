# === Global Settings ===
PY_BUILD_DIR=shared/py
JS_BUILD_DIR=shared/js
HYPHON_SRC=shared/hy
SIBILANT_SRC=shared/sibilant
TS_SRC=shared/ts
TS_OUT=shared/js

# === High-Level Targets ===

.PHONY: all build clean lint format test setup install system-deps start stop start-tts start-stt stop-tts stop-stt \
        board-sync kanban-from-tasks kanban-to-hashtags kanban-to-issues coverage coverage-python coverage-js simulate-ci

SERVICES_PY=services/stt services/tts services/discord_indexer services/stt_ws services/whisper_stream_ws
SERVICES_JS=services/cephalon services/discord-embedder services/llm services/vision services/voice

all: build

build: build-python build-js

clean: clean-python clean-js clean-ts

lint: lint-python lint-js

format: format-python format-js

test: test-python test-js
# === Workflow Simulation ===
simulate-ci:
	act -W .github/workflows/tests.yml pull_request

# === Python/HY ===

build-python:
	@echo "Transpiling Hy to Python..."
	@echo "Done."

clean-python:
	find $(PY_BUILD_DIR) -name '*.pyc' -delete

lint-python:
	flake8 services/ shared/py/

format-python:
	black services/ shared/py/

test-python:
	pytest tests/

test-python-services:
	@for d in $(SERVICES_PY); do \
		echo "Running tests in $$d...";\
		cd $$d && PIPENV_NOSPIN=1 pipenv run pytest tests/ --cov=./ --cov-report=xml --cov-report=term && cd - >/dev/null; \
	done


# === JS/TS/Sibilant ===

build-js: build-ts build-sibilant

build-sibilant:
	@echo "Transpiling Sibilant to JS... (not ready)"
# npx sibilant $(SIBILANT_SRC)/common -o $(JS_BUILD_DIR)/common
# npx sibilant $(SIBILANT_SRC)/server -o $(JS_BUILD_DIR)/server
# npx sibilant $(SIBILANT_SRC)/client -o $(JS_BUILD_DIR)/client

build-ts:
	@echo "Transpiling TS to JS... (if we had any shared ts modules)"
	@for d in $(SERVICES_JS); do \
		cd $$d && npm run build >/dev/null; \
		cd - >/dev/null; \
	done
# tsc -p $(TS_SRC)

clean-js:
	rm -rf $(JS_BUILD_DIR)/*

clean-ts:
	@for d in $(SERVICES_JS); do \
		cd $$d && npm run clean >/dev/null; \
		cd - >/dev/null; \
	done
	rm -rf $(TS_OUT)/*

lint-js:
	@for d in $(SERVICES_JS); do \
		cd $$d && npx eslint . --ext .js,.ts && cd - >/dev/null; \
	done

format-js:
	@for d in $(SERVICES_JS); do \
		cd $$d && npx prettier --write . && cd - >/dev/null; \
	done

test-js:
	npm test

# === Coverage ===

coverage-python:
	pytest --cov=./ --cov-report=xml --cov-report=term

coverage-js:
	npx c8 --reporter=text --reporter=lcov npm test

coverage: coverage-python coverage-js

# === Service Management ===
setup-ts:
	@echo "Setting up TypeScript services..."
	@for d in $(SERVICES_JS); do \
		cd $$d && npm install --no-package-lock && cd - >/dev/null; \
	done
setup-js:
	@echo "Setting up JavaScript services..."
	@for d in $(SERVICES_JS); do \
		cd $$d && npm install --no-package-lock && cd - >/dev/null; \
	done
setup-python:
	@echo "Setting up Python services..."
	@for d in $(SERVICES_PY); do \
		cd $$d && PIPENV_NOSPIN=1 pipenv install --dev --skip-lock && cd - >/dev/null; \
	done
setup-hy:
	@echo "Setting up Hy services..."
setup-sibilant:
	@echo "Setting up Sibilant services..."
setup-core:
	@echo "Setting up core services..."
	@echo "installing pip"
	python -m pip install --upgrade pip
	@echo "installing pipenv"
	python -m pip install pipenv
	@echo "setting up root pipenv"
	pipenv install --dev --skip-lock --system

setup:
	@echo "Setting up all services..."
	setup-core
	setup-python
	setup-js
	setup-ts
	setup-hy
	setup-sibilant
setup-js-service-%:
	@echo "Setting up JS service: $*"
	cd services/$* && npm install --no-package-lock
setup-python-service-%:
	@echo "Setting up Python service: $*"
	cd services/$* && PIPENV_NOSPIN=1 pipenv install --dev --skip-lock
setup-sibilant-service-%:
	@echo "Setting up Sibilant service: $*"
	cd services/$* && npx sibilant --install
setup-hy-service-%:
	@echo "Setting up Hy service: $*"
	cd services/$* && pipenv install --dev --skip-lock
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

test-python-service-%:
	@echo "Running tests for Python service: $*"
	PIPENV_NOSPIN=1 pipenv run pytest services/$*

test-js-service-%:
	@echo "Running tests for JS service: $*"
	cd services/$* && npm test

lint-python-service-%:
	@echo "Linting Python service: $*"
	flake8 services/$*

lint-js-service-%:
	@echo "Linting JS service: $*"
	cd services/$* && npx eslint . --ext .js,.ts

board-sync:
	python scripts/github_board_sync.py

kanban-from-tasks:
	python scripts/hashtags_to_kanban.py > docs/agile/boards/kanban.md

kanban-to-hashtags:
	python scripts/kanban_to_hashtags.py

kanban-to-issues:
	python scripts/kanban_to_issues.py
