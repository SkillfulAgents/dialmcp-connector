# Security Policy

## Reporting a vulnerability

Please report security issues privately to **security@dialmcp.com** — do not open a public GitHub issue.

Include: what you found, how to reproduce it, and the impact you believe it has. We acknowledge reports
within 3 business days and aim to ship a fix or a mitigation plan within 30 days.

Please do not test against real third parties. Never place calls to numbers you do not control, and never
attempt to bypass the calling-hours, rate-limit, or do-not-call enforcement against live recipients — those
protections exist to keep people who did not consent to this experiment out of it.

## Scope

| In scope | Out of scope |
|---|---|
| This connector package (`dialmcp-connector`) | Denial-of-service and volumetric testing |
| The hosted MCP endpoint `https://mcp.dialmcp.com/mcp` | Social engineering of DialMCP staff or users |
| The OAuth 2.1 sign-in and SMS verification flow | Findings from automated scanners with no demonstrated impact |
| Authorization bypass between accounts | Missing headers with no exploitable consequence |
| Bypass of calling-hours, rate-limit, disclosure, or do-not-call enforcement | Third-party telephony carriers |

## Handling of credentials

This connector never stores or transmits a password. Authentication is OAuth 2.1 against
`mcp.dialmcp.com`; tokens are held by your MCP client's credential store. If you believe a token has been
exposed, revoke it from your DialMCP account and contact support@dialmcp.com.

## Privacy

Calls produce transcripts and recordings tied to your account. See <https://dialmcp.com/privacy>. Call
content is not used for advertising and is not used to train AI models.
