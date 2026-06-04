# TH-EHS2

Telegram Poker Hand Evaluator for Texas Hold'em photos.

## Local Development

```bash
npm install
npm test
npm run build
```

Create a local `.env` from `.env.example` and set the required values.

## Environment Variables

- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_WEBHOOK_SECRET`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`, defaults to `gpt-4.1`
- `ALLOWED_USER_IDS`, optional comma-separated Telegram user IDs
- `MONTE_CARLO_ITERATIONS`, defaults to `50000`
- `NODE_ENV`

## Vercel

The webhook route is exposed at:

```text
/api/telegram
```

Set the same environment variables in Vercel before deploying.

## Telegram Webhook Registration

```bash
curl -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook" \
  -d "url=https://YOUR_VERCEL_DOMAIN/api/telegram" \
  -d "secret_token=$TELEGRAM_WEBHOOK_SECRET"
```

## Implementation Rules

- Vision is used only for card recognition.
- EHS, HS, PPOT, NPOT, poker equity, and hand ranking are deterministic TypeScript code.
- The application does not store images, users, hands, or results.
