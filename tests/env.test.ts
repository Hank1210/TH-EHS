import { describe, expect, it } from "vitest";
import { loadEnv } from "../src/config/env.js";

describe("loadEnv", () => {
  it("parses required environment variables and allowlist", () => {
    const env = loadEnv({
      TELEGRAM_BOT_TOKEN: "telegram",
      TELEGRAM_WEBHOOK_SECRET: "secret",
      OPENAI_API_KEY: "openai",
      OPENAI_MODEL: "gpt-4.1",
      ALLOWED_USER_IDS: "123,456",
      MONTE_CARLO_ITERATIONS: "50000",
      NODE_ENV: "test"
    });

    expect(env.allowedUserIds.has(123)).toBe(true);
    expect(env.allowedUserIds.has(456)).toBe(true);
    expect(env.MONTE_CARLO_ITERATIONS).toBe(50000);
  });
});
