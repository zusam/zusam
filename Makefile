.ONESHELL:

CONTAINER_PGRM ?= $(shell command -v podman || command -v docker)
UID := $(shell id -u)
GID := $(shell id -g)
# Rootless podman maps the host user to container uid 0, so the hard-coded uid used by
# run.sh/dev_run.sh would land on an inaccessible subuid (and their chown -R would strip
# the host user of the whole repository). keep-id maps the host user to the same uid
# inside the container, which makes those assumptions hold. Empty for docker.
ROOTLESS := $(shell $(CONTAINER_PGRM) info --format '{{.Host.Security.Rootless}}' 2>/dev/null)
ifeq ($(ROOTLESS),true)
USERNS := --userns=keep-id
endif

TARGETS := dev prod compile-webapp integ-tests lint fmt unit-tests start-test start-dev
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

compile-webapp-local:
	cd app
	mkdir -p dist
	npm install --save-dev
	npm run build
	# no brace expansion here: recipes run under /bin/sh (busybox ash in the container)
	rm -f ../public/*.js ../public/*.css ../public/*.map ../public/*.png
	cp -r dist/* ../public/

compile-webapp: dev
	$(CONTAINER_PGRM) run --rm -it --name "zusam-lint" \
		$(USERNS) --user $(UID):$(GID) \
		-e UID=$(UID) -e GID=$(GID) \
		-v "$(CURDIR):/zusam:z" \
		$(DEV_OCI_IMAGE) \
		make compile-webapp-local

lint-api:
	cd api
	composer install --quiet
	composer fix
	composer lint

fmt-api:
	cd api
	composer install --quiet
	composer fix

lint-app:
	cd app
	npm install --save-dev
	npm run analyze
	npm run stylelint

fmt-app:
	cd app
	npm install --save-dev
	npm run fix
	npm run stylelint:fix

lint-integ-tests:
	set -e
	cd integration-tests
	python3 -m venv venv
	./venv/bin/pip install -q -r requirements.txt
	./venv/bin/ruff format --check .
	./venv/bin/ruff check .

.ONESHELL:
fmt-integ-tests:
	set -e
	cd integration-tests
	python3 -m venv venv
	./venv/bin/pip install -q -r requirements.txt
	./venv/bin/ruff format .
	./venv/bin/ruff check --fix .

lint-local: lint-api lint-app lint-integ-tests

lint: dev
	$(CONTAINER_PGRM) run --rm -it --name "zusam-lint" \
		$(USERNS) --user $(UID):$(GID) \
		-e UID=$(UID) -e GID=$(GID) \
		-v "$(CURDIR):/zusam:z" \
		$(DEV_OCI_IMAGE) \
		make lint-local

fmt-local: fmt-api fmt-app fmt-integ-tests

fmt: dev
	$(CONTAINER_PGRM) run --rm -it --name "zusam-lint" \
		$(USERNS) --user $(UID):$(GID) \
		-e UID=$(UID) -e GID=$(GID) \
		-v "$(CURDIR):/zusam:z" \
		$(DEV_OCI_IMAGE) \
		make fmt-local

unit-tests-local:
	cd api
	composer validate --strict
	composer install --prefer-dist --no-progress
	php bin/phpunit
	php bin/composer analyze
	php bin/composer lint

unit-tests: dev
	$(CONTAINER_PGRM) run --rm -it --name "zusam" \
		$(USERNS) --user $(UID):$(GID) \
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
		$(USERNS) --user 0:0 \
		-e UID=$(UID) -e GID=$(GID) \
		-v "$(CURDIR):/zusam:z" \
		$(DEV_OCI_IMAGE)

start-test: prod
	$(CONTAINER_PGRM) run --rm -it --name "zusam" \
		$(USERNS) --user 0:0 \
		-p 8080:8080 \
		-e UID=$(UID) -e GID=$(GID) \
		-v "$(CURDIR)"/translations:/zusam/translations:z \
		-v "$(CURDIR)"/data:/zusam/data:z \
		-v "$(CURDIR)"/public:/zusam/public:z \
		-v "$(CURDIR)"/api:/zusam/api:z \
		$(PROD_OCI_IMAGE)

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

.PHONY: nothing $(TARGETS) lint-local lint-api lint-app lint-integ-tests fmt-local fmt-api fmt-app fmt-integ-tests compile-webapp-local clean unit-tests-local
