import { rm } from "node:fs/promises";
import { afterEach, describe, expect, it } from "vitest";
import { appendEvent, generateSummary } from "../packages/core/src/index.js";
import { createWorker } from "../apps/worker/src/worker.js";

describe("forge-trace deployable core", () => {
  afterEach(async () => {
    await rm(".forge-trace", { recursive: true, force: true });
  });

  it("writes and summarizes trace events", async () => {
    await appendEvent("session-1", {
      name: "session_started",
      at: new Date().toISOString(),
      sessionId: "session-1",
      payload: { source: "test" },
    });
    await appendEvent("session-1", {
      name: "command_started",
      at: new Date().toISOString(),
      sessionId: "session-1",
      payload: { command: "npm test" },
    });
    await appendEvent("session-1", {
      name: "test_run",
      at: new Date().toISOString(),
      sessionId: "session-1",
      payload: { command: "npm test", exitCode: 1 },
    });
    await appendEvent("session-1", {
      name: "file_touched",
      at: new Date().toISOString(),
      sessionId: "session-1",
      payload: { path: "src/index.ts" },
    });
    await appendEvent("session-1", {
      name: "session_finished",
      at: new Date().toISOString(),
      sessionId: "session-1",
      payload: {},
    });

    const summary = await generateSummary("session-1");
    expect(summary).toMatch(/Touched files: src\/index.ts/i);
    expect(summary).toMatch(/npm test/);
  });

  it("serves the collector health route", async () => {
    const worker = createWorker();
    const response = await worker.fetch(new Request("https://example.com/api/health"), { APP_NAME: "Forge Trace" });
    expect(await response.json()).toEqual({ ok: true, service: "Forge Trace" });
  });
});
