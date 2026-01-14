# Commit, Push, and PR Skill

**Skill Name:** `commit-commands:commit-push-pr`
**Invoke:** `/commit-push-pr`

## Description

Commit changes, push to remote, and open a pull request in one streamlined workflow. This skill handles the entire process from local changes to PR creation.

## When to Use

- When you're ready to submit your changes for review
- After completing a feature branch
- When you want to streamline the PR workflow
- For quick iterations on feature branches

## Capabilities

- Creates a descriptive commit
- Pushes to remote branch
- Creates a pull request with summary
- Generates PR description with test plan
- Links related issues if applicable

## Example Usage

```
/commit-push-pr
```

```
/commit-push-pr Fix authentication bug #123
```

## PR Format

The skill creates PRs with:

```markdown
## Summary
- Bullet points describing changes

## Test plan
- [ ] Testing checklist items

Generated with Claude Code
```

## Workflow

1. Analyzes current changes
2. Creates commit with descriptive message
3. Pushes to remote (creates branch if needed)
4. Opens PR using GitHub CLI
5. Returns PR URL
