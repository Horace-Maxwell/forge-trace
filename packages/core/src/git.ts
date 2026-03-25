import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

async function git(args: string[], cwd = process.cwd()): Promise<string> {
  const { stdout } = await execFileAsync("git", args, { cwd });
  return stdout.trimEnd();
}

export async function listTouchedFiles(cwd = process.cwd()): Promise<string[]> {
  try {
    const status = await git(["status", "--short"], cwd);
    return status
      .split("\n")
      .filter(Boolean)
      .map((line) => line.slice(3).trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

export async function summarizeDiff(cwd = process.cwd()): Promise<{ files: string[]; stats: string }> {
  try {
    const files = await git(["diff", "--name-only"], cwd);
    const stats = await git(["diff", "--stat"], cwd);
    return {
      files: files.split("\n").filter(Boolean),
      stats,
    };
  } catch {
    return { files: [], stats: "" };
  }
}
