#!/bin/bash

COMPOSE_FILE="compose.dev.yaml"
COMMANDS="start|stop|build|flags|start-load|start-all"

if [[ $# < 1 ]]
then
    echo "Provide one of [${COMMANDS}]"
    exit 1
fi

case $1 in
    "start")
        docker compose -f $COMPOSE_FILE up --detach frontendreverseproxy contentcreator engine
    ;;
    "stop")
        docker compose -f $COMPOSE_FILE down --remove-orphans
    ;;
    "build")
        # $@ should always pass build and then all images that should be build if any are specified
        docker compose -f $COMPOSE_FILE "$@"
    ;;
    "flags")
        docker compose -f $COMPOSE_FILE up --detach feature-flag-service
    ;;
    "start-load")
        docker compose -f $COMPOSE_FILE up --detach frontendreverseproxy contentcreator engine loadgen
    ;;
    "start-all")
        docker compose -f $COMPOSE_FILE up --detach
    ;;
    *)
        echo "Unknown command [$1] use one of [${COMMANDS}]"
        exit 1
    ;;
esac