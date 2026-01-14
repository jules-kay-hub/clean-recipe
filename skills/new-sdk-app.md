# New SDK App Skill

**Skill Name:** `agent-sdk-dev:new-sdk-app`
**Invoke:** `/new-sdk-app`

## Description

Create and setup a new Claude Agent SDK application. This skill guides you through setting up a project using the Claude Agent SDK for building custom AI agents.

## When to Use

- Starting a new Claude Agent SDK project
- Creating custom AI agents
- Building agent-based applications
- Setting up agent development environment

## What is the Claude Agent SDK?

The Claude Agent SDK is Anthropic's toolkit for building custom AI agents that can:
- Execute multi-step tasks autonomously
- Use tools and APIs
- Maintain conversation context
- Handle complex workflows

## Getting Started

```
/new-sdk-app
```

This will:
1. Set up project structure
2. Install dependencies
3. Create configuration files
4. Generate starter code
5. Provide documentation links

## Project Structure

```
my-agent-app/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts          # Entry point
│   ├── agent.ts          # Agent definition
│   ├── tools/            # Custom tools
│   │   └── example.ts
│   └── config.ts         # Configuration
├── .env                  # Environment variables
└── README.md
```

## Key Concepts

### Agent
The main entity that processes tasks and makes decisions.

### Tools
Functions the agent can call to interact with external systems.

### Context
Information the agent maintains across interactions.

### Workflows
Sequences of actions the agent performs.

## Basic Agent Setup

```typescript
import { Agent } from '@anthropic-ai/agent-sdk';

const agent = new Agent({
  model: 'claude-opus-4-5-20251101',
  tools: [/* your tools */],
  systemPrompt: 'You are a helpful assistant...'
});

const result = await agent.run('Your task here');
```

## Creating Tools

```typescript
const myTool = {
  name: 'my_tool',
  description: 'What this tool does',
  parameters: {
    type: 'object',
    properties: {
      param1: { type: 'string', description: 'Parameter description' }
    },
    required: ['param1']
  },
  execute: async ({ param1 }) => {
    // Tool implementation
    return { result: 'success' };
  }
};
```

## Prerequisites

- Node.js 18+
- npm or yarn
- Anthropic API key

## Best Practices

1. **Clear System Prompts** - Define agent behavior clearly
2. **Focused Tools** - Create single-purpose tools
3. **Error Handling** - Handle tool failures gracefully
4. **Logging** - Log agent actions for debugging
5. **Testing** - Test agents with various inputs
6. **Rate Limits** - Respect API rate limits
