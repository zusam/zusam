CONTAINER_PGRM := $(shell command -v podman || command -v docker)
UID := $(shell id -u)
GID := $(shell id -g)
TARGETS := dev prod compile-webapp integ-tests lint unit-tests
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
compile-webapp-local:
	cd app
	mkdir -p dist
	npm install --save-dev
	npm run build
	rm -rf ../public/*.{js,css,map,png}
	cp -r dist/* ../public/

compile-webapp:
	$(CONTAINER_PGRM) run --rm -it --name "zusam-lint" \
		-e UID=$(UID) -e GID=$(GID) \
		-v "$(CURDIR):/zusam:z" \
		$(DEV_OCI_IMAGE) \
		make compile-webapp-local

.ONESHELL:
lint-api:
	cd api
	composer install --quiet
	composer fix
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

.ONESHELL:
unit-tests-local:
	cd api
	composer validate --strict
	composer install --prefer-dist --no-progress
	php bin/phpunit
	php bin/composer analyze
	php bin/composer lint

unit-tests: dev
	$(CONTAINER_PGRM) run --rm -it --name "zusam" \
		-e UID=$(UID) -e GID=$(GID) \
		-v "$(CURDIR):/zusam:z" \
		$(DEV_OCI_IMAGE) \
		make unit-tests-local

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
	rm -rf venv
	python3 -m venv venv
	./venv/bin/pip install -q -r requirements.txt
	./venv/bin/pytest -v --tb long -sl
	status=$$?
	if [ $$status -ne 0 ]; then
		$(CONTAINER_PGRM) logs zusam-integration-tests
	fi
	$(CONTAINER_PGRM) compose down -v
	exit $$status

clean:
	rm -f Dockerfile

.PHONY: nothing $(TARGETS) lint-local lint-api lint-app lint-integ-tests compile-webapp-local clean unit-tests-local
