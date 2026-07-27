import { readFileSync } from "node:fs";

const manifest = JSON.parse(readFileSync("server.json", "utf8"));
const pkg = JSON.parse(readFileSync("package.json", "utf8"));

const problems = [];

for (const field of ["name", "description", "version", "repository", "remotes"]) {
  if (!manifest[field]) problems.push(`server.json is missing required field: ${field}`);
}

// The MCP registry caps descriptions at 100 characters and rejects longer ones at publish time.
if (manifest.description && manifest.description.length > 100) {
  problems.push(`server.json description is ${manifest.description.length} chars, max is 100`);
}

if (manifest.version !== pkg.version) {
  problems.push(`version mismatch: server.json ${manifest.version} vs package.json ${pkg.version}`);
}

// The registry validates npm package ownership by matching this field against the manifest name.
if (pkg.mcpName !== manifest.name) {
  problems.push(`package.json mcpName ${pkg.mcpName} does not match server.json name ${manifest.name}`);
}

const npmPackage = manifest.packages?.find((p) => p.registryType === "npm");
if (npmPackage) {
  if (npmPackage.identifier !== pkg.name) {
    problems.push(`server.json npm identifier ${npmPackage.identifier} does not match package.json name ${pkg.name}`);
  }
  if (npmPackage.version !== pkg.version) {
    problems.push(`server.json npm package version ${npmPackage.version} does not match package.json version ${pkg.version}`);
  }
}

if (problems.length > 0) {
  for (const problem of problems) console.error(`✗ ${problem}`);
  process.exit(1);
}

console.log(`✓ server.json OK — ${manifest.name} ${manifest.version}`);
