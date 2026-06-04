import { z } from "zod";

const envSchema = z.object({
  TELEGRAM_BOT_TOKEN: z.string().min(1),
  TELEGRAM_WEBHOOK_SECRET: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),
  OPENAI_MODEL: z.string().min(1).default("gpt-4.1"),
  ALLOWED_USER_IDS: z.string().default(""),
  MONTE_CARLO_ITERATIONS: z.coerce.number().int().min(10000).default(50000),
  NODE_ENV: z.string().default("development")
});

export type AppEnv = z.infer<typeof envSchema> & {
  allowedUserIds: Set<number>;
};

export function loadEnv(source: NodeJS.ProcessEnv = process.env): AppEnv {
  const parsed = envSchema.parse(source);
  return {
    ...parsed,
    allowedUserIds: parseAllowedUserIds(parsed.ALLOWED_USER_IDS)
  };
}

function parseAllowedUserIds(value: string): Set<number> {
  const ids = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => Number(item));

  if (ids.some((id) => !Number.isSafeInteger(id) || id <= 0)) {
    throw new Error("ALLOWED_USER_IDS must contain comma-separated positive integers");
  }

  return new Set(ids);
}
