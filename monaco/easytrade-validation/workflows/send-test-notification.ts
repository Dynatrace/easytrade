import { executionsClient } from "@dynatrace-sdk/client-automation"

const resultIcons = {
  error: "failed",
  fail: "failed",
  warning: "warning",
  pass: "passed",
}

type ResultString = keyof typeof resultIcons
type ValidationDetail = {
  name: string
  result: ResultString
  validationUrl: string
}
type Context = {
  enableChannelNotification?: boolean
}
type EventData = {
  result: ResultString
  details: ValidationDetail[]
  context?: Context
}
type ResultDetail = {
  name: string
  result: ResultString
  resultIcon: string
  validationUrl: string
}
type Result = {
  tenantUrl: string
  tenantId: string
  result: ResultString
  resultIcon: string
  sendFailNotification: boolean
  details: ResultDetail[]
}

export default async function ({ execution_id }) {
  const eventData = await getEventData(execution_id)
  console.log("Event data: ", eventData)
  const result: Result = {
    tenantId: globalThis.tenantId,
    tenantUrl: globalThis.environmentUrl,
    result: eventData.result,
    resultIcon: resultIcons[eventData.result],
    sendFailNotification:
      eventData.result !== "pass" &&
      (eventData.context?.enableChannelNotification ?? false),
    details: eventData.details.map(({ result, ...rest }) => ({
      ...rest,
      result,
      resultIcon: resultIcons[result],
    })),
  }
  console.log("Passing result to slack step: ", result)
  return result
}

async function getEventData(executionId: string): Promise<EventData> {
  const execution = await executionsClient.getExecution({ id: executionId })
  // console.log("-- execution body", execution)
  const event = execution.params?.event
  let context: Context | undefined = undefined
  try {
    context = JSON.parse(event["context"])
  } catch (e) {
    console.log(
      `Couldn't parse context, this most likely is not a problem: ${e}`
    )
  }
  return {
    result: event["result"],
    details: JSON.parse(event["details"]),
    context,
  }
}
