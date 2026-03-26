.PHONY: help build run test clean deps docker-build docker-up docker-down

help:
	@echo "Canopiq Backend - Go Migration"
	@echo "Available commands:"
	@echo "  make build        - Build the Go binary"
	@echo "  make run          - Run the application locally"
	@echo "  make test         - Run tests"
	@echo "  make clean        - Remove build artifacts"
	@echo "  make deps         - Download dependencies"
	@echo "  make docker-build - Build Docker image"
	@echo "  make docker-up    - Start services with Docker Compose"
	@echo "  make docker-down  - Stop Docker Compose services"
	@echo "  make fmt          - Format code"
	@echo "  make lint         - Run linter"

build:
	go build -o backend .

run: build
	./backend

test:
	go test ./...

clean:
	rm -f backend
	go clean

deps:
	go mod download
	go mod tidy

docker-build:
	docker-compose build backend

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

docker-logs:
	docker-compose logs -f backend

fmt:
	go fmt ./...

lint:
	golangci-lint run ./...

dev:
	go run main.go
