# Create Plugin Skill

**Skill Name:** `plugin-dev:create-plugin`
**Invoke:** `/create-plugin`

## Description

Guided end-to-end plugin creation workflow with component design, implementation, and validation. This skill walks you through creating a complete Claude Code plugin.

## When to Use

- Creating a new Claude Code plugin from scratch
- When you want guided plugin development
- Building plugins with multiple components
- Learning plugin architecture

## Capabilities

- Scaffolds plugin structure
- Guides component design decisions
- Creates plugin.json manifest
- Sets up commands, skills, agents, hooks
- Validates plugin configuration
- Tests plugin functionality

## Example Usage

```
/create-plugin
```

```
/create-plugin Create a code formatting plugin
```

## Plugin Components

### Commands
Slash commands users can invoke directly.

### Skills
Specialized capabilities Claude can use.

### Agents
Autonomous subagents for complex tasks.

### Hooks
Event-driven automation triggers.

## Workflow

1. Define plugin purpose and scope
2. Design component architecture
3. Create plugin.json manifest
4. Implement each component
5. Configure MCP servers if needed
6. Validate and test plugin
