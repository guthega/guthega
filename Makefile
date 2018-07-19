webpack-build:
	yarn install
	webpack -p production

docker-build:
	docker build -t guthega .

build: webpack-build docker-build

run-docker:
	docker run --rm -it -v $(CURDIR)/conf/config.json:/opt/app/guthega/conf/config.json --network=confluent-docker_default guthega
