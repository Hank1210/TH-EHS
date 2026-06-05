import type { IncomingMessage, ServerResponse } from "node:http";
import { loadEnv, type AppEnv } from "../config/env.js";
import { evaluateImage } from "../services/evaluator.js";
import {
  createTelegramApi,
  extractImageFileId,
  isAllowedUser,
  type TelegramApi,
  type TelegramUpdate,
  verifyWebhookSecret,
} from "../services/telegram.js";
import type { Language } from "../types/poker.js";
import { readJsonBody, sendJson } from "../utils/http.js";

const DEFAULT_LANGUAGE: Language = "en";
const chatLanguages = new Map<number, Language>();

export interface WebhookDependencies {
  env: AppEnv;
  telegram: TelegramApi;
  evaluate: (image: Buffer, env: AppEnv, language: Language) => Promise<string>;
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "Method not allowed" });
    return;
  }

  const env = loadEnv();
  if (!verifyWebhookSecret(req.headers, env.TELEGRAM_WEBHOOK_SECRET)) {
    sendJson(res, 401, { error: "Unauthorized" });
    return;
  }

  const update = await readJsonBody<TelegramUpdate>(req);
  await handleTelegramUpdate(update, {
    env,
    telegram: createTelegramApi(env.TELEGRAM_BOT_TOKEN),
    evaluate: evaluateImage,
  });

  sendJson(res, 200, { ok: true });
}

export async function handleTelegramUpdate(
  update: TelegramUpdate,
  dependencies: WebhookDependencies,
): Promise<void> {
  const message = update.message;
  if (!message) {
    return;
  }

  const chatId = message.chat.id;
  const languageCommand = parseLanguageCommand(message.text);
  if (!isAllowedUser(message.from?.id, dependencies.env.allowedUserIds)) {
    await dependencies.telegram.sendMessage(
      chatId,
      "You are not allowed to use this bot.",
    );
    return;
  }

  if (languageCommand) {
    chatLanguages.set(chatId, languageCommand);
    await dependencies.telegram.sendMessage(
      chatId,
      getLanguageChangedMessage(languageCommand),
    );
    return;
  }

  const language = chatLanguages.get(chatId) ?? DEFAULT_LANGUAGE;
  const fileId = extractImageFileId(message);
  if (!fileId) {
    await dependencies.telegram.sendMessage(
      chatId,
      withLanguageOption(getUnsupportedMessage(language), language),
    );
    return;
  }

  try {
    const image = await dependencies.telegram.downloadImage(fileId);
    const response = await dependencies.evaluate(
      image,
      dependencies.env,
      language,
    );
    await dependencies.telegram.sendMessage(
      chatId,
      withLanguageOption(response, language),
    );
  } catch {
    await dependencies.telegram.sendMessage(
      chatId,
      withLanguageOption(getRetakeMessage(language), language),
    );
  }
}

function parseLanguageCommand(text: string | undefined): Language | undefined {
  const command = text?.trim().toUpperCase();
  if (command === "DE") {
    return "de";
  }
  if (command === "EN") {
    return "en";
  }
  return undefined;
}

function getLanguageChangedMessage(language: Language): string {
  if (language === "de") {
    return withLanguageOption(
      "Deutsch ist aktiviert. Bitte sende ein Foto mit deinen Pokerkarten.",
      language,
    );
  }
  return withLanguageOption(
    "English is enabled. Please send a photo containing your poker cards.",
    language,
  );
}

function getUnsupportedMessage(language: Language): string {
  if (language === "de") {
    return "Bitte sende ein Foto mit deinen Pokerkarten.";
  }
  return "Please send a photo containing your poker cards.";
}

function getRetakeMessage(language: Language): string {
  if (language === "de") {
    return "Ich konnte nicht alle Karten sicher erkennen. Bitte nimm das Foto erneut auf.";
  }
  return "I could not confidently identify all cards. Please retake the photo.";
}

function withLanguageOption(message: string, language: Language): string {
  const hint =
    language === "de"
      ? "Sprache wechseln: Sende DE für Deutsch oder EN für Englisch."
      : "Language option: send DE for German or EN for English.";

  return `${message}\n\n${hint}`;
}
