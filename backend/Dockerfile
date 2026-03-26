# Build stage
FROM golang:1.23-alpine AS builder

WORKDIR /app

# Install PostgreSQL client tools
RUN apk add --no-cache postgresql-client git gcc musl-dev

# Copy go.mod and go.sum
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy the source code
COPY . .

# Build the application
RUN CGO_ENABLED=1 GOOS=linux go build -a -installsuffix cgo -o backend .

# Final stage
FROM alpine:latest

WORKDIR /root/

# Install PostgreSQL client and ca-certificates for HTTPS
RUN apk --no-cache add ca-certificates postgresql-client

# Copy the binary from builder
COPY --from=builder /app/backend .

# Create uploads directory
RUN mkdir -p ./uploads

# Expose port
EXPOSE 8000

# Run the application
CMD ["./backend"]
