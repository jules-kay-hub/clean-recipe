# Plugin Settings Skill

**Skill Name:** `plugin-dev:plugin-settings`
**Invoke:** Use when creating configurable plugins

## Description

Documents the .claude/plugin-name.local.md pattern for storing plugin-specific configuration with YAML frontmatter and markdown content.

## When to Use

- Making plugin behavior configurable
- Storing plugin state/settings
- Creating per-project plugin settings
- Reading YAML frontmatter configuration
- Using .local.md files

## Settings File Pattern

Store plugin settings in:
```
.claude/<plugin-name>.local.md
```

## File Structure

```markdown
---
setting1: value1
setting2: value2
nested:
  option1: true
  option2: "string"
---

# Plugin Notes

Additional markdown content for the plugin...
```

## Reading Settings

In your plugin components, read settings:

```markdown
Read the settings from .claude/my-plugin.local.md

Parse the YAML frontmatter to get:
- setting1
- setting2
- nested options
```

## Example Settings File

`.claude/formatter.local.md`:
```markdown
---
enabled: true
format_on_save: true
languages:
  - javascript
  - typescript
  - python
indent_size: 2
line_length: 80
---

# Formatter Plugin Settings

These settings control the auto-formatter behavior.

## Custom Rules
- Always use single quotes for JS/TS
- Sort imports alphabetically
```

## Best Practices

1. **Defaults** - Always provide sensible defaults
2. **Validation** - Validate settings before use
3. **Documentation** - Document all settings in the markdown body
4. **Migration** - Handle missing/outdated settings gracefully
5. **Gitignore** - Consider if .local.md should be gitignored

## Per-Project vs Global

| Scope | Location |
|-------|----------|
| Per-project | `.claude/<plugin>.local.md` |
| Global | `~/.claude/<plugin>.local.md` |

Check project first, fall back to global.
