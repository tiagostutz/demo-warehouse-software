FROM golang:1.14.3-alpine3.11 AS BUILD

# RUN apk add gcc build-base

ENV LOG_LEVEL 'info'

WORKDIR /app

ADD /go.mod /app/
ADD /go.sum /app/

RUN go mod download

ADD /globals /app/globals/
ADD /handlers /app/handlers/
ADD /helpers /app/helpers/
ADD /model /app/model/
ADD /watchers /app/watchers/
ADD main.go /app/

RUN go build -o /bin/database-autoupdater
RUN chmod +x /bin/database-autoupdater

RUN mkdir data
RUN chmod 777 data
VOLUME [ "/app/data" ]

ADD /startup.sh /
CMD [ "/startup.sh" ]
