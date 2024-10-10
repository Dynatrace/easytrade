import { businessEventsClient } from "@dynatrace-sdk/client-classic-environment-v2"

export default async function () {
  const jobId = crypto.randomUUID().toString()
  const bizeventBody = {
    "timeframe.from": "now-1h",
    "timeframe.to": "now",
    "srg.variable.timeframe": 60,
    "tags.job.id": jobId,
    "tags.application": "easytrade-k8s",
    "event.provider": "workflows.cron",
    "event.type": "demoability.validation.trigger",
    context: {
      enableChannelNotification: true,
      enableMetricIngestion: true,
    },
  }

  console.log("Ingesting event: ", bizeventBody)
  businessEventsClient.ingest({
    type: "application/json; charset=utf-8",
    body: bizeventBody,
  })
}
