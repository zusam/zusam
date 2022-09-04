container_pgrm := $(shell command -v podman || command -v docker)

nothing:
	@echo "Use targets 'dev' or 'prod'"

dev:
	cpp -o Dockerfile container/dockerfile/dev.docker
	$(container_pgrm) build -t zusam-dev -f Dockerfile .

prod:
	cpp -o Dockerfile container/dockerfile/prod.docker
	$(container_pgrm) build -t zusam -f Dockerfile .

.PHONY: clean
clean:
	rm -f Dockerfile
