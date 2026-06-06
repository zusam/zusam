CONTAINER_PGRM ?= $(shell command -v podman || command -v docker)
UID := $(shell id -u)
GID := $(shell id -g)
TARGETS := dev prod compile-webapp integ-tests lint unit-tests start-test start-dev
DEV_OCI_IMAGE := zusam-dev
PROD_OCI_IMAGE := zusam
PLAYWRIGHT_WORKERS := 1

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

compile-webapp: dev
	$(CONTAINER_PGRM) run --rm -it --name "zusam-lint" \
		--user $(UID):$(GID) \
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

define RUN_PLAYWRIGHT
	docker network create playwright-network
	cd test && $(CONTAINER_PGRM) compose -f compose-$(1).yaml up -d
	trap 'cd ../test && $(CONTAINER_PGRM) compose -f compose-default.yaml down' EXIT;
	until curl -s http://localhost:8532 > /dev/null; do \
		echo "Waiting for app..."; \
		sleep 5; \
	done
	cd ../app && PLAYWRIGHT_HTML_OPEN=never npx playwright test e2e/$(1)-config $(2) --workers $(PLAYWRIGHT_WORKERS)
	docker network rm playwright-network
	cd ..
endef

define RUN_PLAYWRIGHT_CONTAINER
	docker network create playwright-network
	cd test && $(CONTAINER_PGRM) compose -f compose-$(1).yaml up -d
	until curl -s http://localhost:8532 > /dev/null; do \
		echo "Waiting for app..."; \
		sleep 5; \
	done; \
	docker run -it --rm \
		--network playwright-network \
		--ipc=host \
		-v "../app:/app" -w /app \
		-e PLAYWRIGHT_HTML_OPEN=never \
		-e PLAYWRIGHT_BASE_URL=http://zusam-test:8080 \
		mcr.microsoft.com/playwright:v1.60.0-jammy \
		npx playwright test e2e/$(1)-config --workers $(PLAYWRIGHT_WORKERS)
	$(CONTAINER_PGRM) compose -f compose-$(1).yaml down; 
	docker network rm playwright-network
	cd ..
endef

playwright-default-ci:
	$(call RUN_PLAYWRIGHT,default)

playwright-nondefault-ci:
	$(call RUN_PLAYWRIGHT,nondefault)

playwright:
	$(call RUN_PLAYWRIGHT_CONTAINER,default)
	$(call RUN_PLAYWRIGHT_CONTAINER,nondefault)

playwright-ui:
	$(call RUN_PLAYWRIGHT,default,--ui)
	$(call RUN_PLAYWRIGHT,nondefault,--ui)

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
