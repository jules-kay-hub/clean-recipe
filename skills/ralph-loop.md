# Ralph Loop Skills

**Plugin:** `ralph-loop`

## Available Skills

### ralph-loop
**Invoke:** `/ralph-loop`

Start Ralph Loop in current session.

### cancel-ralph
**Invoke:** `/cancel-ralph`

Cancel active Ralph Loop.

### help
**Invoke:** `/ralph-loop:help`

Explain Ralph Loop plugin and available commands.

## What is Ralph Loop?

Ralph Loop is an automation plugin that enables continuous, iterative workflows within Claude Code sessions. It allows Claude to work through tasks in a loop, making progress iteratively until completion or cancellation.

## Use Cases

- **Long-Running Tasks** - Tasks that require multiple iterations
- **Continuous Improvement** - Iteratively refining code or content
- **Automated Workflows** - Running through predefined steps repeatedly
- **Background Processing** - Tasks that can run while you work on other things

## Starting a Loop

```
/ralph-loop
```

This initiates a loop session where Claude will:
1. Analyze the current state
2. Determine next actions
3. Execute actions
4. Evaluate progress
5. Continue or complete

## Canceling a Loop

```
/cancel-ralph
```

This safely stops the current Ralph Loop, allowing you to:
- Review progress made
- Make manual adjustments
- Restart with different parameters

## Example Workflows

### Code Refactoring Loop
```
/ralph-loop Refactor all components to use the new design pattern
```

### Test Fixing Loop
```
/ralph-loop Fix all failing tests one by one
```

### Documentation Loop
```
/ralph-loop Add documentation to all exported functions
```

## Loop Behavior

### Progress Tracking
Ralph Loop tracks progress and can report:
- Tasks completed
- Tasks remaining
- Current status
- Blockers encountered

### Stopping Conditions
The loop automatically stops when:
- All tasks are complete
- A blocker is encountered
- User cancels
- Maximum iterations reached

## Best Practices

1. **Clear Goals** - Provide clear task objectives
2. **Reasonable Scope** - Don't loop over extremely large tasks
3. **Monitor Progress** - Check in periodically
4. **Use Cancel** - Don't hesitate to cancel and adjust
5. **Review Output** - Review work after loop completes
