#!/bin/bash

getValidationResult() {
    URL=${TENANT_URL}/platform/storage/query/v1/query:execute?enrich=metric-metadata

    QUERY="fetch bizevents, from: now() - ${TIMEFRAME} | filter event.type == \"${EVENT_TYPE}\" and tags.job.id == \"${JOB_ID}\""
    echo Running DQL query: $QUERY

    BODY=$(jq -cn --arg query "$QUERY" --argjson requestTimeoutMilliseconds 1000 '$ARGS.named')

    RESPONSE=$(curl -sfLX POST "$URL" \
        --header "Content-Type: application/json" \
        --header "Accept: application/json" \
        --header "Authorization: Bearer ${ACCESS_TOKEN}" \
        --data-raw "${BODY}")
    # Ensure that all validations have passed
    RESULT=$(echo $RESPONSE | jq 'all(.[]; .result == "pass")')

    echo Found result [${RESULT}] for job [JOB_ID::${JOB_ID}]
    if [[ "$RESULT" == "true" ]]; then
        return 0
    fi

    # On fail, list failed validations
    FAILED_VALIDATIONS=$(echo $RESPONSE | jq -c '[.[] | select(.result != "pass") | .name]')
    echo "Failed validations: ${FAILED_VALIDATIONS}"

    return 1
}

for ATTEMPT in $(seq 1 $RETRIES); do
    echo "Waiting [${INTERVAL_SECONDS}s] for results of job [JOB_ID::${JOB_ID}] try [${ATTEMPT}/${RETRIES}]"
    sleep $INTERVAL_SECONDS

    if getValidationResult; then
        echo "Successfully validated the deployment"
        echo "result=pass" >>$GITHUB_OUTPUT
        exit 0
    fi
done

echo "::error::Failed to validate deployment"
echo "result=fail" >>$GITHUB_OUTPUT
exit 1
