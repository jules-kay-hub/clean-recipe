# Sentry Integration Skills

**Plugin:** `sentry`

## Available Skills

### getIssues
**Invoke:** `/getIssues`

Fetch the most recent 10 issues from Sentry, optionally filtered by project name.

**Example:**
```
/getIssues
/getIssues project:my-app
```

### seer
**Invoke:** `/seer`

Ask natural language questions about your Sentry environment and get detailed insights.

**Example:**
```
/seer What are the most common errors this week?
/seer Which endpoints have the highest error rates?
```

### sentry-code-review
**Invoke:** `/sentry-code-review`

Analyze and resolve Sentry comments on GitHub Pull Requests.

**Use When:**
- Reviewing or fixing issues identified by Sentry in PR comments
- Automatically finding recent PRs with Sentry feedback

### sentry-setup-ai-monitoring
**Invoke:** `/sentry-setup-ai-monitoring`

Setup Sentry AI Agent Monitoring in any project.

**Use When:**
- Adding AI monitoring to track LLM calls
- Monitoring AI agents
- Instrumenting OpenAI/Anthropic/LangChain/etc.

### sentry-setup-logging
**Invoke:** `/sentry-setup-logging`

Setup Sentry Logging in any project.

**Supports:**
- JavaScript/TypeScript
- Python
- Ruby
- React/Next.js

### sentry-setup-metrics
**Invoke:** `/sentry-setup-metrics`

Setup Sentry Metrics in any project.

**Use When:**
- Adding custom metrics tracking
- Setting up counters/gauges/distributions
- Instrumenting application performance

### sentry-setup-tracing
**Invoke:** `/sentry-setup-tracing`

Setup Sentry Tracing (Performance Monitoring) in any project.

**Use When:**
- Adding performance monitoring
- Enabling tracing
- Tracking transactions and spans

## Prerequisites

- Sentry MCP server connection
- Sentry API token
- Organization/project access

## Common Workflows

### Debugging Production Issues
```
/getIssues
/seer What's causing the spike in errors today?
```

### Setting Up New Project
```
/sentry-setup-tracing
/sentry-setup-logging
/sentry-setup-metrics
```

### PR Review Integration
```
/sentry-code-review PR #123
```

## Configuration

```json
{
  "mcpServers": {
    "sentry": {
      "type": "stdio",
      "command": "npx",
      "args": ["@sentry/mcp-server"],
      "env": {
        "SENTRY_AUTH_TOKEN": "${SENTRY_AUTH_TOKEN}",
        "SENTRY_ORG": "${SENTRY_ORG}"
      }
    }
  }
}
```
