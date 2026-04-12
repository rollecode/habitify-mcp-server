# Habitify MCP Server

A Model Context Protocol (MCP) server for the [Habitify](https://habitify.me/) habit tracking API. Lets AI assistants like Claude read habits, check completion status, view logs, and mark habits as done.

## Tools

| Tool | Description |
|------|-------------|
| `habitify_list_habits` | List all habits with status |
| `habitify_get_status` | Get today's completion status |
| `habitify_get_logs` | Get log entries for a habit |
| `habitify_complete_habit` | Mark a habit as done |

## Setup

Get your API key from [Habitify settings](https://app.habitify.me/) or the Habitify app under Settings > API.

```bash
bun install
# or
npm install
```

## Add to Claude Code

```bash
claude mcp add habitify --transport stdio --scope user \
  -e HABITIFY_API_KEY=your-api-key-here \
  -- bun /path/to/habitify-mcp-server/server.ts
```

Or in `.mcp.json`:

```json
{
  "mcpServers": {
    "habitify": {
      "command": "bun",
      "args": ["/path/to/habitify-mcp-server/server.ts"],
      "env": {
        "HABITIFY_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

## Auth

Set `HABITIFY_API_KEY` environment variable with your Habitify API key.

## License

MIT
