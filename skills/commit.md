# Commit Skill

**Skill Name:** `commit-commands:commit`
**Invoke:** `/commit`

## Description

Create a git commit with a well-crafted commit message. This skill analyzes your staged and unstaged changes and creates an appropriate commit message following best practices.

## When to Use

- After completing a feature or fix
- When you want a descriptive commit message
- To ensure consistent commit message format
- When committing multiple related changes

## Capabilities

- Analyzes staged and unstaged changes
- Generates descriptive commit messages
- Follows conventional commit format
- Summarizes the "why" not just the "what"
- Checks for sensitive files before committing

## Example Usage

```
/commit
```

```
/commit -m "Add user authentication"
```

## Commit Message Format

The skill generates commits in this format:

```
<type>: <short description>

<longer description if needed>

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
```

## Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks
