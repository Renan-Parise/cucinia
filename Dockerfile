FROM node:16.20-alpine3.18 AS JS_BUILD
COPY frontend /frontend
WORKDIR /frontend
RUN npm install && npm run build

FROM golang:1.22.1-alpine3.18 AS GO_BUILD
RUN apk update && apk add build-base
COPY backend /backend
WORKDIR /backend
RUN go build -o /go/bin/backend

FROM alpine:3.18.6
COPY --from=JS_BUILD /frontend/build* ./frontend/
COPY --from=GO_BUILD /go/bin/backend ./
CMD ./backend
