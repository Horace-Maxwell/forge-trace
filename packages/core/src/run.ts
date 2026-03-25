import { spawn } from "node:child_process";
import { appendEvent, sessionDir, writeSessionSummary } from "./trace.js";
import { generateSummary } from "./summarize.js";
import { listTouchedFiles, summarizeDiff } from "./git.js";

export async function runTracedCommand(sessionId: string, commandArgs: string[]): Promise<{ exitCode: number; summaryPath: string }> {
  const [command, ...args] = commandArgs;
  if (!command) {
    throw new Error("Missing command to run under trace.");
  }

  await appendEvent(sessionId, {
    name: "session_started",
    at: new Date().toISOString(),
    sessionId,
    payload: {
      cwd: process.cwd(),
      source: "cli",
    },
  });
  await appendEvent(sessionId, {
    name: "command_started",
    at: new Date().toISOString(),
    sessionId,
    payload: { command, args, source: "cli" },
  });

  const exitCode = await new Promise<number>((resolvePromise, rejectPromise) => {
    const child = spawn(command, args, {
      cwd: process.cwd(),
      stdio: "inherit",
      shell: false,
      env: process.env,
    });
    child.on("error", rejectPromise);
    child.on("exit", (code) => resolvePromise(code ?? 1));
  });

  await appendEvent(sessionId, {
    name: "command_finished",
    at: new Date().toISOString(),
    sessionId,
    payload: { command, args, exitCode, source: "cli" },
  });

  const touchedFiles = await listTouchedFiles();
  for (const path of touchedFiles) {
    await appendEvent(sessionId, {
      name: "file_touched",
      at: new Date().toISOString(),
      sessionId,
      payload: { path, source: "git" },
    });
  }

  const diff = await summarizeDiff();
  if (diff.files.length > 0 || diff.stats) {
    await appendEvent(sessionId, {
      name: "git_diff",
      at: new Date().toISOString(),
      sessionId,
      payload: { ...diff, source: "git" },
    });
  }

  const invoked = `${command} ${args.join(" ")}`.trim();
  if (/\b(test|vitest|jest|playwright|pytest|cargo test|go test)\b/i.test(invoked)) {
    await appendEvent(sessionId, {
      name: "test_run",
      at: new Date().toISOString(),
      sessionId,
      payload: { command: invoked, exitCode, source: "cli" },
    });
  }

  await appendEvent(sessionId, {
    name: "session_finished",
    at: new Date().toISOString(),
    sessionId,
    payload: { exitCode, source: "cli" },
  });

  await writeSessionSummary(sessionId, {
    sessionId,
    exitCode,
    sessionPath: sessionDir(sessionId),
    touchedFiles,
    diff,
  });
  const summary = await generateSummary(sessionId);
  return { exitCode, summaryPath: `${sessionDir(sessionId)}/summary.md` };
}
