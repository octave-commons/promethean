# Auto-generated Makefile. DO NOT EDIT MANUALLY.

COMMANDS := \
  all build clean lint format test test-e2e setup setup-quick install \
  install-gha-artifacts system-deps start stop \
  start-tts start-stt stop-tts stop-stt \
  board-sync kanban-from-tasks kanban-to-hashtags kanban-to-issues \
  coverage coverage-python coverage-js coverage-ts simulate-ci \
  docker-build docker-up docker-down \
  typecheck-python typecheck-ts build-ts build-js \
  setup-pipenv compile-hy \
  setup-python setup-python-quick setup-js setup-ts setup-hy \
  test-python test-js test-ts test-hy test-integration \
  generate-requirements generate-python-services-requirements generate-makefile

.PHONY: \
  $(COMMANDS) \
  setup-python-service- \
  setup-quick-service-python-service- \
  setup-quick-shared-python-service- \
  test-python-service- \
  test-shared-python-service- \
  coverage-python-service- \
  coverage-shared-python-service- \
  test-quick-service-python-service- \
  test-quick-shared-python-service- \
  coverage-quick-service-python-service- \
  coverage-quick-shared-python-service- \
  setup-js-service- \
  test-js-service- \
  coverage-js-service- \
  lint-js-service- \
  test-quick-service-js-service- \
  coverage-quick-service-js-service- \
  setup-ts-service- \
  test-ts-service- \
  coverage-ts-service- \
  lint-ts-service- \
  test-quick-service-ts-service- \
  coverage-quick-service-ts-service- \
  setup-hy-service- \
  test-hy-service- \
  test-quick-service-hy-service- \
  setup-sibilant-service- \
  start--service- \
  stop--service- \
  generate-requirements--service-

$(COMMANDS):
	@hy Makefile.hy $@

setup-python-service-%:
	@hy Makefile.hy $@

setup-quick-service-python-service-%:
	@hy Makefile.hy $@

setup-quick-shared-python-service-%:
	@hy Makefile.hy $@

test-python-service-%:
	@hy Makefile.hy $@

test-shared-python-service-%:
	@hy Makefile.hy $@

coverage-python-service-%:
	@hy Makefile.hy $@

coverage-shared-python-service-%:
	@hy Makefile.hy $@

test-quick-service-python-service-%:
	@hy Makefile.hy $@

test-quick-shared-python-service-%:
	@hy Makefile.hy $@

coverage-quick-service-python-service-%:
	@hy Makefile.hy $@

coverage-quick-shared-python-service-%:
	@hy Makefile.hy $@

setup-js-service-%:
	@hy Makefile.hy $@

test-js-service-%:
	@hy Makefile.hy $@

coverage-js-service-%:
	@hy Makefile.hy $@

lint-js-service-%:
	@hy Makefile.hy $@

test-quick-service-js-service-%:
	@hy Makefile.hy $@

coverage-quick-service-js-service-%:
	@hy Makefile.hy $@

setup-ts-service-%:
	@hy Makefile.hy $@

test-ts-service-%:
	@hy Makefile.hy $@

coverage-ts-service-%:
	@hy Makefile.hy $@

lint-ts-service-%:
	@hy Makefile.hy $@

test-quick-service-ts-service-%:
	@hy Makefile.hy $@

coverage-quick-service-ts-service-%:
	@hy Makefile.hy $@

setup-hy-service-%:
	@hy Makefile.hy $@

test-hy-service-%:
	@hy Makefile.hy $@

test-quick-service-hy-service-%:
	@hy Makefile.hy $@

setup-sibilant-service-%:
	@hy Makefile.hy $@

start--service-%:
	@hy Makefile.hy $@

stop--service-%:
	@hy Makefile.hy $@

generate-requirements--service-%:
	@hy Makefile.hy $@
