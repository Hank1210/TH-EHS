# TH-EHS2 Implementation Plan

## Documentation Review Findings

- The product direction is consistent across `PRD.md`, `TASKS.md`, `ARCHITECTURE.md`, `PROMPTS.md`, and `IMPLEMENTATION_NOTES.md`: use AI only for card recognition, keep the app stateless, and implement all poker math deterministically in TypeScript.
- The docs mention `GPT-4.1` and `gpt-4.1`; implementation will default `OPENAI_MODEL=gpt-4.1` and keep it configurable by environment variable.
- `TASKS.md` calls the setup phase "Phase 1", while the user request reserves Phase 1 for documentation review and planning. This plan follows the user-requested phase order.
- Vercel routing is specified as `src/api/telegram.ts`. Vercel normally supports serverless functions under root `api/`, so implementation keeps the documented source module and adds a root `api/telegram.ts` adapter that exposes `/api/telegram`.
- The PRD requires Telegram webhook verification and a user allowlist. Implementation will verify `x-telegram-bot-api-secret-token` against `TELEGRAM_WEBHOOK_SECRET`, and enforce `ALLOWED_USER_IDS` when provided.
- The docs require deterministic results, but also request Monte Carlo for pre-flop. Implementation will use a seeded pseudo-random generator derived from normalized input cards so identical inputs and iteration counts produce identical outputs.
- Advice must not use an LLM. It will be template and threshold based.
- Flop and turn exact EHS can be expensive. Implementation will enumerate exact future boards for post-flop stages and keep Vercel `maxDuration` at 30 seconds. If runtime becomes too slow, the code should expose a deterministic capped mode as a future optimization, but the initial target is exact post-flop enumeration.

## Implementation Risks

- `pokersolver` may not ship complete TypeScript declarations. If so, add a local declaration file instead of weakening the whole project.
- Full flop EHS enumeration has a large nested loop. It is acceptable for the MVP only if tests and build pass locally; production latency should be verified with realistic images before launch.
- Vision recognition depends on OpenAI API behavior and image quality. Validation must reject low-confidence, duplicate, or malformed card results.
- Vercel function paths can be sensitive to project configuration. The webhook file and `vercel.json` must be aligned before deployment.
- Telegram file downloads must avoid persistence. Images will be held only as in-memory buffers/base64 during the request.

## Concrete Execution Order

1. Bootstrap the TypeScript/Vercel project files: `package.json`, `tsconfig.json`, `vercel.json`, `.env.example`, and source/test folders.
2. Add shared type definitions, environment validation, constants, and utility functions.
3. Implement the Telegram webhook skeleton with payload parsing, webhook secret verification, allowlist checks, unsupported-message responses, and dependency injection seams for tests.
4. Add basic tests for environment validation and webhook behavior.
5. Implement Telegram image file resolution and in-memory download.
6. Implement OpenAI Vision card recognition with structured JSON output using the prompt from `PROMPTS.md`.
7. Implement card normalization and validation for ranks, suits, duplicates, hole card count, and legal board size.
8. Implement deterministic poker primitives: deck generation, stage detection, opponent combinations, future-board enumeration, and `pokersolver` hand comparison.
9. Implement HS, PPOT, NPOT, EHS, and seeded Monte Carlo pre-flop evaluation.
10. Implement deterministic advice buckets and Telegram response formatting.
11. Add unit tests for validation, stage detection, deck generation, hand comparison, river EHS, and deterministic Monte Carlo repeatability.
12. Add integration tests for the webhook flow using mocked Telegram and Vision services.
13. Run `npm test` and `npm run build`, then fix all failures.

## Assumptions

- The app evaluates heads-up Texas Hold'em against one random opponent, as specified in `IMPLEMENTATION_NOTES.md`.
- `ALLOWED_USER_IDS` is optional. When empty, any Telegram user can use the bot; when set, only listed numeric user IDs are accepted.
- `MONTE_CARLO_ITERATIONS` defaults to `50000`, but tests may pass a smaller deterministic value.
- Unsupported Telegram input receives `Please send a photo containing your poker cards.`
- Vision confidence below `0.85` is rejected with the retake message.
- The app will not create a database, write uploaded images, or persist evaluation results.
