# Atlassian Integration Skills

**Plugin:** `atlassian`

## Available Skills

### capture-tasks-from-meeting-notes
**Invoke:** `/capture-tasks-from-meeting-notes`

Analyze meeting notes to find action items and create Jira tasks for assigned work.

**Use When:**
- Creating Jira tasks from meeting notes
- Extracting action items from notes or Confluence pages
- Parsing meeting notes for assigned tasks
- Analyzing notes to generate tasks for team members

### generate-status-report
**Invoke:** `/generate-status-report`

Generate project status reports from Jira issues and publish to Confluence.

**Use When:**
- Creating status reports for a project
- Summarizing project progress
- Generating weekly/daily reports from Jira
- Publishing status summaries to Confluence
- Analyzing project blockers and completion

### search-company-knowledge
**Invoke:** `/search-company-knowledge`

Search across company knowledge bases (Confluence, Jira, internal docs).

**Use When:**
- Finding information about systems or processes
- Searching internal documentation
- Explaining internal concepts or architecture
- Looking up technical details
- Synthesizing information from multiple sources

### spec-to-backlog
**Invoke:** `/spec-to-backlog`

Convert Confluence specification documents into structured Jira backlogs.

**Use When:**
- Creating Jira tickets from a Confluence page
- Generating a backlog from a specification
- Breaking down specs into implementation tasks
- Converting requirements into Jira issues

### triage-issue
**Invoke:** `/triage-issue`

Intelligently triage bug reports by searching for duplicates in Jira.

**Use When:**
- Triaging bug reports or error messages
- Checking if an issue is a duplicate
- Finding similar past issues
- Creating new bug tickets with proper context
- Adding information to existing tickets

## Example Usage

```
/capture-tasks-from-meeting-notes Parse the standup notes and create tickets
```

```
/generate-status-report Create weekly status report for Project Alpha
```

```
/search-company-knowledge How does our authentication system work?
```

```
/spec-to-backlog Convert the API v2 spec to implementation tickets
```

```
/triage-issue Investigate: "Connection timeout error in payment service"
```

## Prerequisites

- Atlassian MCP server configured
- Jira and Confluence access tokens
- Appropriate project permissions
