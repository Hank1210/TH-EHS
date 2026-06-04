export interface TelegramUser {
  id: number;
}

export interface TelegramPhotoSize {
  file_id: string;
  file_size?: number;
  width?: number;
  height?: number;
}

export interface TelegramDocument {
  file_id: string;
  mime_type?: string;
}

export interface TelegramMessage {
  chat: { id: number };
  from?: TelegramUser;
  photo?: TelegramPhotoSize[];
  document?: TelegramDocument;
  text?: string;
}

export interface TelegramUpdate {
  message?: TelegramMessage;
}

export interface TelegramFileResponse {
  ok: boolean;
  result?: {
    file_path?: string;
  };
}

export interface TelegramApi {
  downloadImage(fileId: string): Promise<Buffer>;
  sendMessage(chatId: number, message: string): Promise<void>;
}

export function createTelegramApi(botToken: string): TelegramApi {
  const apiBase = `https://api.telegram.org/bot${botToken}`;

  return {
    async downloadImage(fileId: string): Promise<Buffer> {
      const fileResponse = await fetch(`${apiBase}/getFile?file_id=${encodeURIComponent(fileId)}`);
      const filePayload = (await fileResponse.json()) as TelegramFileResponse;
      const filePath = filePayload.result?.file_path;

      if (!fileResponse.ok || !filePayload.ok || !filePath) {
        throw new Error("Unable to download image from Telegram.");
      }

      const imageResponse = await fetch(`https://api.telegram.org/file/bot${botToken}/${filePath}`);
      if (!imageResponse.ok) {
        throw new Error("Unable to download image from Telegram.");
      }

      return Buffer.from(await imageResponse.arrayBuffer());
    },

    async sendMessage(chatId: number, message: string): Promise<void> {
      const response = await fetch(`${apiBase}/sendMessage`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message
        })
      });

      if (!response.ok) {
        throw new Error("Unable to send response.");
      }
    }
  };
}

export function verifyWebhookSecret(headers: Record<string, string | string[] | undefined>, expectedSecret: string): boolean {
  const header = headers["x-telegram-bot-api-secret-token"];
  return typeof header === "string" && header === expectedSecret;
}

export function isAllowedUser(userId: number | undefined, allowedUserIds: ReadonlySet<number>): boolean {
  return allowedUserIds.size === 0 || (userId !== undefined && allowedUserIds.has(userId));
}

export function extractImageFileId(message: TelegramMessage): string | undefined {
  if (message.photo && message.photo.length > 0) {
    const largestPhoto = [...message.photo].sort((a, b) => (b.file_size ?? 0) - (a.file_size ?? 0))[0];
    return largestPhoto?.file_id;
  }

  if (message.document?.mime_type?.startsWith("image/")) {
    return message.document.file_id;
  }

  return undefined;
}
