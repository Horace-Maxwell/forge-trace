export type TraceEventName =
  | "session_started"
  | "llm_call"
  | "tool_call"
  | "command_started"
  | "command_finished"
  | "file_touched"
  | "git_diff"
  | "test_run"
  | "review_comment"
  | "session_finished";

export interface TraceEvent {
  name: TraceEventName;
  at: string;
  sessionId: string;
  payload: Record<string, unknown>;
}

export interface SessionSummary {
  sessionId: string;
  startedAt: string;
  finishedAt?: string;
  commandCount: number;
  touchedFiles: string[];
  testRuns: Array<{ command: string; exitCode: number }>;
}
