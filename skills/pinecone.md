# Pinecone Integration Skills

**Plugin:** `pinecone`

## Available Skills

### help
**Invoke:** `/pinecone:help`

Explain how to use the Pinecone plugin with Claude Code.

**Covers:**
- Setting API keys
- Learning existing functionality
- Quickstart guide

### query
**Invoke:** `/pinecone:query`

Query a user's index with Pinecone MCP.

**Parameters:**
- Index name (required)
- Input query (required)
- Top-k value (optional)

**Example:**
```
/pinecone:query index:my-index "What is machine learning?"
```

### quickstart
**Invoke:** `/pinecone:quickstart`

Download AGENTS.md files for Pinecone and kickstart a quickstart using Python.

**Example:**
```
/pinecone:quickstart
```

## What is Pinecone?

Pinecone is a vector database designed for machine learning applications. It enables:

- **Semantic Search** - Find similar items by meaning, not keywords
- **Recommendation Systems** - Suggest related content
- **RAG (Retrieval-Augmented Generation)** - Enhance LLM responses with relevant context
- **Anomaly Detection** - Find outliers in data

## Core Concepts

### Vectors
Numerical representations of data (text, images, etc.) that capture semantic meaning.

### Index
A collection of vectors organized for fast similarity search.

### Namespaces
Logical partitions within an index for organizing data.

### Metadata
Key-value pairs attached to vectors for filtering.

## Basic Operations

### Upsert (Insert/Update)
```python
index.upsert(vectors=[
    {"id": "vec1", "values": [0.1, 0.2, ...], "metadata": {"key": "value"}}
])
```

### Query
```python
results = index.query(
    vector=[0.1, 0.2, ...],
    top_k=10,
    include_metadata=True
)
```

### Delete
```python
index.delete(ids=["vec1", "vec2"])
```

## Prerequisites

- Pinecone account and API key
- Pinecone MCP server configured
- Index created in Pinecone console

## Configuration

```json
{
  "mcpServers": {
    "pinecone": {
      "type": "stdio",
      "command": "npx",
      "args": ["@pinecone-database/mcp-server"],
      "env": {
        "PINECONE_API_KEY": "${PINECONE_API_KEY}"
      }
    }
  }
}
```

## Use Cases

### Semantic Search
```
/pinecone:query index:docs "How do I reset my password?"
```

### Finding Similar Items
```
/pinecone:query index:products "comfortable running shoes"
```

### RAG Context Retrieval
```
Query Pinecone for relevant context before answering questions
```

## Best Practices

1. **Embedding Model** - Use consistent embedding model for all data
2. **Dimensionality** - Match index dimensions to your embeddings
3. **Metadata** - Add useful metadata for filtering
4. **Namespaces** - Organize data logically
5. **Batch Operations** - Use batching for large operations
