#!/bin/bash

if [ "$#" -lt 2 ]; then
    echo >&2 "Usage: ./curl-on-cluster.sh <NAMESPACE> <CURL ARGS>"
    exit 1
fi

NAMESPACE=$1
shift
ARGS=("$@")
POD_NAME=curl-$(date +%s%N)

echo >&2 "Running 'curl ${ARGS[@]}' in the pod $NAMESPACE/$POD_NAME"

kubectl run -n $NAMESPACE $POD_NAME --restart=Never --image=curlimages/curl -- "${ARGS[@]}" >&2

kubectl wait -n $NAMESPACE --for=jsonpath="{.status.containerStatuses[*].state.terminated}" --timeout=30s pod/$POD_NAME >&2

OUTPUT=$(kubectl logs -n $NAMESPACE $POD_NAME)

kubectl delete -n $NAMESPACE pod $POD_NAME >&2

echo $OUTPUT
