export const MODEL = 'claude-sonnet-5-5';

// USD per million tokens for claude-sonnet-5-5 (Anthropic first-party API rates)
const PRICE_PER_MTOK = {
  input: 2.0,
  output: 10.0,
  cacheWrite: 2.5, // 5-minute cache write = 1.25x input
  cacheRead: 0.2,
};

export type Usage = {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens?: number | null;
  cache_read_input_tokens?: number | null;
};

export function costOf(usage: Usage) {
  const input = (usage.input_tokens * PRICE_PER_MTOK.input) / 1e6;
  const output = (usage.output_tokens * PRICE_PER_MTOK.output) / 1e6;
  const cache =
    ((usage.cache_creation_input_tokens ?? 0) * PRICE_PER_MTOK.cacheWrite +
      (usage.cache_read_input_tokens ?? 0) * PRICE_PER_MTOK.cacheRead) /
    1e6;
  return { input, output, total: input + output + cache };
}
