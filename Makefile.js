JS_BUILD_DIR=shared/js
SERVICES_JS=services/js/vision

lint-js:
	       @$(call run_dirs,$(SERVICES_JS),npx eslint . --ext .js,.ts)

format-js:
	       @$(call run_dirs,$(SERVICES_JS),npx prettier --write .)

setup-js:
	       @echo "Setting up JavaScript services..."
	       @$(call run_dirs,$(SERVICES_JS),npm install --no-package-lock)

lint-js-service-%:
	@echo "Linting JS service: $*"
	cd services/js/$* && npx eslint . --ext .js,.ts

setup-js-service-%:
	@echo "Setting up JS service: $*"
	cd services/js/$* && npm install --no-package-lock

test-js-service-%:
	@echo "Running tests for JS service: $*"
	cd services/js/$* && npm test

test-js-services:
	       @$(call run_dirs,$(SERVICES_JS),echo "Running tests in $$d..." \&\& npm test)
test-js: test-js-services

coverage-js-services:
	@$(call run_dirs,$(SERVICES_JS),npm run coverage && npx c8 report -r lcov)
coverage-js: coverage-js-services

clean-js:
	rm -rf $(JS_BUILD_DIR)/*
build-js:
	@echo "No build step for JavaScript services"
