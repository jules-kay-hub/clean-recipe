# MCP Integration Skill

**Skill Name:** `plugin-dev:mcp-integration`
**Invoke:** Use when integrating MCP servers

## Description

Comprehensive guidance for integrating Model Context Protocol (MCP) servers into Claude Code plugins for external tool and service integration.

## When to Use

- Adding MCP server to a plugin
- Configuring MCP in plugin
- Using .mcp.json files
- Setting up external service connections
- Working with MCP server types

## What is MCP?

Model Context Protocol (MCP) allows Claude to connect to external services and tools through standardized servers.

## MCP Server Types

| Type | Description | Use Case |
|------|-------------|----------|
| `stdio` | Standard I/O | Local scripts |
| `sse` | Server-Sent Events | Remote services |
| `http` | HTTP endpoints | REST APIs |
| `websocket` | WebSocket | Real-time services |

## Configuration File

Create `.mcp.json` in your plugin root:

```json
{
  "mcpServers": {
    "my-server": {
      "type": "stdio",
      "command": "node",
      "args": ["${CLAUDE_PLUGIN_ROOT}/server.js"],
      "env": {
        "API_KEY": "${API_KEY}"
      }
    }
  }
}
```

## Configuration Fields

| Field | Description |
|-------|-------------|
| `type` | Server type (stdio, sse, http, websocket) |
| `command` | Command to run (for stdio) |
| `args` | Command arguments |
| `env` | Environment variables |
| `url` | Server URL (for sse, http, websocket) |

## Using ${CLAUDE_PLUGIN_ROOT}

Reference files relative to your plugin:

```json
{
  "command": "${CLAUDE_PLUGIN_ROOT}/bin/server",
  "args": ["--config", "${CLAUDE_PLUGIN_ROOT}/config.json"]
}
```

## Example: GitHub MCP Server

```json
{
  "mcpServers": {
    "github": {
      "type": "stdio",
      "command": "npx",
      "args": ["@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

## Example: Custom API Server

```json
{
  "mcpServers": {
    "my-api": {
      "type": "sse",
      "url": "https://api.example.com/mcp",
      "headers": {
        "Authorization": "Bearer ${API_TOKEN}"
      }
    }
  }
}
```

## Best Practices

1. Use environment variables for secrets
2. Use ${CLAUDE_PLUGIN_ROOT} for relative paths
3. Document required environment variables
4. Handle server startup failures gracefully
5. Test MCP connections before releasing
