import { getEncoding } from 'js-tiktoken';

const MAX_ESTIMATED_TOKENS = 8000; 
const AVG_CHARS_PER_TOKEN = 4;
const encoder = getEncoding('cl100k_base');

export const tokenizeString = (input = ''): number => {
  try {
    const estimatedTokens = Math.ceil(input.length / AVG_CHARS_PER_TOKEN);
    if (estimatedTokens >= MAX_ESTIMATED_TOKENS) {
      console.warn('[Tokenizer] Input too long, fallback to estimation');
      return estimatedTokens;
    }
    return encoder.encode(input).length;
  } catch (error) {
    console.error('[Tokenizer] Failed to tokenize string, fallback to estimation:', error);
    return Math.ceil(input.length / AVG_CHARS_PER_TOKEN) || 0;
  }
};
