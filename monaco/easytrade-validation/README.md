# Easytrade Validation

A complete monaco configuration for Easytrade validation. It includes:

- site reliability guardians that check the bizevents
- workflows that trigger the SRG and send out notifications
- slack connection configuration

## How it works

The entire flow is based on workflows which trigger the guardians and send out notifications

### Site Reliability Guardian

There are 3 separate guardians as of now:

- _easytrade-k8s-bizevents:_ checks the quantities of bizevents coming from capture rules
- _easytrade-k8s-bizevents-frontend:_ check the quantities of bizevents ingested directly in the frontend app
- _easytrade-k8s-loadgen-visits:_ checks the quantity of visits run by load generator as well as their failure rate

The mechanism of **variables** is used in the guardians to:

- provide a single place to define all the default quantities for the guardian
- allow for override of the specific quantities per run
- allow the flexibility of running the guardian over different timeframes
  - all the default quantities are defined for 15m timeframe
    - this value is stored in `referenceTimeframeMinutes`
  - desired timeframe is given by `timeframeMinutes` variable
    - the desired quantity will be calculated as `referenceQuantity * (timeframeMinutes / referenceTimeframeMinutes)`

### Workflows

#### Triggers

There are 2 workflows used for triggering:

- `easytrade-k8s-trigger-validation:` used to manually trigger the flow
- `easytrade-k8s-trigger-validation-cron:` will trigger the flow based on the cron expression

Both of the triggers will ingest a **bizevent** of `demoability.validation.trigger` type

#### Running validation

The `easytrade-k8s-run-validation` is triggered by bizevent of `demoability.validation.trigger` type and then:

- runs all the relevant guardians
- aggregates the results from all the guardians
- ingests a `demoability.validation.result` bizevent

#### Sending notifications

The `easytrade-k8s-send-test-notification` workflow is triggered by bizevent of `demoability.validation.result` bizevent and then:

- runs JS preprocess step to prepare data for filling template
- sends a slack message according to predefined template

### Slack config

To allow for the message to be send an outbound connection to `slack.com` is defined
To create a slack connection a slack bot token is required. Here's an example [guide](https://zapier.com/blog/how-to-build-chat-bot/) on how to create it.

> If you don't want a slack workflow set the `skip: true` in `config.yaml` for it
