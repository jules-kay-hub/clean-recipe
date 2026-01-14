# Agent Development Skill

**Skill Name:** `plugin-dev:agent-development`
**Invoke:** Use when creating subagents

## Description

Guidance on agent structure, system prompts, triggering conditions, and agent development best practices for Claude Code plugins.

## When to Use

- Creating autonomous agents
- Writing subagent system prompts
- Defining agent triggering conditions
- Setting agent tool access
- Configuring agent colors/display

## Agent File Structure

```markdown
---
name: my-agent
description: What this agent does
when_to_use: When Claude should spawn this agent
tools:
  - Bash
  - Read
  - Write
color: blue
---

# Agent System Prompt

You are an agent that...

## Your Capabilities
- Capability 1
- Capability 2

## Guidelines
- Guideline 1
- Guideline 2
```

## Frontmatter Fields

| Field | Description | Required |
|-------|-------------|----------|
| `name` | Agent identifier | Yes |
| `description` | Brief description | Yes |
| `when_to_use` | Triggering conditions | Yes |
| `tools` | Available tools | Yes |
| `color` | Display color | No |

## Available Tools

- `Bash` - Command execution
- `Read` - File reading
- `Write` - File creation
- `Edit` - File editing
- `Glob` - File pattern matching
- `Grep` - Content searching
- `WebFetch` - URL fetching
- `WebSearch` - Web searching
- `*` - All tools

## Agent Colors

- `blue` - Default
- `green` - Success/positive
- `yellow` - Warning/caution
- `red` - Error/critical
- `purple` - Special/unique
- `cyan` - Info/neutral

## Example Agent

```markdown
---
name: test-fixer
description: Automatically fixes failing tests
when_to_use: When tests are failing and need automated fixes
tools:
  - Bash
  - Read
  - Edit
  - Grep
color: yellow
---

# Test Fixer Agent

You are an agent specialized in analyzing and fixing failing tests.

## Your Task
1. Analyze the test failure output
2. Identify the root cause
3. Fix the test or the code
4. Verify the fix works

## Guidelines
- Prefer fixing bugs over changing tests
- Maintain test intent
- Don't skip or disable tests
```
