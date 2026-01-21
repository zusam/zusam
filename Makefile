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

.PHONY: clean dev prod nothing compile-webapp
clean:
	rm -f Dockerfile
