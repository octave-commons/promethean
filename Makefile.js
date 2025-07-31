JS_BUILD_DIR=shared/js
SERVICES_JS=services/js/vision

lint-js:
	@for d in $(SERVICES_JS); do \
		cd $$d && npx eslint . --ext .js,.ts && cd - >/dev/null; \
	done

format-js:
	@for d in $(SERVICES_JS); do \
		cd $$d && npx prettier --write . && cd - >/dev/null; \
	done

setup-js:
	@echo "Setting up JavaScript services..."
	@for d in $(SERVICES_JS); do \
		cd $$d && npm install --no-package-lock && cd - >/dev/null; \
	done

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
	@for d in $(SERVICES_JS); do \
		echo "Running tests in $$d...";\
		cd $$d && npm test && cd - >/dev/null; \
	done
test-js: test-js-services

coverage-js-services:
	@for d in $(SERVICES_JS); do \
		echo "Generating coverage in $$d...";\
		cd $$d && npm run coverage && cd - >/dev/null; \
	done
coverage-js: coverage-js-services

clean-js:
	rm -rf $(JS_BUILD_DIR)/*

build-js:
	@echo "No JS build step required"
