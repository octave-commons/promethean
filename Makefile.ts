TS_SRC=shared/ts
TS_OUT=shared/js
SERVICES_TS=services/ts/cephalon services/ts/discord-embedder services/ts/llm  services/ts/voice
lint-ts:
	@for d in $(SERVICES_TS); do \
	cd $$d && npx eslint . --ext .js,.ts && cd - >/dev/null; \
	done
format-ts:
	@for d in $(SERVICES_TS); do \
	cd $$d && npx prettier --write . && cd - >/dev/null; \
	done
setup-ts:
	@echo "Setting up TypeScript services..."
	@for d in $(SERVICES_TS); do \
		cd $$d && npm install --no-package-lock && cd - >/dev/null; \
	done
lint-ts-service-%:
	@echo "Linting TS service: $*"
	cd services/ts/$* && npx eslint . --ext .js,.ts
setup-ts-service-%:
	@echo "Setting up TS service: $*"
	cd services/ts/$* && npm install --no-package-lock
test-ts-service-%:
	@echo "Running tests for TS service: $*"
	cd services/ts/$* && npm test
test-ts-services:
	@for d in $(SERVICES_TS); do \
		echo "Running tests in $$d...";\
		cd $$d && npm test && cd - >/dev/null; \
	done

# Eventually also test-shared-ts
test-ts: test-ts-services

coverage-ts-services:
	@for d in $(SERVICES_TS); do \
		echo "Generating coverage in $$d...";\
		cd $$d && npm run coverage && cd - >/dev/null; \
	done
coverage-ts: coverage-ts-services
clean-ts:
	@for d in $(SERVICES_TS); do \
		cd $$d && npm run clean >/dev/null; \
		cd - >/dev/null; \
	done
	rm -rf $(TS_OUT)/*


build-ts:
	@echo "Transpiling TS to JS... (if we had any shared ts modules)"
	@for d in $(SERVICES_TS); do \
		cd $$d && npm run build >/dev/null; \
		cd - >/dev/null; \
	done
