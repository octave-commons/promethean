COMMANDS := all build clean lint format test setup setup-quick install system-deps start stop start-tts start-stt stop-tts stop-stt \
        board-sync kanban-from-tasks kanban-to-hashtags kanban-to-issues coverage coverage-python coverage-js coverage-ts simulate-ci \
        generate-requirements setup-python-quick test-python test-js test-ts docker-build docker-up docker-down \
        setup-hy

.PHONY: $(COMMANDS) generate-requirements-service-% setup-hy-service-%

$(COMMANDS):
	@hy Makefile.hy $@

generate-requirements-service-% setup-hy-service-%:
	@hy Makefile.hy $@
