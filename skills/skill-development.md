# Skill Development Skill

**Skill Name:** `plugin-dev:skill-development`
**Invoke:** Use when creating skills

## Description

Guidance on skill structure, progressive disclosure, and skill development best practices for Claude Code plugins.

## When to Use

- Creating a new skill for a plugin
- Improving skill descriptions
- Organizing skill content
- Learning skill best practices

## Skill vs Command

| Skill | Command |
|-------|---------|
| Claude decides when to use | User explicitly invokes |
| Triggered by context | Triggered by /command |
| Has usage triggers | Has arguments |
| Background capability | Direct action |

## Skill File Structure

```markdown
---
name: my-skill
description: Brief description for skill list
usage_triggers:
  - "when user says X"
  - "when user wants to Y"
---

# Detailed Instructions

Full instructions for Claude when using this skill...
```

## Frontmatter Fields

| Field | Description | Required |
|-------|-------------|----------|
| `name` | Skill identifier | Yes |
| `description` | Brief description | Yes |
| `usage_triggers` | When to use | Yes |

## Usage Triggers

Write triggers that describe when Claude should use this skill:

```yaml
usage_triggers:
  - "when user mentions 'deploy'"
  - "when user asks to publish to production"
  - "when user says 'go live'"
```

## Progressive Disclosure

Structure skill content from simple to complex:

1. **Overview** - What the skill does
2. **Basic Usage** - Simple examples
3. **Advanced Options** - Complex scenarios
4. **Edge Cases** - Special handling

## Example Skill

```markdown
---
name: test-runner
description: Run tests and report results
usage_triggers:
  - "when user asks to run tests"
  - "when user says 'test this'"
  - "after implementing a feature"
---

# Test Runner Skill

Run the project's test suite and report results.

## Steps
1. Detect test framework
2. Run appropriate test command
3. Parse and summarize results
4. Report failures with context
```
