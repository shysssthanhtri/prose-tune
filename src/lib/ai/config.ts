// Model id is a "provider/model" string resolved by the Vercel AI Gateway
// (via AI_GATEWAY_API_KEY). Swap providers by changing this value only.
export const TUNE_MODEL = process.env.AI_TUNE_MODEL ?? 'alibaba/qwen3.5-flash'
