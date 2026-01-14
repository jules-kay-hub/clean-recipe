# Hookify Skills

**Plugin:** `hookify`

## Available Skills

### configure
**Invoke:** `/hookify:configure`

Enable or disable hookify rules interactively.

### help
**Invoke:** `/hookify:help`

Get help with the hookify plugin.

### hookify
**Invoke:** `/hookify`

Create hooks to prevent unwanted behaviors from conversation analysis or explicit instructions.

### list
**Invoke:** `/hookify:list`

List all configured hookify rules.

### writing-rules
**Invoke:** Use when creating hookify rules

Guidance on hookify rule syntax and patterns.

## What is Hookify?

Hookify is a plugin that allows you to create behavioral hooks - rules that prevent certain unwanted actions or enforce certain patterns during your Claude Code sessions.

## Use Cases

- **Prevent Dangerous Commands** - Block `rm -rf`, force pushes, etc.
- **Enforce Code Standards** - Require tests, linting, etc.
- **Block Sensitive Operations** - Prevent accessing production data
- **Custom Guardrails** - Create project-specific rules

## Creating Rules

### Interactive Creation
```
/hookify Block all commands that delete files without confirmation
```

### From Conversation Analysis
```
/hookify Analyze our conversation and create rules to prevent the issues we discussed
```

## Rule Structure

Rules consist of:
- **Trigger** - What activates the rule
- **Condition** - When the rule applies
- **Action** - What happens (block, warn, modify)

## Example Rules

### Block Force Push
```yaml
name: no-force-push
trigger: bash command
condition: contains "push --force" or "push -f"
action: block
message: "Force push is not allowed. Use --force-with-lease instead."
```

### Require Tests
```yaml
name: require-tests
trigger: before commit
condition: no test files modified
action: warn
message: "Consider adding tests for your changes."
```

### Block Production Access
```yaml
name: no-prod-access
trigger: bash command
condition: contains "production" or "prod-db"
action: block
message: "Production access is restricted."
```

## Managing Rules

### List All Rules
```
/hookify:list
```

### Enable/Disable Rules
```
/hookify:configure
```

### View Help
```
/hookify:help
```

## Best Practices

1. **Start Permissive** - Begin with warnings, not blocks
2. **Clear Messages** - Provide helpful error messages
3. **Document Rules** - Explain why rules exist
4. **Review Regularly** - Update rules as needs change
5. **Team Alignment** - Ensure team agrees on rules
