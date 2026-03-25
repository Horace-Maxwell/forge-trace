# Forge Trace

A black box recorder for coding agents: commands, diffs, tests, and review context in one trace.

`Forge Trace` records how a coding agent moved from command to diff to tests. It is intentionally git-aware, test-aware, and review-aware, so teams can share a coding-agent session like a black box recording.

[Self-host with GitHub Action](#github-action) | [Deploy to Cloudflare](https://deploy.workers.cloudflare.com/?url=https://github.com/Horace-Maxwell/forge-trace) | [Collector Setup After Deploy](#cloudflare-deploy)

## Install In 5 Minutes

### GitHub Action

```yaml
name: forge-trace

on:
  workflow_dispatch:

jobs:
  traced-run:
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - uses: actions/checkout@v4
      - uses: Horace-Maxwell/forge-trace@v1
        with:
          command: npm test
```

### Cloudflare Deploy

```bash
npm install
npm run build
npx wrangler dev
# then open /setup on your deployed worker URL
```

### CLI

```bash
npx forge-trace@latest run --session demo -- npm test
```

## Why Star It

- It gives coding agents a shareable trace permalink instead of scattered logs.
- It is purpose-built for git, tests, and code review rather than generic LLM telemetry.
- It can spread as both a GitHub Action and a lightweight hosted collector.

## Entrypoints

- `packages/core`: trace events, session summaries, collector helpers
- `packages/cli`: npm CLI for `npx forge-trace@latest`
- `packages/action`: JavaScript action that wraps a command and uploads summary outputs
- `apps/worker`: Cloudflare Worker collector and share viewer
