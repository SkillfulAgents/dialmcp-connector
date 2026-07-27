<p align="center">
  <img src="https://raw.githubusercontent.com/SkillfulAgents/dialmcp-connector/main/assets/wordmark.png" alt="DialMCP" width="360">
</p>

<h1 align="center">DialMCP Connector</h1>

<p align="center">
  <strong>Give your AI agent a phone.</strong><br>
  Open-source connector for <a href="https://dialmcp.com">DialMCP</a> — the hosted MCP server that lets AI agents place real phone calls from your own verified number.
</p>

<p align="center">
  <a href="https://github.com/SkillfulAgents/dialmcp-connector/actions/workflows/ci.yml"><img src="https://github.com/SkillfulAgents/dialmcp-connector/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License"></a>
  <a href="https://modelcontextprotocol.io"><img src="https://img.shields.io/badge/MCP-Streamable%20HTTP-black.svg" alt="MCP"></a>
</p>

---

## What this is

**DialMCP** is a remote MCP server at `https://mcp.dialmcp.com/mcp`. Any client that speaks
[Streamable HTTP](https://modelcontextprotocol.io/specification/basic/transports) with OAuth can connect to
it directly — no install, no API keys. **You do not need this package for those clients.**

This repository exists for two reasons:

1. **A stdio bridge for clients that only support local servers.** Some MCP clients still can't talk to
   remote servers. `dialmcp-connector` launches a local stdio server that proxies to the hosted endpoint and
   handles the OAuth browser flow for you.
2. **The open, canonical documentation of the DialMCP integration** — tool schemas, client configs, the
   `server.json` registry manifest, and the safety model — in one auditable place.

The hosted calling service itself is closed-source. This connector is MIT-licensed and contains no
proprietary logic: it is a thin transport shim over a public endpoint.

## Quick start

### Direct connection (preferred)

If your client supports remote MCP servers, skip this package entirely:

```
URL:        https://mcp.dialmcp.com/mcp
Transport:  Streamable HTTP
Auth:       OAuth 2.1 (sign in with your phone number)
```

<details>
<summary><strong>Claude Code</strong></summary>

```bash
claude mcp add --transport http dialmcp https://mcp.dialmcp.com/mcp
# add --scope user to enable it in every project
```
</details>

<details>
<summary><strong>Codex</strong> — <code>~/.codex/config.toml</code></summary>

```toml
[mcp_servers.dialmcp]
url = "https://mcp.dialmcp.com/mcp"
```
</details>

<details>
<summary><strong>claude.ai / Claude Desktop</strong></summary>

Settings → Connectors → Add custom connector → paste `https://mcp.dialmcp.com/mcp`.
</details>

<details>
<summary><strong>Gamut</strong></summary>

Settings → Connectors → Add MCP server → paste the URL (HTTP / OAuth) → complete SMS verification.
</details>

On first connect a browser window opens for sign-in. Verify your phone number with an SMS code — that
number becomes your caller ID.

### Via this connector (stdio-only clients)

```bash
npx dialmcp-connector
```

Or in an MCP client config:

```json
{
  "mcpServers": {
    "dialmcp": {
      "command": "npx",
      "args": ["-y", "dialmcp-connector"]
    }
  }
}
```

See [`examples/`](examples/) for ready-to-paste configs.

## Tools

| Tool | Description |
|---|---|
| `place_call` | Start an outbound phone call to a US or Canadian number with a stated objective. Returns immediately with a call ID — the call runs asynchronously. |
| `get_call` | Fetch the current state of a call: status, live progress, and once finished the transcript, recording link, and structured resolution. Poll this after `place_call`. |
| `end_call` | Hang up an in-progress call immediately. |
| `list_calls` | List recent calls for the authenticated user with their statuses and outcomes. |

The API is **async by design**: `place_call` returns instantly with a call ID and your agent polls
`get_call`, so a multi-minute call never trips a client's tool timeout.

When a call completes, `get_call` returns a structured resolution — `achieved`, `partially_achieved`, or
`not_achieved` — with a summary, any commitments the other party made, suggested follow-ups, a
turn-by-turn transcript, and a signed link to the audio recording.

During the call the service presses keys through automated phone trees, waits silently through hold music,
and detects voicemail — hanging up rather than leaving a message.

## Safety model

Every protection is enforced **server-side**, not as model instructions the agent could talk itself out of.

- **Disclosure.** Every call opens by stating it's an AI assistant, who it's calling for, and that the line
  is recorded — before the ask. Compliance is independently verified against each transcript and logged. The
  agent never denies being an AI, and ends the call if the callee objects.
- **Your real number.** Calls present your own SMS-verified caller ID. Nothing is spoofed, and recipients
  can call you back.
- **Rate limits.** 1 concurrent call · 3/hour · 10/day · max 2/day to the same destination · 6-minute
  default and 10-minute hard cap, watchdog-enforced. Bulk calling is impossible by construction.
- **Time and place.** 8:00–21:00 destination local time (TCPA-aligned), US and Canada only. Unknown time
  zones are treated conservatively.
- **Non-bypassable blocklist.** Emergency services (911), premium-rate lines (900/976), and high-fraud
  ranges can never be dialed.
- **Permanent opt-outs.** Do-not-call requests are confirmed on the call, caught by a second independent
  transcript review, stored permanently, and enforced platform-wide across every user. Public self-serve
  opt-out at <https://mcp.dialmcp.com/opt-out> — no account needed.
- **Objective screening.** An independent reviewer screens each call's stated objective for harassment,
  deception, or fraud before dialing. The agent states only facts supplied in the task.
- **Prohibited uses.** Telemarketing, cold outreach, robocalling, surveys, lead generation, debt
  collection, and political outreach are barred by the [Terms](https://dialmcp.com/terms).

Full detail: <https://dialmcp.com/safety.html>

## Requirements

- Node.js 18 or newer (only if you use the stdio bridge)
- A US or Canadian mobile number for SMS verification
- Users must be 18 or older

## Links

- Website — <https://dialmcp.com>
- Safety and anti-spam — <https://dialmcp.com/safety.html>
- Privacy — <https://dialmcp.com/privacy>
- Terms — <https://dialmcp.com/terms>
- Do-not-call opt-out — <https://mcp.dialmcp.com/opt-out>
- Support — <support@dialmcp.com>

## Releasing

Every release publishes to two places: **npm** (`dialmcp-connector`) and the
[official MCP Registry](https://registry.modelcontextprotocol.io) (`com.dialmcp/dialmcp`). Both are
automated by [`.github/workflows/release.yml`](.github/workflows/release.yml).

### Cutting a release

1. Bump `version` in **both** `package.json` and `server.json` — `npm run validate:manifest` fails if they
   disagree, and CI runs it on every push.
2. Merge to `main`.
3. Run the Release workflow manually (**Actions → Release → Run workflow**, `dry_run` left checked) and let
   it go green. This packs the tarball and validates `server.json` against the live registry schema without
   publishing anything.
4. Publish a GitHub Release tagged `vX.Y.Z`. The tag must match `package.json` or the workflow stops before
   publishing.

Step 3 is worth the two minutes: **registry versions are immutable and cannot be unpublished.** A bad
version can only be superseded by a higher one or marked deprecated.

### What the workflow does

| Job | Runs on | Steps |
|---|---|---|
| `publish` | releases **and** manual dry runs | typecheck → validate manifest → build → smoke test → tag/version match → `npm publish --provenance` → `mcp-publisher validate` |
| `registry` | releases only | wait for npm propagation → `mcp-publisher login dns` → `mcp-publisher publish` |

`--provenance` attaches a signed attestation linking the tarball back to the commit and workflow run that
built it, which is why the job needs `id-token: write`.

The registry publish is a **separate job** for two reasons. It has to wait for npm: the registry proves
ownership by fetching the freshly published version and reading its `mcpName` field, which 404s until npm
propagates (the job retries for ~2.5 minutes). And it holds the signing key, which is scoped to the whole
`com.dialmcp` namespace rather than this one package — so it lives in a protected environment. Keeping that
environment off the `publish` job is deliberate: its branch policy only admits `v*` tags, and applying it
job-wide would block manual dry runs from `main` outright.

### One-time setup

| What | Where | Why |
|---|---|---|
| `NPM_TOKEN` | repository secret | automation token with publish rights on `dialmcp-connector` |
| `MCP_REGISTRY_PRIVATE_KEY` | secret on the `release` environment | Ed25519 key, base64; authenticates the registry publish |
| `release` environment | deployment branch policy → tags → `v*` | keeps the namespace key off untagged runs |
| `v=MCPv1; k=ed25519; p=<public key>` | TXT record on the **apex** of `dialmcp.com` | how the registry verifies domain ownership |

The TXT record goes on the bare domain, SPF-style — a `_mcp.` selector is not read and fails with an opaque
signature error. Signatures carry a ±15s timestamp window, so the runner's clock must be accurate.

## Contributing

Issues and pull requests are welcome for the connector, docs, and client configs. Bugs in the hosted
service itself are best sent to <support@dialmcp.com>. Please read [SECURITY.md](SECURITY.md) before
reporting anything security-related.

## License

MIT © Datawizz Inc. See [LICENSE](LICENSE).
