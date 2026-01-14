# Hook Development Skill

**Skill Name:** `plugin-dev:hook-development`
**Invoke:** Use when creating hooks

## Description

Comprehensive guidance for creating and implementing Claude Code plugin hooks, with focus on the advanced prompt-based hooks API.

## When to Use

- Creating PreToolUse/PostToolUse hooks
- Implementing Stop/SessionStart hooks
- Validating tool usage
- Setting up event-driven automation
- Blocking dangerous commands

## Hook Events

| Event | When Triggered |
|-------|----------------|
| `PreToolUse` | Before a tool is called |
| `PostToolUse` | After a tool completes |
| `Stop` | When Claude stops |
| `SubagentStop` | When subagent stops |
| `SessionStart` | Session begins |
| `SessionEnd` | Session ends |
| `UserPromptSubmit` | User sends message |
| `PreCompact` | Before context compaction |
| `Notification` | System notification |

## Hook File Structure

```markdown
---
name: my-hook
event: PreToolUse
tools:
  - Bash
match_tools:
  - Bash
  - Write
---

# Hook Instructions

Analyze the tool call and determine if it should proceed...
```

## Frontmatter Fields

| Field | Description | Required |
|-------|-------------|----------|
| `name` | Hook identifier | Yes |
| `event` | Event type | Yes |
| `tools` | Tools hook can use | No |
| `match_tools` | Tools to intercept | For tool hooks |

## Hook Responses

Hooks can return:

- **Allow** - Let the action proceed
- **Block** - Prevent the action
- **Modify** - Change the action

## Example: Prevent Dangerous Commands

```markdown
---
name: block-dangerous
event: PreToolUse
match_tools:
  - Bash
---

# Dangerous Command Blocker

Check if the Bash command is dangerous:

## Block These Patterns
- `rm -rf /`
- `DROP TABLE`
- `--force` without confirmation
- Commands affecting production

## Response
If dangerous, respond with:
BLOCK: <reason>

If safe, respond with:
ALLOW
```

## Example: Auto-Format on Save

```markdown
---
name: auto-format
event: PostToolUse
match_tools:
  - Write
  - Edit
---

# Auto Format Hook

After a file is written/edited, run the formatter if available.

1. Check file extension
2. Find appropriate formatter
3. Run formatter on the file
4. Report any formatting changes
```
