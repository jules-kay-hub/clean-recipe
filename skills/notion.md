# Notion Integration Skills

**Plugin:** `Notion`

## Available Skills

### notion-create-database-row
**Invoke:** `/notion-create-database-row`

Insert a new row into a specified Notion database using natural-language property values.

### notion-create-page
**Invoke:** `/notion-create-page`

Create a new Notion page, optionally under a specific parent.

### notion-create-task
**Invoke:** `/notion-create-task`

Create a new task in the user's Notion tasks database with sensible defaults.

### notion-database-query
**Invoke:** `/notion-database-query`

Query a Notion database by name or ID and return structured, readable results.

### notion-find
**Invoke:** `/notion-find`

Quickly find pages or databases in Notion by title keywords.

### notion-search
**Invoke:** `/notion-search`

Search the user's Notion workspace using the Notion MCP server.

## Prerequisites

- Notion MCP server configured
- Notion integration token with appropriate permissions
- Workspace access granted to integration

## Common Use Cases

### Creating Content
```
/notion-create-page Create a meeting notes page for today's standup
```

### Finding Information
```
/notion-search Find pages about project requirements
```

### Managing Tasks
```
/notion-create-task Add task: Review PR #123 for authentication changes
```

### Querying Data
```
/notion-database-query Show all high-priority items from the Tasks database
```

## Configuration

Requires MCP server configuration:

```json
{
  "mcpServers": {
    "notion": {
      "type": "stdio",
      "command": "npx",
      "args": ["@notionhq/mcp-server"],
      "env": {
        "NOTION_API_KEY": "${NOTION_API_KEY}"
      }
    }
  }
}
```

## Best Practices

1. Use specific database names when querying
2. Provide clear titles for new pages
3. Include relevant properties when creating rows
4. Use search for broad queries, find for specific titles
