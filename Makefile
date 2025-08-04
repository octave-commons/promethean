COMMANDS := all build clean lint format test setup setup-quick install install-gha-artifacts system-deps start stop start-tts start-stt stop-tts stop-stt \
        board-sync kanban-from-tasks kanban-to-hashtags kanban-to-issues coverage coverage-python coverage-js coverage-ts simulate-ci \
        generate-requirements setup-python-quick test-python test-hy test-js test-ts docker-build docker-up docker-down \
        setup-hy setup-python setup-js setup-ts typecheck-python typecheck-ts build-ts build-js setup-pipenv compile-hy

.PHONY: $(COMMANDS) generate-requirements-service-% setup-hy-service-% \
        setup-python-service-% test-python-service-% coverage-python-service-% \
        setup-js-service-%    test-js-service-%    coverage-js-service-% \
        setup-ts-service-%    test-ts-service-%    coverage-ts-service-%

$(COMMANDS):
	@hy Makefile.hy $@

generate-requirements-service-% setup-hy-service-% \
setup-python-service-% test-python-service-% coverage-python-service-% \
setup-js-service-%    test-js-service-%    coverage-js-service-% \
setup-ts-service-%    test-ts-service-%    coverage-ts-service-%:
	@hy Makefile.hy $@
