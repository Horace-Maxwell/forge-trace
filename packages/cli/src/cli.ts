#!/usr/bin/env node
import { randomUUID } from "node:crypto";
import { appendEvent, fetchPullRequest, generateSummary, runTracedCommand, writeSessionSummary } from "@forge-trace/core";

function readFlag(args: string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  if (index === -1) {
    return undefined;
  }
  return args[index + 1];
}

async function runCommand(args: string[]): Promise<number> {
  const sessionId = readFlag(args, "--session") ?? randomUUID();
  const separator = args.indexOf("--");
  const commandArgs = separator === -1 ? [] : args.slice(separator + 1);
  const result = await runTracedCommand(sessionId, commandArgs);
  console.log(result.summaryPath);
  return result.exitCode;
}

async function runImport(args: string[]): Promise<number> {
  const repo = readFlag(args, "--repo");
  const pr = Number(readFlag(args, "--pr"));
  const token = process.env.GITHUB_TOKEN;
  if (!repo || !pr || !token) {
    console.error("Usage: GITHUB_TOKEN=... forge-trace import-gh --repo <owner/name> --pr <number>");
    return 1;
  }

  const sessionId = `gh-pr-${pr}-${randomUUID().slice(0, 8)}`;
  const pullRequest = await fetchPullRequest(repo, pr, token);
  await appendEvent(sessionId, {
    name: "session_started",
    at: new Date().toISOString(),
    sessionId,
    payload: { source: "github-import", repo, pr },
  });
  for (const review of pullRequest.reviews) {
    await appendEvent(sessionId, {
      name: "review_comment",
      at: new Date().toISOString(),
      sessionId,
      payload: { body: review, repo, pr, source: "github-import" },
    });
  }
  for (const comment of pullRequest.comments) {
    await appendEvent(sessionId, {
      name: "review_comment",
      at: new Date().toISOString(),
      sessionId,
      payload: { body: comment, repo, pr, source: "github-import" },
    });
  }
  await appendEvent(sessionId, {
    name: "session_finished",
    at: new Date().toISOString(),
    sessionId,
    payload: { imported: true, repo, pr, source: "github-import" },
  });
  await writeSessionSummary(sessionId, {
    sessionId,
    repo,
    pr,
    title: pullRequest.title,
  });
  console.log(await generateSummary(sessionId));
  return 0;
}

async function runSummarize(args: string[]): Promise<number> {
  const sessionId = readFlag(args, "--session");
  if (!sessionId) {
    console.error("Usage: forge-trace summarize --session <id>");
    return 1;
  }
  console.log(await generateSummary(sessionId));
  return 0;
}

async function main(): Promise<void> {
  const [command, ...args] = process.argv.slice(2);
  const exitCode =
    command === "run"
      ? await runCommand(args)
      : command === "import-gh"
        ? await runImport(args)
        : command === "summarize"
          ? await runSummarize(args)
          : 1;
  if (exitCode === 1 && !command) {
    console.error("Usage: forge-trace <run|import-gh|summarize>");
  }
  process.exitCode = exitCode;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
