import { describe, expect, it, vi } from "vitest";
import {
  handleTelegramUpdate,
  type WebhookDependencies,
} from "../src/api/telegram.js";

function dependencies(
  overrides: Partial<WebhookDependencies> = {},
): WebhookDependencies {
  return {
    env: {
      TELEGRAM_BOT_TOKEN: "telegram",
      TELEGRAM_WEBHOOK_SECRET: "secret",
      OPENAI_API_KEY: "openai",
      OPENAI_MODEL: "gpt-4.1",
      ALLOWED_USER_IDS: "",
      MONTE_CARLO_ITERATIONS: 10000,
      NODE_ENV: "test",
      allowedUserIds: new Set(),
    },
    telegram: {
      downloadImage: vi.fn(async () => Buffer.from("image")),
      sendMessage: vi.fn(async () => undefined),
    },
    evaluate: vi.fn(async () => "evaluation"),
    ...overrides,
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
          text: "hello",
        },
      },
      deps,
    );

    expect(deps.telegram.sendMessage).toHaveBeenCalledWith(
      10,
      "Please send a photo containing your poker cards.\n\nLanguage option: send DE for German or EN for English.",
    );
  });

  it("downloads an image and sends evaluation", async () => {
    const deps = dependencies();
    await handleTelegramUpdate(
      {
        message: {
          chat: { id: 10 },
          from: { id: 20 },
          photo: [
            { file_id: "small", file_size: 1 },
            { file_id: "large", file_size: 2 },
          ],
        },
      },
      deps,
    );

    expect(deps.telegram.downloadImage).toHaveBeenCalledWith("large");
    expect(deps.evaluate).toHaveBeenCalledWith(
      Buffer.from("image"),
      deps.env,
      "en",
    );
    expect(deps.telegram.sendMessage).toHaveBeenCalledWith(
      10,
      "evaluation\n\nLanguage option: send DE for German or EN for English.",
    );
  });

  it("switches to German when the user sends DE", async () => {
    const deps = dependencies();
    await handleTelegramUpdate(
      {
        message: {
          chat: { id: 30 },
          from: { id: 20 },
          text: "DE",
        },
      },
      deps,
    );

    expect(deps.telegram.sendMessage).toHaveBeenCalledWith(
      30,
      "Deutsch ist aktiviert. Bitte sende ein Foto mit deinen Pokerkarten.\n\nSprache wechseln: Sende DE für Deutsch oder EN für Englisch.",
    );

    await handleTelegramUpdate(
      {
        message: {
          chat: { id: 30 },
          from: { id: 20 },
          photo: [{ file_id: "large", file_size: 2 }],
        },
      },
      deps,
    );

    expect(deps.evaluate).toHaveBeenCalledWith(
      Buffer.from("image"),
      deps.env,
      "de",
    );
    expect(deps.telegram.sendMessage).toHaveBeenLastCalledWith(
      30,
      "evaluation\n\nSprache wechseln: Sende DE für Deutsch oder EN für Englisch.",
    );
  });

  it("switches back to English when the user sends EN", async () => {
    const deps = dependencies();
    await handleTelegramUpdate(
      {
        message: {
          chat: { id: 40 },
          from: { id: 20 },
          text: "DE",
        },
      },
      deps,
    );

    await handleTelegramUpdate(
      {
        message: {
          chat: { id: 40 },
          from: { id: 20 },
          text: "EN",
        },
      },
      deps,
    );

    expect(deps.telegram.sendMessage).toHaveBeenLastCalledWith(
      40,
      "English is enabled. Please send a photo containing your poker cards.\n\nLanguage option: send DE for German or EN for English.",
    );
  });

  it("sends English help when the user sends Help", async () => {
    const deps = dependencies();
    await handleTelegramUpdate(
      {
        message: {
          chat: { id: 50 },
          from: { id: 20 },
          text: "Help",
        },
      },
      deps,
    );

    expect(deps.telegram.downloadImage).not.toHaveBeenCalled();
    expect(deps.evaluate).not.toHaveBeenCalled();
    expect(deps.telegram.sendMessage).toHaveBeenCalledWith(
      50,
      expect.stringContaining("TH-EHS Help"),
    );
    expect(deps.telegram.sendMessage).toHaveBeenCalledWith(
      50,
      expect.stringContaining(
        "Formula: EHS = HS * (1 - NPOT) + (1 - HS) * PPOT.",
      ),
    );
  });

  it("sends German help when the user sends Hilfe", async () => {
    const deps = dependencies();
    await handleTelegramUpdate(
      {
        message: {
          chat: { id: 60 },
          from: { id: 20 },
          text: "Hilfe",
        },
      },
      deps,
    );

    expect(deps.telegram.downloadImage).not.toHaveBeenCalled();
    expect(deps.evaluate).not.toHaveBeenCalled();
    expect(deps.telegram.sendMessage).toHaveBeenCalledWith(
      60,
      expect.stringContaining("TH-EHS Hilfe"),
    );
    expect(deps.telegram.sendMessage).toHaveBeenCalledWith(
      60,
      expect.stringContaining(
        "Formel: EHS = HS * (1 - NPOT) + (1 - HS) * PPOT.",
      ),
    );
  });
});
