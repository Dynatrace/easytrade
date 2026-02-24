# EasyTrade

## Observability & Monitoring

Components of this repository are deployed to a Kubernetes Cluster and monitored by Dynatrace.

### Finding EasyTrade Service Entities

You can find entities via the `find_entities_by_name` tool using `easytrade` as well as specific service names (see service list in README).
You should find entities like `[eks-playground][easytrade] BrokerService`.

### Finding Problems

You can find problems via the `list_problems` tool and applying the following filter:

```dql
in(k8s.namespace.name, array("easytrade")) OR contains(dt.entity.application.name, "EasyTrade")
```

If you want to narrow down the problem of a specific entity, like a service, you can use the following filter:

```dql
in(affected_entity_ids, "<entity-id>") OR matchesValue(affected_entity_ids, "<entity-id>") OR dt.entity.$type == "<entity-id>" OR ...
```

### Metrics

> **Important DQL rules for metrics:**
> - Always use `timeseries` to query metrics. **Never use `fetch <metric-key>`** — metric keys like `dt.service.request.response_time` are not valid data objects for `fetch` and will produce a parse error.
> - When specifying absolute timestamps, they **must be quoted strings**: `from:"2026-02-23T02:00:00Z"`. Unquoted ISO timestamps will produce a parse error.
> - Relative time expressions do not need quotes: `from: now()-14d`.

Query metrics for all EasyTrade services using the namespace filter:

```dql
timeseries from:"<ISO-timestamp>", to:"<ISO-timestamp>", by:{dt.entity.service}, interval:1m,
  avg_response_time = avg(dt.service.request.response_time),
  filter: k8s.namespace.name == "easytrade"
| lookup [fetch dt.entity.service | fields id, entity.name], sourceField:dt.entity.service, lookupField:id, prefix:"svc."
| fieldsRename service = svc.entity.name
| fieldsRemove svc.id
```

For a relative time window and a single service:

```dql
timeseries avg(<metric-key>),
from: now()-14d, to: now(),
filter: { dt.entity.service == "<service-id>" }
```

Additionally, you should add a filter like this: `| filter dt.entity.service == "<service-id>"` to focus on a specific service.

#### Service-Level Metrics

- _Service Response Time_: `dt.service.request.response_time`
- _Service Request Count_: `dt.service.request.count`
- _Service Failure Count_: `dt.service.request.failure_count`

#### Container-Level Metrics

- _Container CPU Usage_: `dt.kubernetes.container.cpu_usage`
- _Container Memory Working Set_: `dt.kubernetes.container.memory_working_set`
- _Container CPU Requests_: `dt.kubernetes.container.requests_cpu`
- _Container Memory Requests_: `dt.kubernetes.container.requests_memory`
- _Container CPU Limits_: `dt.kubernetes.container.limits_cpu`
- _Container Memory Limits_: `dt.kubernetes.container.limits_memory`

#### Kubernetes Infrastructure Metrics

- _Pod Conditions_: `dt.kubernetes.workload.conditions`
- _Pod Status_: `dt.kubernetes.pods`
- _Container State_: `dt.kubernetes.containers`

#### Technology-Specific Metrics

- _JVM Memory Usage_: `dt.runtime.jvm.memory.heap.used`, `dt.runtime.jvm.memory.heap.max`
- _Goroutine count_: `dt.runtime.go.scheduler.goroutine_count`
- _Go Worker thread count_: `dt.runtime.go.scheduler.worker_thread_count`
- _Go Heap Memory_: `dt.runtime.go.memory.heap`
- _Go Memory Committed_: `dt.runtime.go.memory.committed`

You can find additional metrics via `fetch metric.series | filter dt.entity.service == "<service-id>" | limit 50` or for containers: `fetch metric.series | filter k8s.namespace.name == "easytrade" | filter metric.key == "dt.kubernetes.container.cpu_usage" or metric.key == "dt.kubernetes.container.memory_working_set" | limit 50`.

### Logs

You can find logs via the `fetch logs` tool and applying the following filter:

```dql
fetch logs
| filter k8s.namespace.name == "easytrade"
| sort timestamp desc
```

Filter error logs with

```dql
| filter loglevel == "ERROR"
```

You can furthermore narrow down logs for a specific service by adding a filter like this: `| filter contains(k8s.deployment.name, "<service-name>")`.

### Problem Investigation Workflow

Every problem investigation **must** include:

1. **A supporting metric chart** — always execute a `timeseries` DQL query that covers the problem's time window (use `event.start` and `event.end` from the problem record, plus a 30-minute buffer on each side). At minimum, plot `avg(dt.service.request.response_time)` or `sum(dt.service.request.failure_count)` for the affected service(s).

2. **A written summary** directly after the chart, following this format:

   > **Analysis — \<short incident title\> (\<time range\> UTC)**
   >
   > **Problem detected:** \<problem-id\> — \<event.description\>, confirmed by Dynatrace's investigation. Duration: \<duration in human-readable form\> (\<event.start time\> UTC), \<affected_users_count\> users affected.
   >
   > _Then explain: what the chart shows, when the onset was, what the peak looked like, when recovery occurred, and which service(s) were most impacted._
