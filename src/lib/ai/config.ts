import { createOpenAICompatible } from '@ai-sdk/openai-compatible'

// Model id is a "provider/model" string resolved by the Vercel AI Gateway
// (via AI_GATEWAY_API_KEY). Swap providers by changing this value only.
const GATEWAY_MODEL = process.env.AI_TUNE_MODEL ?? 'alibaba/qwen3.5-flash'

// Self-hosted Qwen2.5-0.5B-Instruct served via vLLM on Modal (see modal/qwen_tune.py).
// vLLM's OpenAI-compatible routes are mounted under /v1 (e.g. /v1/chat/completions).
const qwenModal = createOpenAICompatible({
  name: 'qwen-modal',
  baseURL: `${process.env.QWEN_TUNE_API_URL ?? ''}/v1`,
  apiKey: process.env.QWEN_TUNE_API_KEY,
})

// AI_TUNE_PROVIDER=qwen-modal switches the tune model to the self-hosted
// Qwen2.5-0.5B-Instruct endpoint on Modal; default stays on the AI Gateway model.
export const TUNE_MODEL =
  process.env.AI_TUNE_PROVIDER === 'qwen-modal'
    ? qwenModal.chatModel('qwen2.5-0.5b-instruct')
    : GATEWAY_MODEL
