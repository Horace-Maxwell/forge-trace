import { randomUUID } from "node:crypto";

export async function persistSession(
  env: {
    ARTIFACTS?: { put(key: string, value: string): Promise<unknown> };
  },
  session: Record<string, unknown>,
): Promise<string> {
  const shareId = randomUUID().slice(0, 12);
  if (env.ARTIFACTS) {
    await env.ARTIFACTS.put(`sessions/${shareId}.json`, JSON.stringify(session, null, 2));
  }
  return shareId;
}
