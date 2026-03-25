# Forge Trace v1

## Why this exists

Forge Trace exists because coding agents create a lot of activity, but not much useful auditability.

Most agent telemetry is model-first. Forge Trace is workflow-first: commands, diffs, tests, and review context in one shareable trace.

## What you can do today

- Wrap a command and capture a coding-agent trace
- Record commands, git changes, and test runs in one session
- Import GitHub PR context into a session summary
- Share a trace page instead of scattered logs and screenshots

## Best fit

Forge Trace is a good fit if you work with:

- coding agents in GitHub Actions
- local CLI-driven agent runs
- teams that need a clearer audit trail than generic LLM traces provide

## Install paths

- GitHub Action: `uses: Horace-Maxwell/forge-trace@v1`
- CLI: `npx forge-trace@latest run --session demo -- npm test`
- Cloudflare-hosted collector: deploy the worker and open `/setup`

## What is intentionally not in v1

- Not a heavy observability dashboard
- Not a generic prompt playground
- Not a full eval platform

## Quick links

- Repo: https://github.com/Horace-Maxwell/forge-trace
- README: https://github.com/Horace-Maxwell/forge-trace#readme
- Action example: https://github.com/Horace-Maxwell/forge-trace/tree/main/examples/.github/workflows
- Cloudflare deploy: https://deploy.workers.cloudflare.com/?url=https://github.com/Horace-Maxwell/forge-trace
