.PHONY: all build clean lint format test setup setup-quick install system-deps start stop start-tts start-stt stop-tts stop-stt \
        board-sync kanban-from-tasks kanban-to-hashtags kanban-to-issues coverage coverage-python coverage-js coverage-ts simulate-ci \
        generate-requirements generate-requirements-service-% setup-python-quick test-python test-js test-ts docker-build docker-up docker-down \
        setup-hy setup-hy-service-%

%:
@hy Makefile.hy $@
