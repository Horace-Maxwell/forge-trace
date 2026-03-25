# Contributing to Forge Trace

Thanks for contributing.

Forge Trace is built to make coding-agent runs inspectable and shareable. The best contributions make traces easier to understand, easier to install, and more useful for real engineering workflows.

## Good contributions

- Improve trace clarity and summaries
- Improve command, git, or test event capture
- Improve install flow for the action or worker collector
- Improve examples that help teams understand the product quickly

## Before you open a pull request

1. Open an issue or discussion if the change is large or changes product direction.
2. Keep the change narrow and tied to better developer understanding.
3. Update docs or examples if the output or setup changes.

## Local checks

```bash
npm install
npm run build
npm test
```

## Pull request expectations

- Explain which workflow or trace pain point this improves.
- Include sample summary output or screenshots if trace UX changes.
- Prefer focused PRs over broad refactors.
