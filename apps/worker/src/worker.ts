import { persistSession } from "@forge-trace/core";

interface R2BucketLike {
  put(key: string, value: string): Promise<unknown>;
  get(key: string): Promise<{ text(): Promise<string> } | null>;
}

interface Env {
  APP_NAME?: string;
  COLLECTOR_API_KEY?: string;
  ARTIFACTS?: R2BucketLike;
}

function html(title: string, body: string): Response {
  return new Response(
    `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title><style>body{font-family:ui-sans-serif,system-ui,sans-serif;background:#f7efe3;color:#182026;margin:0;padding:32px}main{max-width:860px;margin:0 auto}a.button,button.button{display:inline-block;padding:12px 16px;border-radius:999px;background:#874f41;color:#fff;text-decoration:none;border:none;margin-right:12px;margin-bottom:12px}pre{white-space:pre-wrap;background:#fff;padding:16px;border-radius:16px;border:1px solid #d8cfc2}section{background:#fff;padding:20px;border-radius:24px;border:1px solid #d8cfc2;margin-bottom:18px}</style></head><body><main>${body}</main></body></html>`,
    { headers: { "content-type": "text/html; charset=utf-8" } },
  );
}

async function handleIngest(request: Request, env: Env): Promise<Response> {
  if (env.COLLECTOR_API_KEY) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${env.COLLECTOR_API_KEY}`) {
      return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
    }
  }

  const payload = await request.json();
  const shareId = await persistSession(env, payload as Record<string, unknown>);
  return Response.json({
    ok: true,
    shareId,
    shareUrl: new URL(`/share/${shareId}`, request.url).toString(),
  });
}

async function handleShare(env: Env, shareId: string): Promise<Response> {
  const object = await env.ARTIFACTS?.get(`sessions/${shareId}.json`);
  if (!object) {
    return new Response("Not found", { status: 404 });
  }
  const raw = await object.text();
  return html("Forge Trace session", `<section><h1>Forge Trace session</h1><a class="button" href="/">Back</a></section><section><pre>${raw.replace(/</g, "&lt;")}</pre></section>`);
}

export function createWorker() {
  return {
    async fetch(request: Request, env: Env): Promise<Response> {
      const url = new URL(request.url);
      if (url.pathname === "/") {
        return html(
          env.APP_NAME ?? "Forge Trace",
          `<section><h1>${env.APP_NAME ?? "Forge Trace"}</h1><p>Capture and share coding-agent sessions in one install flow.</p><a class="button" href="/setup">Open collector setup</a><a class="button" href="https://deploy.workers.cloudflare.com/?url=https://github.com/your-org/forge-trace">Deploy to Cloudflare</a></section><section><pre>npx forge-trace@latest run --session demo -- npm test</pre></section>`,
        );
      }
      if (url.pathname === "/setup") {
        return html("Setup Forge Trace", `<section><h1>Setup Forge Trace</h1><p>Use this collector URL inside the action to receive shareable trace permalinks.</p><pre>${url.origin}/api/ingest</pre></section>`);
      }
      if (url.pathname === "/api/health") {
        return Response.json({ ok: true, service: env.APP_NAME ?? "Forge Trace" });
      }
      if (url.pathname === "/api/ingest" && request.method === "POST") {
        return handleIngest(request, env);
      }
      if (url.pathname.startsWith("/share/")) {
        return handleShare(env, url.pathname.split("/").pop() ?? "");
      }
      return new Response("Not found", { status: 404 });
    },
  };
}

export default createWorker();
