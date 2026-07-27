# Client configs

Two ways to connect. **Prefer the remote endpoint** — it needs no install and no Node.js.

| | Remote (preferred) | Stdio bridge |
|---|---|---|
| When | Client supports remote MCP over OAuth | Client only supports local `command` servers |
| Config | URL `https://mcp.dialmcp.com/mcp` | `npx -y dialmcp-connector` |
| Needs Node.js | No | Yes (18+) |

## Remote

**Claude Code**
```bash
claude mcp add --transport http dialmcp https://mcp.dialmcp.com/mcp
```

**Codex** — `~/.codex/config.toml` → [`codex-config.toml`](codex-config.toml)

**Cursor** — `.cursor/mcp.json` → [`cursor-remote.json`](cursor-remote.json)

**claude.ai / Claude Desktop** — Settings → Connectors → Add custom connector → paste the URL.

**Gamut** — Settings → Connectors → Add MCP server → paste the URL (HTTP / OAuth).

**VS Code** — `.vscode/mcp.json` → [`vscode-mcp.json`](vscode-mcp.json)

## Stdio bridge

Any client taking a `command` → [`stdio-bridge.json`](stdio-bridge.json)

On first run a browser window opens for OAuth sign-in. Verify your phone number with an SMS code — that
number becomes your caller ID. Credentials are cached by `mcp-remote` under `~/.mcp-auth`.
