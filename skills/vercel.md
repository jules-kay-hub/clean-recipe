# Vercel Integration Skills

**Plugin:** `vercel`

## Available Skills

### deploy
**Invoke:** `/deploy` or `/vercel:deploy`

Deploy the current project to Vercel.

**Trigger Phrases:**
- "deploy"
- "deploy to Vercel"
- "push to production"
- "deploy my app"
- "go live"

**Example:**
```
/deploy
```

### logs
**Invoke:** `/logs` or `/vercel:logs`

View deployment logs from Vercel.

**Trigger Phrases:**
- "show logs"
- "check logs"
- "vercel logs"
- "what went wrong with the deployment"

**Example:**
```
/logs
```

### setup
**Invoke:** `/setup` or `/vercel:setup`

Set up Vercel CLI and configure the project.

**Trigger Phrases:**
- "set up Vercel"
- "configure Vercel"
- "link to Vercel"
- "vercel init"

**Example:**
```
/vercel:setup
```

## Prerequisites

- Vercel account
- Vercel CLI installed (`npm i -g vercel`)
- Project linked to Vercel

## Deployment Workflow

### First-Time Setup
```
/vercel:setup
```

This will:
1. Check Vercel CLI installation
2. Authenticate if needed
3. Link project to Vercel
4. Configure build settings

### Deploy
```
/deploy
```

This will:
1. Build the project
2. Deploy to Vercel
3. Return deployment URL

### Check Status
```
/logs
```

This will:
1. Fetch recent deployment logs
2. Show build output
3. Display any errors

## Configuration Options

Vercel projects can be configured via `vercel.json`:

```json
{
  "builds": [
    { "src": "package.json", "use": "@vercel/next" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/$1" }
  ]
}
```

## Best Practices

1. **Preview Deployments** - Use preview deployments for PRs
2. **Environment Variables** - Set secrets in Vercel dashboard
3. **Build Caching** - Enable caching for faster builds
4. **Domain Setup** - Configure custom domains in Vercel
