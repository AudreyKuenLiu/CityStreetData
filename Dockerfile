# syntax=docker/dockerfile:1

#for web app
FROM node:20-alpine AS development-dependencies-env
COPY ./frontend /app
WORKDIR /app
RUN npm ci

FROM node:20-alpine AS production-dependencies-env
COPY ./frontend/package.json ./frontend/package-lock.json /app/
WORKDIR /app
RUN npm ci --omit=dev

FROM node:20-alpine AS build-env
COPY ./frontend/ /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
RUN npm run build

# Build the application from source
FROM golang:1.24 AS build-stage
WORKDIR /app
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
#FROM ubuntu:22.04 AS build-release-stage
FROM golang:1.24 AS build-release-stage
WORKDIR /
RUN apt-get update
RUN apt-get install -y libgeos-dev
RUN apt install -y libc6
RUN apt-get install -y git
RUN go install github.com/air-verse/air@latest
COPY --from=build-stage /citystreetdata /backend/citystreetdata
COPY ./frontend/package.json ./frontend/package-lock.json /frontend/
COPY --from=production-dependencies-env /app/node_modules /frontend/node_modules
COPY --from=build-env /app/dist /frontend/dist
EXPOSE 8080

#ENTRYPOINT ["/backend/citystreetdata"]
