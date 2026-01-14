# Plugin Structure Skill

**Skill Name:** `plugin-dev:plugin-structure`
**Invoke:** Use when asking about plugin architecture

## Description

Guidance on plugin directory layout, manifest configuration, component organization, file naming conventions, and Claude Code plugin architecture best practices.

## When to Use

- Understanding plugin file structure
- Organizing plugin components
- Setting up plugin.json manifest
- Learning plugin conventions
- Configuring auto-discovery

## Plugin Directory Structure

```
my-plugin/
├── plugin.json           # Plugin manifest (required)
├── commands/             # Slash commands
│   └── my-command.md
├── skills/               # Skills for Claude
│   └── my-skill.md
├── agents/               # Subagents
│   └── my-agent.md
├── hooks/                # Event hooks
│   └── my-hook.md
├── .mcp.json            # MCP server config
└── AGENTS.md            # Agent instructions
```

## plugin.json Structure

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "Plugin description",
  "commands": ["commands/*.md"],
  "skills": ["skills/*.md"],
  "agents": ["agents/*.md"],
  "hooks": ["hooks/*.md"]
}
```

## Key Concepts

### ${CLAUDE_PLUGIN_ROOT}
Variable that resolves to the plugin's root directory. Use this in paths.

### Auto-Discovery
Plugin components are discovered based on plugin.json glob patterns.

### Component Files
All components use markdown files with YAML frontmatter for configuration.
