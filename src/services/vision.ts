import OpenAI from "openai";
import { z } from "zod";
import { CARD_RECOGNITION_SYSTEM_PROMPT } from "../prompts/cardRecognition.js";
import type { VisionResult } from "../types/poker.js";

const visionSchema = z.union([
  z.object({
    holeCards: z.array(z.string()),
    boardCards: z.array(z.string()),
    confidence: z.number()
  }),
  z.object({
    error: z.literal("unclear_cards")
  })
]);

export class VisionError extends Error {
  constructor(message = "I could not confidently identify all cards. Please retake the photo.") {
    super(message);
    this.name = "VisionError";
  }
}

export async function recognizeCards(image: Buffer, options: { apiKey: string; model: string }): Promise<VisionResult> {
  const client = new OpenAI({ apiKey: options.apiKey });
  const response = await client.responses.create({
    model: options.model,
    input: [
      {
        role: "system",
        content: CARD_RECOGNITION_SYSTEM_PROMPT
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: "Identify the Texas Hold'em hole cards and community cards in this image."
          },
          {
            type: "input_image",
            image_url: `data:image/jpeg;base64,${image.toString("base64")}`,
            detail: "high"
          }
        ]
      }
    ],
    text: {
      format: {
        type: "json_object"
      }
    }
  });

  const rawText = response.output_text;
  if (!rawText) {
    throw new VisionError();
  }

  const parsed = visionSchema.parse(JSON.parse(rawText));
  if ("error" in parsed) {
    throw new VisionError();
  }

  return parsed;
}
