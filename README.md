# OPanel MCP

OPanel MCP Server for AI agents

## Description

`opanel-mcp` is a MCP server for OPanel. After connecting it to an AI agent, you can manage common Minecraft server tasks with simple prompts instead of manually clicking through the panel.

## Usage

### Prerequisites

- A running OPanel instance
- An enabled OPanel MCP token
- HTTPS access to your OPanel endpoint (required for non-local connections)
- Node.js 18+ and npm

### Getting Started

1. Follow the [Official Docs](https://opanel.cn/docs/quick-start.html) to deploy OPanel.

2. Set up HTTPS for your OPanel endpoint.

Configure HTTPS with a reverse proxy (for example Nginx/Caddy) or another TLS solution.

> [!IMPORTANT]
> This MCP server only allows:
> - `https://...` for remote hosts
> - `http://localhost` or `http://127.0.0.1` for local-only development
>
> If your server URL is remote and not HTTPS, connection will be rejected.

3. In OPanel, open the MCP page, generate a new access token, and enable MCP.

4. Install the MCP server.

Add the following config to your MCP client, and modify the arguments to match your setup:

```json
{
  "mcpServer": {
    "opanel": {
      "command": "npx",
      "args": [
        "opanel-mcp@latest",
        "--server", "...",
        "--token", "..."
      ]
    }
  }
}
```

**Arguments:**
- `--server`: Your OPanel URL, such as `https://example.com:3000`
- `--token`: Your MCP Access Token generated in the MCP page

## Development

You can run with MCP Inspector for local debugging:

```bash
npm run build
npm run dev
```

This command reads `SERVER` and `TOKEN` from `.env`.

## Security Notes

- Treat the MCP token as a secret.
- Do not commit tokens into Git.
- Rotate the token in OPanel if you suspect leakage.

## License

[MPL-2.0](./LICENSE)
