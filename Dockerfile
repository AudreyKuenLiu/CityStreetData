# syntax=docker/dockerfile:1

# Build the application from source
FROM golang:1.24 AS build-stage
#FROM ubuntu AS build-stage

WORKDIR /app

#COPY go.mod go.sum ./

COPY ./backend/. .
RUN apt-get update
RUN apt-get install -y libgeos-dev
RUN go mod download
RUN go mod tidy

RUN CGO_ENABLED=1 GOOS=linux go build -o /citystreetdata


# Run the tests in the container
# FROM build-stage AS run-test-stage
# RUN go test -v ./...

# Deploy the application binary into a lean image
#FROM gcr.io/distroless/base-debian11 AS build-release-stage
FROM ubuntu:22.04 AS build-release-stage

WORKDIR /

RUN apt-get update
RUN apt-get install -y libgeos-dev
RUN apt install -y libc6
	
COPY --from=build-stage /citystreetdata /citystreetdata

EXPOSE 8080

ENTRYPOINT ["/citystreetdata"]
