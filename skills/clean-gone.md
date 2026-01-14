# Clean Gone Branches Skill

**Skill Name:** `commit-commands:clean_gone`
**Invoke:** `/clean_gone`

## Description

Cleans up all git branches marked as [gone] - branches that have been deleted on the remote but still exist locally. Also removes associated worktrees.

## When to Use

- After PRs have been merged and remote branches deleted
- To clean up stale local branches
- When your local repo has many outdated branches
- Regular repository maintenance

## Capabilities

- Identifies branches marked as [gone]
- Removes local branches safely
- Cleans up associated worktrees
- Provides summary of cleaned branches

## Example Usage

```
/clean_gone
```

## What Gets Cleaned

- Local branches whose upstream has been deleted
- Worktrees associated with deleted branches
- Tracking references to non-existent remotes

## Safety

- Only removes branches marked as [gone]
- Does not affect branches with active upstreams
- Warns before removing branches with uncommitted work
- Never removes main/master branches
