import { executionsClient } from "@dynatrace-sdk/client-automation"
import { businessEventsClient } from "@dynatrace-sdk/client-classic-environment-v2"

type ResultString = keyof typeof resultMapping
type TaskResult = {
  name: string
  result: string
  validationUrl: string
}
type Context = Record<string, unknown>
type EventData = {
  jobId: string
  jobProvider: string
  application: string
  timeframe: string
  context?: Context
}
type ResultBizevent = {
  "event.type": "demoability.validation.result"
  "event.provider": string
  "tags.job.id": string
  "tags.application": string
  result: ResultString
  details: TaskResult[]
  timeframeMinutes: string
  context?: Context
}

const validationTasks: string[] = [
  "bizevents_validation",
  "loadgen_visits_validation",
  "bizevents_frontend_validation",
]

const resultMapping = {
  error: 0,
  fail: 1,
  warning: 2,
  pass: 3,
}

export default async function ({ execution_id }) {
  const context = await getExecutionContext(execution_id)
  console.log("Execution context: ", context)
  const taskResults = await Promise.all(
    validationTasks.map((result) =>
      getTaskExecutionResult(execution_id, result)
    )
  )
  console.log("Tasks results: ", taskResults)
  const bizeventBody = getBizeventBody(context, taskResults)
  console.log("Sending result bizevent: ", bizeventBody)
  await ingestBizevent(bizeventBody)
}

async function getExecutionContext(executionId: string): Promise<EventData> {
  const execution = await executionsClient.getExecution({ id: executionId })
  // console.log("-- execution body", execution)
  const event = execution.params?.event
  return {
    jobId: event["tags.job.id"],
    jobProvider: event["event.provider"],
    application: event["tags.application"],
    timeframe: event["srg.variable.timeframe"],
    context: event["context"],
  }
}

async function getTaskExecutionResult(
  executionId: string,
  taskName: string
): Promise<TaskResult> {
  const result = await executionsClient.getTaskExecutionResult({
    executionId,
    id: taskName,
  })
  return {
    name: result.guardian_name,
    result: result.validation_status,
    validationUrl: result.validation_url,
  }
}

function resultMapper(result: string): ResultString {
  if (result in resultMapping) {
    return result as ResultString
  }
  console.error(
    `Result [${result}] not found in list of possible results [${Object.keys(
      resultMapping
    )}]`
  )
  return "error"
}

function getFinalResult(taskResults: { result: string }[]): ResultString {
  return taskResults
    .map(({ result }) => resultMapper(result))
    .reduce(
      (acc, curr) => (resultMapping[acc] < resultMapping[curr] ? acc : curr),
      "pass"
    )
}

function getBizeventBody(
  eventData: EventData,
  taskResults: TaskResult[]
): ResultBizevent {
  return {
    "event.type": "demoability.validation.result",
    "event.provider": eventData.jobProvider,
    "tags.job.id": eventData.jobId,
    "tags.application": eventData.application,
    timeframeMinutes: eventData.timeframe,
    result: getFinalResult(taskResults),
    details: taskResults.map(({ result, ...rest }) => ({
      ...rest,
      result: resultMapper(result),
    })),
    context: eventData.context,
  }
}

async function ingestBizevent(body: ResultBizevent) {
  await businessEventsClient.ingest({
    type: "application/json; charset=utf-8",
    body,
  })
}
