import type { IncomingMessage, ServerResponse } from "node:http";
import { loadEnv, type AppEnv } from "../config/env.js";
import { evaluateImage } from "../services/evaluator.js";
import {
  createTelegramApi,
  extractImageFileId,
  isAllowedUser,
  type TelegramApi,
  type TelegramUpdate,
  verifyWebhookSecret
} from "../services/telegram.js";
import { readJsonBody, sendJson } from "../utils/http.js";

const UNSUPPORTED_MESSAGE = "Please send a photo containing your poker cards.";
const RETAKE_MESSAGE = "I could not confidently identify all cards. Please retake the photo.";

export interface WebhookDependencies {
  env: AppEnv;
  telegram: TelegramApi;
  evaluate: (image: Buffer, env: AppEnv) => Promise<string>;
}

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
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
    evaluate: evaluateImage
  });

  sendJson(res, 200, { ok: true });
}

export async function handleTelegramUpdate(update: TelegramUpdate, dependencies: WebhookDependencies): Promise<void> {
  const message = update.message;
  if (!message) {
    return;
  }

  const chatId = message.chat.id;
  if (!isAllowedUser(message.from?.id, dependencies.env.allowedUserIds)) {
    await dependencies.telegram.sendMessage(chatId, "You are not allowed to use this bot.");
    return;
  }

  const fileId = extractImageFileId(message);
  if (!fileId) {
    await dependencies.telegram.sendMessage(chatId, UNSUPPORTED_MESSAGE);
    return;
  }

  try {
    const image = await dependencies.telegram.downloadImage(fileId);
    const response = await dependencies.evaluate(image, dependencies.env);
    await dependencies.telegram.sendMessage(chatId, response);
  } catch (error) {
    const messageText = error instanceof Error && error.message ? error.message : RETAKE_MESSAGE;
    await dependencies.telegram.sendMessage(chatId, messageText);
  }
}
