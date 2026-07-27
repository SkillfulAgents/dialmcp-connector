#!/usr/bin/env node
/**
 * Thin stdio bridge to the hosted DialMCP server.
 *
 * Clients that support remote MCP should connect to DIALMCP_URL directly and skip this package.
 * This exists only for stdio-only clients: it delegates transport and the OAuth 2.1 browser flow to
 * `mcp-remote`, with the DialMCP endpoint baked in.
 */
import { spawn } from "node:child_process";
import { createRequire } from "node:module";

export const DIALMCP_URL = process.env.DIALMCP_URL ?? "https://mcp.dialmcp.com/mcp";

const HELP = `dialmcp-connector — stdio bridge to the hosted DialMCP server

  Usage: dialmcp-connector [mcp-remote options]

  Most clients do not need this. If yours supports remote MCP servers, point it at
  ${DIALMCP_URL} (Streamable HTTP, OAuth) instead.

  Override the endpoint with the DIALMCP_URL environment variable.
  Docs: https://github.com/SkillfulAgents/dialmcp-connector
`;

export function resolveMcpRemoteBin(): string {
  const require = createRequire(import.meta.url);
  // Resolve through the package's own dependency tree so we never depend on a global install.
  return require.resolve("mcp-remote/dist/proxy.js");
}

export function main(argv: string[] = process.argv.slice(2)): void {
  if (argv.includes("--help") || argv.includes("-h")) {
    process.stdout.write(HELP);
    return;
  }

  const child = spawn(process.execPath, [resolveMcpRemoteBin(), DIALMCP_URL, ...argv], {
    stdio: "inherit",
  });

  for (const signal of ["SIGINT", "SIGTERM"] as const) {
    process.on(signal, () => child.kill(signal));
  }

  child.on("exit", (code, signal) => {
    process.exit(signal ? 1 : (code ?? 0));
  });
}

main();
