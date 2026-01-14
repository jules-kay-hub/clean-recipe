# Command Development Skill

**Skill Name:** `plugin-dev:command-development`
**Invoke:** Use when creating slash commands

## Description

Guidance on slash command structure, YAML frontmatter fields, dynamic arguments, bash execution, user interaction patterns, and command development best practices.

## When to Use

- Creating slash commands for plugins
- Defining command arguments
- Using command frontmatter
- Organizing commands
- Creating interactive commands
- Using AskUserQuestion in commands

## Command File Structure

```markdown
---
name: my-command
description: What the command does
arguments:
  - name: arg1
    description: First argument
    required: true
  - name: arg2
    description: Optional argument
    required: false
    default: "default-value"
---

# Command Instructions

Your command instructions here...
```

## Frontmatter Fields

| Field | Description | Required |
|-------|-------------|----------|
| `name` | Command name (without /) | Yes |
| `description` | Brief description | Yes |
| `arguments` | List of arguments | No |
| `hidden` | Hide from help | No |

## Argument Properties

- `name` - Argument identifier
- `description` - Help text
- `required` - Is it mandatory?
- `default` - Default value
- `type` - string, number, boolean

## Example Command

```markdown
---
name: format
description: Format code files
arguments:
  - name: path
    description: File or directory to format
    required: false
    default: "."
---

Format the code at the specified path using the project's configured formatter.

1. Detect the project type
2. Find the appropriate formatter
3. Run the formatter on {{path}}
4. Report results
```

## Dynamic Arguments

Use `{{argument_name}}` to reference arguments in your command body.
