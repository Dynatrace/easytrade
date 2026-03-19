---
inclusion: always
---

# Dynatrace Observability for EasyTrade Project

This steering file provides EasyTrade-specific guidance for querying Dynatrace using either:
1. **Dynatrace Power** - MCP-based power with comprehensive tools
2. **Local Dynatrace MCP Server** - Direct MCP server integration (pre-configured in this repository)

Both provide similar capabilities with slightly different tool names and interfaces.

## EasyTrade Application Overview

EasyTrade is a microservices-based stock trading application consisting of 19 services deployed on Kubernetes or Docker Compose. The application demonstrates distributed tracing, business events, and problem patterns for Dynatrace observability.

## Service Naming Conventions

### Kubernetes Deployments

When deployed on Kubernetes, EasyTrade services follow these naming patterns:

**Service Names:**
- accountservice
- aggregator-service
- broker-service
- calculationservice
- contentcreator
- credit-card-order-service
- db
- engine
- feature-flag-service
- frontend
- frontendreverseproxy
- loadgen
- loginservice
- manager
- offerservice
- pricing-service
- problem-operator
- rabbitmq
- third-party-service

**Default Namespace:** `easytrade`

**Kubernetes Labels:**
- `app.kubernetes.io/name`: Service name (e.g., "accountservice", "broker-service")
- `app.kubernetes.io/instance`: Release name (typically "easytrade" or custom helm release name)
- `app.kubernetes.io/part-of`: "easytrade"
- `app.kubernetes.io/version`: Application version (e.g., "1.1.1")
- `app.kubernetes.io/managed-by`: "Helm" (for helm deployments)
- `app`: Service name (legacy label, e.g., "accountservice")

**Dynatrace Environment Variables:**
- `DT_RELEASE_PRODUCT`: Set to "easytrade" (from `app.kubernetes.io/part-of` label)
- `DT_RELEASE_VERSION`: Set to version (from `app.kubernetes.io/version` label)

### Docker Compose Deployments

When deployed via Docker Compose, services use simple container names matching the service names above (e.g., "accountservice", "broker-service").

## Available Tool Sets

### Option 1: Dynatrace Power Tools

When using the Dynatrace Power, use these tool patterns:
- `usePower("dynatrace", "dynatrace", "find_entity_by_name", {...})`
- `usePower("dynatrace", "dynatrace", "execute_dql", {...})`
- `usePower("dynatrace", "dynatrace", "generate_dql_from_natural_language", {...})`

### Option 2: Local Dynatrace MCP Tools

When using the local MCP server (pre-configured in this repo), use these tools directly:
- `mcp_dynatrace_local_find_entity_by_name`
- `mcp_dynatrace_local_execute_dql`
- `mcp_dynatrace_local_generate_dql_from_natural_language`
- `mcp_dynatrace_local_list_problems`
- `mcp_dynatrace_local_list_vulnerabilities`
- `mcp_dynatrace_local_get_kubernetes_events`
- `mcp_dynatrace_local_chat_with_davis_copilot`
- `mcp_dynatrace_local_verify_dql`
- `mcp_dynatrace_local_explain_dql_in_natural_language`
- `mcp_dynatrace_local_send_slack_message`
- `mcp_dynatrace_local_send_email`
- `mcp_dynatrace_local_create_dynatrace_notebook`
- `mcp_dynatrace_local_list_exceptions`
- `mcp_dynatrace_local_list_davis_analyzers`
- `mcp_dynatrace_local_execute_davis_analyzer`

**Note:** Both tool sets provide equivalent functionality. Use whichever is available in your environment.

### Tool Selection Strategy

**Prefer Local MCP when:**
- You need to create Dynatrace notebooks for documentation
- You want to use Davis Analyzers for forecasting/anomaly detection
- You need to send Slack/email notifications
- You want to verify DQL syntax before execution
- You're working within the EasyTrade repository (already configured)

**Use Dynatrace Power when:**
- Working across multiple projects
- Need centralized power management
- Prefer the power abstraction layer

## Finding EasyTrade Entities in Dynatrace

### Step 1: Find Services by Name

**Using Dynatrace Power:**
```javascript
usePower("dynatrace", "dynatrace", "find_entity_by_name", {
  "name": "broker-service",
  "type": "SERVICE"
})
```

**Using Local MCP:**
```javascript
mcp_dynatrace_local_find_entity_by_name({
  "entityNames": ["broker-service"],
  "maxEntitiesToDisplay": 10
})
```

### Step 2: Query by Kubernetes Metadata

Use DQL to filter by Kubernetes labels and namespace:

```dql
// Find all EasyTrade services
fetch dt.entity.service
| filter k8s.namespace.name == "easytrade"
| fields entity.name, k8s.deployment.name, k8s.namespace.name

// Find services by part-of label
fetch dt.entity.service
| filter k8s.label.app_kubernetes_io_part_of == "easytrade"
| fields entity.name, k8s.deployment.name

// Find specific service by deployment name
fetch dt.entity.service
| filter k8s.deployment.name == "broker-service" 
  and k8s.namespace.name == "easytrade"
```

## Common EasyTrade Queries

### Service Performance

```dql
// Response time for broker-service
timeseries avg(dt.service.request.response_time),
  percentile(dt.service.request.response_time, 95),
  from: now() - 6h,
  filter: k8s.deployment.name == "broker-service" 
    and k8s.namespace.name == "easytrade"

// Error rate across all EasyTrade services
fetch logs
| filter k8s.namespace.name == "easytrade"
  and loglevel == "ERROR"
  and timestamp > now() - 1h
| summarize errorCount = count(), by:{k8s.deployment.name}
| sort errorCount desc
```

### Business Events

EasyTrade generates business events for trading activities:

```dql
// Fetch business events
fetch bizevents
| filter event.provider == "easytrade"
  and timestamp > now() - 1h
| fields timestamp, event.type, event.name

// Trade execution events
fetch bizevents
| filter event.type == "com.easytrade.trade-executed"
  and timestamp > now() - 6h
| summarize tradeCount = count(), totalValue = sum(trade.value), 
    by:{user.id}
| sort totalValue desc
```

### Problem Patterns

EasyTrade includes 4 problem patterns that can be enabled via feature flags:

1. **DbNotResponding**: Database errors preventing new trades
2. **ErgoAggregatorSlowdown**: Aggregator service slowdown
3. **FactoryCrisis**: Credit card production failure
4. **HighCpuUsage**: CPU throttling on broker-service

```dql
// Check for active problems in EasyTrade
fetch dt.davis.problems
| filter k8s.namespace.name == "easytrade"
  and status == "ACTIVE"
| fields display_id, title, affected_entity_names, start_time

// Monitor feature flag service for problem pattern changes
fetch logs
| filter k8s.deployment.name == "feature-flag-service"
  and k8s.namespace.name == "easytrade"
  and timestamp > now() - 1h
| filter contains(content, "enabled")
```

### Database Monitoring

```dql
// Database connection issues
fetch logs
| filter k8s.deployment.name == "db"
  and k8s.namespace.name == "easytrade"
  and loglevel == "ERROR"
  and timestamp > now() - 1h
| summarize cnt = count(), by:{content}
| sort cnt desc

// Services with database connection errors
fetch logs
| filter k8s.namespace.name == "easytrade"
  and (contains(content, "MSSQL") or contains(content, "database"))
  and loglevel == "ERROR"
  and timestamp > now() - 1h
| summarize cnt = count(), by:{k8s.deployment.name, content}
```

### RabbitMQ Monitoring

```dql
// RabbitMQ message processing
fetch logs
| filter k8s.deployment.name == "rabbitmq"
  and k8s.namespace.name == "easytrade"
  and timestamp > now() - 1h

// Services consuming from RabbitMQ (calculationservice, pricing-service)
fetch logs
| filter k8s.deployment.name in ("calculationservice", "pricing-service")
  and k8s.namespace.name == "easytrade"
  and contains(content, "RABBITMQ")
  and timestamp > now() - 1h
```

### Frontend & User Experience

```dql
// Frontend errors
fetch logs
| filter k8s.deployment.name == "frontend"
  and k8s.namespace.name == "easytrade"
  and loglevel == "ERROR"
  and timestamp > now() - 1h

// Real User Monitoring (RUM) data
fetch dt.rum.actions
| filter dt.rum.application.name == "easytrade"
  and timestamp > now() - 6h
| summarize avgDuration = avg(duration), 
    p95Duration = percentile(duration, 95),
    by:{name}
```

### Load Generator Monitoring

```dql
// Load generator activity
fetch logs
| filter k8s.deployment.name == "loadgen"
  and k8s.namespace.name == "easytrade"
  and timestamp > now() - 1h
| summarize requestCount = count(), by:{bin(timestamp, 5m)}
```

## EasyTrade Investigation Workflows

### Workflow 1: Service Degradation Investigation

**Using Dynatrace Power:**
```javascript
// Step 1: Find the service entity
const service = usePower("dynatrace", "dynatrace", "find_entity_by_name", {
  "name": "broker-service",
  "type": "SERVICE"
})

// Step 2: Check for active problems
const problems = usePower("dynatrace", "dynatrace", "list_problems", {
  "filter": `k8s.namespace.name == "easytrade" and k8s.deployment.name == "broker-service"`
})

// Step 3: Query response time metrics
const dqlQuery = usePower("dynatrace", "dynatrace", "generate_dql_from_natural_language", {
  "question": "Show me response time for broker-service in easytrade namespace over the last 6 hours"
})

const metrics = usePower("dynatrace", "dynatrace", "execute_dql", {
  "dqlQuery": dqlQuery
})

// Step 4: Get error logs
const errorLogs = usePower("dynatrace", "dynatrace", "execute_dql", {
  "dqlQuery": `fetch logs
    | filter k8s.deployment.name == "broker-service"
      and k8s.namespace.name == "easytrade"
      and loglevel == "ERROR"
      and timestamp > now() - 1h
    | summarize cnt = count(), by:{content}
    | sort cnt desc | limit 20`
})

// Step 5: Ask Davis for insights
const insights = usePower("dynatrace", "dynatrace", "chat_with_davis_copilot", {
  "message": `The broker-service in EasyTrade has ${problems.length} problems. What's causing this?`
})
```

**Using Local MCP:**
```javascript
// Step 1: Find the service entity
const service = mcp_dynatrace_local_find_entity_by_name({
  "entityNames": ["broker-service"],
  "maxEntitiesToDisplay": 10
})

// Step 2: Check for active problems
const problems = mcp_dynatrace_local_list_problems({
  "additionalFilter": `k8s.namespace.name == "easytrade" and k8s.deployment.name == "broker-service"`,
  "status": "ACTIVE",
  "timeframe": "24h"
})

// Step 3: Generate and execute DQL for response time
const dqlQuery = mcp_dynatrace_local_generate_dql_from_natural_language({
  "text": "Show me response time for broker-service in easytrade namespace over the last 6 hours"
})

const metrics = mcp_dynatrace_local_execute_dql({
  "dqlStatement": dqlQuery,
  "recordLimit": 100
})

// Step 4: Get error logs
const errorLogs = mcp_dynatrace_local_execute_dql({
  "dqlStatement": `fetch logs
    | filter k8s.deployment.name == "broker-service"
      and k8s.namespace.name == "easytrade"
      and loglevel == "ERROR"
      and timestamp > now() - 1h
    | summarize cnt = count(), by:{content}
    | sort cnt desc | limit 20`,
  "recordLimit": 20
})

// Step 5: Ask Davis for insights
const insights = mcp_dynatrace_local_chat_with_davis_copilot({
  "text": `The broker-service in EasyTrade has problems. What's causing this?`,
  "context": JSON.stringify(problems)
})
```

### Workflow 2: Problem Pattern Analysis

**Using Dynatrace Power:**
```javascript
// Step 1: Check which problem patterns are enabled
const featureFlagLogs = usePower("dynatrace", "dynatrace", "execute_dql", {
  "dqlQuery": `fetch logs
    | filter k8s.deployment.name == "feature-flag-service"
      and k8s.namespace.name == "easytrade"
      and timestamp > now() - 24h
    | filter contains(content, "enabled") or contains(content, "disabled")
    | fields timestamp, content
    | sort timestamp desc | limit 50`
})

// Step 2: Check for related problems
const problems = usePower("dynatrace", "dynatrace", "list_problems", {
  "filter": `k8s.namespace.name == "easytrade"`,
  "from": "now-24h"
})

// Step 3: Correlate with Kubernetes events
const k8sEvents = usePower("dynatrace", "dynatrace", "get_kubernetes_events", {
  "namespace": "easytrade"
})

// Step 4: Get Davis analysis
const analysis = usePower("dynatrace", "dynatrace", "chat_with_davis_copilot", {
  "message": "Analyze the correlation between EasyTrade problem patterns and active problems"
})
```

**Using Local MCP:**
```javascript
// Step 1: Check which problem patterns are enabled
const featureFlagLogs = mcp_dynatrace_local_execute_dql({
  "dqlStatement": `fetch logs
    | filter k8s.deployment.name == "feature-flag-service"
      and k8s.namespace.name == "easytrade"
      and timestamp > now() - 24h
    | filter contains(content, "enabled") or contains(content, "disabled")
    | fields timestamp, content
    | sort timestamp desc | limit 50`,
  "recordLimit": 50
})

// Step 2: Check for related problems
const problems = mcp_dynatrace_local_list_problems({
  "additionalFilter": `k8s.namespace.name == "easytrade"`,
  "status": "ALL",
  "timeframe": "24h",
  "maxProblemsToDisplay": 20
})

// Step 3: Correlate with Kubernetes events
const k8sEvents = mcp_dynatrace_local_get_kubernetes_events({
  "timeframe": "24h",
  "maxEventsToDisplay": 50
})

// Step 4: Get Davis analysis
const analysis = mcp_dynatrace_local_chat_with_davis_copilot({
  "text": "Analyze the correlation between EasyTrade problem patterns and active problems",
  "context": JSON.stringify({ problems, k8sEvents })
})
```

### Workflow 3: Business Impact Analysis

**Using Dynatrace Power:**
```javascript
// Step 1: Query business events
const bizEvents = usePower("dynatrace", "dynatrace", "execute_dql", {
  "dqlQuery": `fetch bizevents
    | filter event.provider == "easytrade"
      and timestamp > now() - 6h
    | summarize eventCount = count(), by:{event.type, bin(timestamp, 30m)}
    | sort timestamp desc`
})

// Step 2: Check service health
const serviceHealth = usePower("dynatrace", "dynatrace", "execute_dql", {
  "dqlQuery": `fetch logs
    | filter k8s.namespace.name == "easytrade"
      and loglevel == "ERROR"
      and timestamp > now() - 6h
    | summarize errorCount = count(), by:{k8s.deployment.name, bin(timestamp, 30m)}`
})

// Step 3: Correlate business events with errors
const insights = usePower("dynatrace", "dynatrace", "chat_with_davis_copilot", {
  "message": "How do the error rates in EasyTrade services correlate with business event volumes?"
})
```

**Using Local MCP:**
```javascript
// Step 1: Query business events
const bizEvents = mcp_dynatrace_local_execute_dql({
  "dqlStatement": `fetch bizevents
    | filter event.provider == "easytrade"
      and timestamp > now() - 6h
    | summarize eventCount = count(), by:{event.type, bin(timestamp, 30m)}
    | sort timestamp desc`,
  "recordLimit": 100
})

// Step 2: Check service health
const serviceHealth = mcp_dynatrace_local_execute_dql({
  "dqlStatement": `fetch logs
    | filter k8s.namespace.name == "easytrade"
      and loglevel == "ERROR"
      and timestamp > now() - 6h
    | summarize errorCount = count(), by:{k8s.deployment.name, bin(timestamp, 30m)}`,
  "recordLimit": 100
})

// Step 3: Correlate business events with errors
const insights = mcp_dynatrace_local_chat_with_davis_copilot({
  "text": "How do the error rates in EasyTrade services correlate with business event volumes?",
  "context": JSON.stringify({ bizEvents, serviceHealth })
})
```

## Key Service Dependencies

Understanding service dependencies helps with root cause analysis:

- **frontendreverseproxy** → All backend services (entry point)
- **broker-service** → accountservice, pricing-service, engine, feature-flag-service
- **credit-card-order-service** → third-party-service, db
- **third-party-service** → credit-card-order-service
- **pricing-service** → db, rabbitmq
- **calculationservice** → rabbitmq
- **loginservice** → db
- **manager** → db
- **accountservice** → manager
- **offerservice** → loginservice, manager, feature-flag-service
- **engine** → broker-service
- **loadgen** → frontendreverseproxy (generates synthetic traffic)

## Quick Reference: DQL Filters for EasyTrade

```dql
// Filter by namespace
k8s.namespace.name == "easytrade"

// Filter by specific service
k8s.deployment.name == "broker-service"

// Filter by application label
k8s.label.app_kubernetes_io_part_of == "easytrade"

// Filter by version
k8s.label.app_kubernetes_io_version == "1.1.1"

// Filter by helm release
k8s.label.app_kubernetes_io_instance == "easytrade"

// Filter by legacy app label
k8s.label.app == "broker-service"
```

## Best Practices for EasyTrade Monitoring

1. **Always filter by namespace**: Use `k8s.namespace.name == "easytrade"` to isolate EasyTrade data
2. **Use deployment names**: More reliable than service names for Kubernetes deployments
3. **Monitor problem patterns**: Check feature-flag-service logs to understand enabled problem patterns
4. **Track business events**: Use `event.provider == "easytrade"` to filter business events
5. **Check dependencies**: When investigating issues, consider service dependencies
6. **Use Davis AI**: Ask Davis for insights before diving into complex queries
7. **Leverage RUM**: Frontend application is instrumented for Real User Monitoring
8. **Monitor database**: Many services depend on the SQL Server database - check connection issues
9. **Watch RabbitMQ**: Message queue issues affect calculationservice and pricing-service
10. **Correlate with K8s events**: Use `get_kubernetes_events` to see pod restarts, OOMKills, etc.

## Troubleshooting Common Issues

### Issue: Can't find EasyTrade services

**Solution using Dynatrace Power:**
```javascript
// Use find_entity_by_name with common service names
usePower("dynatrace", "dynatrace", "find_entity_by_name", {
  "name": "broker-service"
})

// Or query by namespace
usePower("dynatrace", "dynatrace", "execute_dql", {
  "dqlQuery": `fetch dt.entity.service
    | filter k8s.namespace.name == "easytrade"
    | fields entity.name, k8s.deployment.name`
})
```

**Solution using Local MCP:**
```javascript
// Use find_entity_by_name with common service names
mcp_dynatrace_local_find_entity_by_name({
  "entityNames": ["broker-service", "frontend", "loginservice"],
  "maxEntitiesToDisplay": 20
})

// Or query by namespace
mcp_dynatrace_local_execute_dql({
  "dqlStatement": `fetch dt.entity.service
    | filter k8s.namespace.name == "easytrade"
    | fields entity.name, k8s.deployment.name`,
  "recordLimit": 50
})
```

### Issue: No business events found

**Solution:**
- Verify Monaco configuration is deployed (see `monaco/` directory)
- Check if business event capture rules are configured
- Ensure application is generating traffic (loadgen should be running)

### Issue: Problem patterns not triggering problems

**Solution:**
- Verify problem pattern is enabled via feature-flag-service
- Check if pattern has been running long enough (typically 15-20 minutes)
- Review problem-operator logs for Kubernetes deployments

## Local MCP-Specific Features

The local Dynatrace MCP server (pre-configured in this repository) provides additional capabilities:

### Creating Dynatrace Notebooks

Document your analysis and share findings with your team:

```javascript
mcp_dynatrace_local_create_dynatrace_notebook({
  "name": "EasyTrade Performance Analysis - Jan 2026",
  "description": "Investigation of broker-service slowdown and error rates",
  "content": [
    {
      "type": "markdown",
      "text": "# EasyTrade Performance Investigation\n\nAnalyzing broker-service performance degradation in the easytrade namespace."
    },
    {
      "type": "dql",
      "text": `fetch logs
        | filter k8s.deployment.name == "broker-service"
          and k8s.namespace.name == "easytrade"
          and loglevel == "ERROR"
          and timestamp > now() - 6h
        | summarize cnt = count(), by:{content}
        | sort cnt desc`
    },
    {
      "type": "markdown",
      "text": "## Key Findings\n\n- Error rate increased by 40% at 14:30\n- Database connection timeouts detected\n- Correlated with DbNotResponding problem pattern activation"
    }
  ]
})
```

### Listing Exceptions

Track frontend and backend exceptions:

```javascript
// List recent exceptions in EasyTrade
mcp_dynatrace_local_list_exceptions({
  "timeframe": "24h",
  "maxExceptionsToDisplay": 20,
  "additionalFilter": `dt.rum.application.entity == "<APPLICATION-ENTITY-ID>"`
})
```

### Using Davis Analyzers

Leverage advanced analytics for forecasting and anomaly detection:

```javascript
// Step 1: List available analyzers
const analyzers = mcp_dynatrace_local_list_davis_analyzers()

// Step 2: Execute forecast analyzer for broker-service response time
const forecast = mcp_dynatrace_local_execute_davis_analyzer({
  "analyzerName": "dt.statistics.GenericForecastAnalyzer",
  "timeframeStart": "now-7d",
  "timeframeEnd": "now",
  "input": {
    "timeSeriesData": "timeseries avg(dt.service.request.response_time), filter: k8s.deployment.name == \"broker-service\" and k8s.namespace.name == \"easytrade\"",
    "forecastHorizon": 24
  }
})
```

### Sending Notifications

Alert your team about issues:

```javascript
// Send Slack notification
mcp_dynatrace_local_send_slack_message({
  "channel": "#easytrade-alerts",
  "message": "🚨 EasyTrade Alert: broker-service error rate increased by 40% in the last hour. Investigation ongoing."
})

// Send email notification
mcp_dynatrace_local_send_email({
  "toRecipients": ["team@example.com"],
  "subject": "EasyTrade: broker-service Performance Degradation",
  "body": "The broker-service in the easytrade namespace is experiencing elevated error rates. Please review the Dynatrace notebook for details."
})
```

### Verifying DQL Queries

Validate your DQL before execution:

```javascript
// Verify DQL syntax
mcp_dynatrace_local_verify_dql({
  "dqlStatement": `fetch logs
    | filter k8s.namespace.name == "easytrade"
      and loglevel == "ERROR"
      and timestamp > now() - 1h
    | summarize cnt = count(), by:{k8s.deployment.name}`
})
```

### Getting DQL Explanations

Understand complex DQL queries:

```javascript
mcp_dynatrace_local_explain_dql_in_natural_language({
  "dql": `fetch logs
    | filter k8s.namespace.name == "easytrade"
      and loglevel == "ERROR"
      and timestamp > now() - 1h
    | summarize cnt = count(), by:{k8s.deployment.name}
    | sort cnt desc`
})
```

## Additional Resources

- **Monaco Configuration**: See `monaco/` directory for Dynatrace configuration as code
- **Service READMEs**: Each service has detailed documentation in `src/<service-name>/README.md`
- **Architecture Diagram**: See `img/architecture.jpg` for service relationships
- **Database Schema**: See `img/database.jpg` for database structure
