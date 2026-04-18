.PHONY: env prepare up down validate

# Populate .env from current user + render group
env:
	@echo "UID=$$(id -u)" > .env
	@echo "GID=$$(id -g)" >> .env
	@echo "RENDER_GID=$$(stat -c '%g' /dev/dri/render* 2>/dev/null | head -n1 || echo 0)" >> .env
	@echo ".env written."

# Pull and configure the model repo via the OVMS image
prepare: env
	mkdir -p models
	docker run --rm --user $$(id -u):$$(id -g) \
		-v $$(pwd)/models:/models:rw \
		openvino/model_server:latest \
		--pull \
		--model_repository_path /models \
		--source_model OpenVINO/Qwen3-Embedding-0.6B-int8-ov \
		--pooling LAST \
		--task embeddings
	docker run --rm --user $$(id -u):$$(id -g) \
		-v $$(pwd)/models:/models:rw \
		openvino/model_server:latest \
		--add_to_config \
		--config_path /models/config.json \
		--model_name OpenVINO/Qwen3-Embedding-0.6B-int8-ov \
		--model_path OpenVINO/Qwen3-Embedding-0.6B-int8-ov

up: env
	@. ./.env && export UID GID RENDER_GID && docker compose up -d

down:
	docker compose down

# Runs validate.sh — checks model ready + NPU device claim + embedding output
validate:
	@bash validate.sh
