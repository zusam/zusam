container_pgrm := $(shell command -v podman || command -v docker)

nothing:
	@echo "Use targets 'dev' or 'prod'"

dev:
	cpp -o Dockerfile container/dockerfile/dev.docker
	$(container_pgrm) build -t zusam-dev -f Dockerfile .

prod:
	cpp -o Dockerfile container/dockerfile/prod.docker
	$(container_pgrm) build -t zusam -f Dockerfile .

.ONESHELL:
compile-webapp:
	cd app
	mkdir -p dist
	npm install --save-dev
	npm run build
	rm -rf ../public/*.{js,css,map,png}
	cp -r dist/* ../public/


integ-tests: prod
	cd integration-tests && \
	$(container_pgrm) compose up -d && \
	python3 -m venv venv && \
	./venv/bin/pip install -q -r requirements.txt && \
	./venv/bin/pytest -v; \
	status=$$?; \
	$(container_pgrm) compose down -v; \
	exit $$status

.PHONY: clean dev prod nothing compile-webapp integ-tests
clean:
	rm -f Dockerfile
