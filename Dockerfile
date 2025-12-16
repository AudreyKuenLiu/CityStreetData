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

# Deploy the application binary into a lean image
FROM golang:1.25.4-trixie AS build-release-stage
WORKDIR /backend
COPY ./backend/. .
RUN apt-get update
RUN apt upgrade
RUN apt-get install -y build-essential
RUN apt-get install -y pkg-config
RUN apt-get install -y libgeos-dev
RUN apt-get install -y libsqlite3-mod-spatialite
RUN apt-get install -y libsqlite3-dev
# RUN apt-get install -y libspatialite-dev
RUN go mod download
RUN go mod tidy
ENV CGO_ENABLED=1
ENV CGO_CFLAGS="-g -O2 -Wno-return-local-addr"
# RUN go build --tags "libsqlite3 linux json1" -o ./citystreetdata

WORKDIR /
RUN apt install -y libc6
RUN apt-get install -y git
RUN go install github.com/air-verse/air@latest
COPY ./frontend/package.json ./frontend/package-lock.json /frontend/
COPY --from=production-dependencies-env /app/node_modules /frontend/node_modules
COPY --from=build-env /app/dist /frontend/dist
EXPOSE 8080

#setting up local db
ARG SQLITE_DB
ENV SQLITE_DB=${SQLITE_DB}
RUN apt install -y sqlite3
RUN mkdir -p /database/startup
COPY ./database/startup/initSqlite.sh /database/startup/initSqlite.sh
RUN chmod +x /database/startup/initSqlite.sh
RUN ./database/startup/initSqlite.sh

#setting up local airflow
ARG _AIRFLOW_WWW_EMAIL
ARG _AIRFLOW_WWW_USER_USERNAME
ARG _AIRFLOW_WWW_USER_PASSWORD
ARG AIRFLOW_HOME
ARG AIRFLOW__CORE__FERNET_KEY
ARG AIRFLOW__CORE__EXECUTION_API_SERVER_URL
ENV _AIRFLOW_WWW_EMAIL=${_AIRFLOW_WWW_EMAIL}
ENV _AIRFLOW_WWW_USER_USERNAME=${_AIRFLOW_WWW_USER_USERNAME}
ENV _AIRFLOW_WWW_USER_PASSWORD=${_AIRFLOW_WWW_USER_PASSWORD}
ENV AIRFLOW_HOME=${AIRFLOW_HOME}
ENV AIRFLOW__CORE__FERNET_KEY=${AIRFLOW__CORE__FERNET_KEY}
ENV AIRFLOW__CORE__EXECUTION_API_SERVER_URL=${AIRFLOW__CORE__EXECUTION_API_SERVER_URL}
COPY ./database/startup/initAirflow.sh /database/startup/initAirflow.sh
RUN chmod +x /database/startup/initAirflow.sh
RUN ./database/startup/initAirflow.sh 
EXPOSE 8081