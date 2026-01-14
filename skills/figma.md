# Figma Integration Skills

**Plugin:** `figma`

## Available Skills

### implement-design
**Invoke:** `/implement-design`

Translates Figma designs into production-ready code with 1:1 visual fidelity.

**Use When:**
- Implementing UI from Figma files
- User mentions "implement design" or "generate code"
- User provides Figma URLs
- Building components matching Figma specs
- Converting designs to React/Vue/etc. components

**Example:**
```
/implement-design https://figma.com/file/abc123/MyDesign
```

### code-connect-components
**Invoke:** `/code-connect-components`

Connects Figma design components to code components using Code Connect.

**Use When:**
- User says "code connect" or "connect this component to code"
- Mapping Figma components to code implementations
- Creating design-to-code connections
- Establishing component mappings

**Example:**
```
/code-connect-components Map the Button component to our design system
```

### create-design-system-rules
**Invoke:** `/create-design-system-rules`

Generates custom design system rules for the user's codebase.

**Use When:**
- Setting up design system rules
- Creating project-specific conventions
- Establishing Figma-to-code workflows
- Customizing design guidelines

**Example:**
```
/create-design-system-rules Set up rules for our React component library
```

## Prerequisites

- Figma MCP server connection
- Figma access token
- Design file access permissions

## Workflow

### Design Implementation
1. Provide Figma URL or file reference
2. Claude analyzes the design
3. Generates component code
4. Applies design system rules
5. Creates production-ready output

### Code Connect
1. Identify Figma component
2. Find corresponding code component
3. Create mapping configuration
4. Sync design updates

## Best Practices

1. **Share Figma URLs** - Always provide the specific Figma URL
2. **Component Selection** - Select specific components in Figma before implementing
3. **Design Tokens** - Define tokens before implementing complex designs
4. **Incremental Implementation** - Implement one component at a time
5. **Review Output** - Always review generated code for accuracy
