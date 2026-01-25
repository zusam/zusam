CONTAINER_PGRM := $(shell command -v podman || command -v docker)
UID := $(shell id -u)
GID := $(shell id -g)
TARGETS := clean dev prod compile-webapp integ-tests lint
DEV_OCI_IMAGE := zusam-dev
PROD_OCI_IMAGE := zusam

nothing:
	@echo "Available targets: $(TARGETS)"

dev:
	cpp -o Dockerfile container/dockerfile/dev.docker
	$(CONTAINER_PGRM) build -t $(DEV_OCI_IMAGE) -f Dockerfile .

prod:
	cpp -o Dockerfile container/dockerfile/prod.docker
	$(CONTAINER_PGRM) build -t $(PROD_OCI_IMAGE) -f Dockerfile .

.ONESHELL:
compile-webapp:
	cd app
	mkdir -p dist
	npm install --save-dev
	npm run build
	rm -rf ../public/*.{js,css,map,png}
	cp -r dist/* ../public/

.ONESHELL:
lint-api:
	cd api
	composer install --quiet
	composer lint

.ONESHELL:
lint-app:
	cd app
	npm install --save-dev
	npm run analyze
	npm run stylelint

.ONESHELL:
lint-integ-tests:
	cd integration-tests
	python3 -m venv venv
	./venv/bin/pip install -q -r requirements.txt
	./venv/bin/ruff check .

lint-local: lint-api lint-app lint-integ-tests

lint: dev
	$(CONTAINER_PGRM) run --rm -it --name "zusam-lint" \
		-e UID=$(UID) -e GID=$(GID) \
		-v "$(CURDIR):/zusam:z" \
		$(DEV_OCI_IMAGE) \
		make lint-local

start-dev: dev
	$(CONTAINER_PGRM) run --rm -it --name "zusam" \
		-e UID=$(UID) -e GID=$(GID) \
		-v "$(CURDIR):/zusam:z" \
		$(DEV_OCI_IMAGE)

start-test: prod
	$(CONTAINER_PGRM) run --rm -it --name "zusam" \
		-p 8080:8080 \
		-e UID=$(UID) -e GID=$(GID) \
		-v "$(CURDIR)"/translations:/zusam/translations:z \
		-v "$(CURDIR)"/data:/zusam/data:z \
		-v "$(CURDIR)"/public:/zusam/public:z \
		-v "$(CURDIR)"/api:/zusam/api:z \
		$(PROD_OCI_IMAGE)

.ONESHELL:
integ-tests: prod
	cd integration-tests
	$(CONTAINER_PGRM) compose up -d
	python3 -m venv venv
	./venv/bin/pip install -q -r requirements.txt
	./venv/bin/pytest -v --tb long -sl
	status=$$?
	$(CONTAINER_PGRM) compose down -v
	exit $$status

clean:
	rm -f Dockerfile

.PHONY: nothing $(TARGETS) lint-local lint-api lint-app lint-integ-tests
