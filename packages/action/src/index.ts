import { randomUUID } from "node:crypto";
import { writeFile } from "node:fs/promises";
import { runTracedCommand } from "@forge-trace/core";

async function main(): Promise<void> {
  const sessionId = process.env.INPUT_SESSION_ID || randomUUID();
  const command = process.env.INPUT_COMMAND;
  if (!command) {
    throw new Error("command is required.");
  }

  const commandArgs = command.split(" ").filter(Boolean);
  const result = await runTracedCommand(sessionId, commandArgs);

  let shareUrl = "";
  if (process.env.INPUT_COLLECTOR_URL) {
    try {
      const response = await fetch(`${process.env.INPUT_COLLECTOR_URL.replace(/\/$/, "")}/api/ingest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(process.env.INPUT_API_KEY ? { Authorization: `Bearer ${process.env.INPUT_API_KEY}` } : {}),
        },
        body: JSON.stringify({ sessionId }),
      });
      if (response.ok) {
        const data = (await response.json()) as { shareUrl?: string };
        shareUrl = data.shareUrl ?? "";
      }
    } catch {
      shareUrl = "";
    }
  }

  if (process.env.GITHUB_OUTPUT) {
    await writeFile(
      process.env.GITHUB_OUTPUT,
      `session_id=${sessionId}\nsummary_path=${result.summaryPath}\nshare_url=${shareUrl}\n`,
      { flag: "a" },
    );
  }

  console.log(result.summaryPath);
  if (shareUrl) {
    console.log(shareUrl);
  }
  process.exitCode = result.exitCode;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
