TS_SRC=shared/ts
TS_OUT=shared/js
SERVICES_TS=services/ts/cephalon services/ts/discord-embedder services/ts/llm services/ts/voice services/ts/file-watcher

lint-ts:
	@$(call run_dirs,$(SERVICES_TS),npx eslint . --no-warn-ignored --ext .js,.ts)
format-ts:
	@$(call run_dirs,$(SERVICES_TS),npx prettier --write .)
typecheck-ts:
	@$(call run_dirs,$(SERVICES_TS),npx tsc --noEmit)
setup-ts:
	@echo "Setting up TypeScript services..."
	@$(call run_dirs,$(SERVICES_TS),npm install )
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
	       @$(call run_dirs,$(SERVICES_TS),echo "Running tests in $$d..." \&\& npm test)

# Eventually also test-shared-ts
test-ts: test-ts-services

coverage-ts-services:
	       @$(call run_dirs,$(SERVICES_TS),echo "Generating coverage in $$d..." \&\& npm run coverage)
coverage-ts: coverage-ts-services
clean-ts:
		       @$(call run_dirs,$(SERVICES_TS),npm run clean >/dev/null)
	rm -rf $(TS_OUT)/*


build-ts:
	@echo "Transpiling TS to JS... (if we had any shared ts modules)"
	@$(call run_dirs,$(SERVICES_TS),npm run build )
