import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { TraceEvent } from "./types.js";

export function sessionDir(sessionId: string): string {
  return resolve(".forge-trace", "sessions", sessionId);
}

export async function appendEvent(sessionId: string, event: TraceEvent): Promise<void> {
  const dir = sessionDir(sessionId);
  await mkdir(dir, { recursive: true });
  await writeFile(resolve(dir, "trace.jsonl"), `${JSON.stringify(event)}\n`, { flag: "a" });
}

export async function writeSessionSummary(sessionId: string, summary: Record<string, unknown>): Promise<void> {
  const dir = sessionDir(sessionId);
  await mkdir(dir, { recursive: true });
  await writeFile(resolve(dir, "session.json"), `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

export async function readTrace(sessionId: string): Promise<TraceEvent[]> {
  const path = resolve(sessionDir(sessionId), "trace.jsonl");
  const raw = await readFile(path, "utf8");
  return raw
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line) as TraceEvent);
}

export async function writeSummaryMarkdown(sessionId: string, markdown: string): Promise<string> {
  const path = resolve(sessionDir(sessionId), "summary.md");
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, markdown, "utf8");
  return path;
}
