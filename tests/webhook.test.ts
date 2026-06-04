import { describe, expect, it, vi } from "vitest";
import { handleTelegramUpdate, type WebhookDependencies } from "../src/api/telegram.js";

function dependencies(overrides: Partial<WebhookDependencies> = {}): WebhookDependencies {
  return {
    env: {
      TELEGRAM_BOT_TOKEN: "telegram",
      TELEGRAM_WEBHOOK_SECRET: "secret",
      OPENAI_API_KEY: "openai",
      OPENAI_MODEL: "gpt-4.1",
      ALLOWED_USER_IDS: "",
      MONTE_CARLO_ITERATIONS: 10000,
      NODE_ENV: "test",
      allowedUserIds: new Set()
    },
    telegram: {
      downloadImage: vi.fn(async () => Buffer.from("image")),
      sendMessage: vi.fn(async () => undefined)
    },
    evaluate: vi.fn(async () => "evaluation"),
    ...overrides
  };
}

describe("telegram webhook", () => {
  it("asks for a photo on unsupported messages", async () => {
    const deps = dependencies();
    await handleTelegramUpdate(
      {
        message: {
          chat: { id: 10 },
          from: { id: 20 },
          text: "hello"
        }
      },
      deps
    );

    expect(deps.telegram.sendMessage).toHaveBeenCalledWith(10, "Please send a photo containing your poker cards.");
  });

  it("downloads an image and sends evaluation", async () => {
    const deps = dependencies();
    await handleTelegramUpdate(
      {
        message: {
          chat: { id: 10 },
          from: { id: 20 },
          photo: [{ file_id: "small", file_size: 1 }, { file_id: "large", file_size: 2 }]
        }
      },
      deps
    );

    expect(deps.telegram.downloadImage).toHaveBeenCalledWith("large");
    expect(deps.telegram.sendMessage).toHaveBeenCalledWith(10, "evaluation");
  });
});
