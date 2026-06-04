import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

loadDotEnv(resolve(".env"));

const { default: telegramHandler } = await import("../.dev-dist/src/api/telegram.js");
const port = Number(process.env.PORT ?? 3000);

const server = createServer(async (req, res) => {
  const startedAt = Date.now();
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  res.on("finish", () => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url} -> ${res.statusCode} ${Date.now() - startedAt}ms`);
  });

  if (req.url?.startsWith("/api/telegram")) {
    await telegramHandler(req, res);
    return;
  }

  res.statusCode = 200;
  res.setHeader("content-type", "text/plain; charset=utf-8");
  res.end("TH-EHS2 local webhook server. POST Telegram updates to /api/telegram.\n");
});

server.listen(port, () => {
  console.log(`TH-EHS2 local webhook server listening on http://localhost:${port}`);
});

function loadDotEnv(path) {
  let content;
  try {
    content = readFileSync(path, "utf8");
  } catch {
    return;
  }

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, equalsIndex).trim();
    const rawValue = trimmed.slice(equalsIndex + 1).trim();
    const value = rawValue.replace(/^["']|["']$/g, "");

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}
