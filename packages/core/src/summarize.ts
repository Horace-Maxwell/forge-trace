import { readTrace, writeSummaryMarkdown } from "./trace.js";
import { SessionSummary, TraceEvent } from "./types.js";

function summarizeEvents(sessionId: string, events: TraceEvent[]): SessionSummary {
  const startedAt = events.find((event) => event.name === "session_started")?.at ?? new Date().toISOString();
  const finishedAt = [...events].reverse().find((event) => event.name === "session_finished")?.at;
  const touchedFiles = [
    ...new Set(
      events
        .filter((event) => event.name === "file_touched")
        .map((event) => String(event.payload.path)),
    ),
  ];
  const testRuns = events
    .filter((event) => event.name === "test_run")
    .map((event) => ({
      command: String(event.payload.command),
      exitCode: Number(event.payload.exitCode ?? 0),
    }));

  return {
    sessionId,
    startedAt,
    finishedAt,
    commandCount: events.filter((event) => event.name === "command_started").length,
    touchedFiles,
    testRuns,
  };
}

export async function generateSummary(sessionId: string): Promise<string> {
  const events = await readTrace(sessionId);
  const summary = summarizeEvents(sessionId, events);
  const lines = [
    `# Forge Trace Summary: ${sessionId}`,
    "",
    `- Started: ${summary.startedAt}`,
    `- Finished: ${summary.finishedAt ?? "incomplete"}`,
    `- Commands: ${summary.commandCount}`,
    `- Touched files: ${summary.touchedFiles.length > 0 ? summary.touchedFiles.join(", ") : "none"}`,
    "",
    "## Test runs",
    ...(summary.testRuns.length > 0
      ? summary.testRuns.map((run) => `- \`${run.command}\` => exit ${run.exitCode}`)
      : ["- No test commands detected."]),
  ];

  await writeSummaryMarkdown(sessionId, `${lines.join("\n")}\n`);
  return lines.join("\n");
}
