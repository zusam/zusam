nothing:
	@echo "Use targets 'dev' or 'prod'"

dev:
	cpp -o Dockerfile container/dev.docker
	docker build -t zusam-dev -f Dockerfile .

prod:
	cpp -o Dockerfile container/prod.docker
	docker build -t zusam -f Dockerfile .

.PHONY: clean
clean:
	rm -f Dockerfile
