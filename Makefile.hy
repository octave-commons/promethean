
setup-hy:
	@echo "Setting up Hy services..."


setup-hy-service-%:
	@echo "Setting up Hy service: $*"
	cd services/$* && pipenv install --dev
