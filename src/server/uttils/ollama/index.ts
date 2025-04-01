import axios from 'axios';

export async function embedTextWithOllama(texts: string[]): Promise<number[][]> {
  const embeddings: number[][] = [];

  for (const text of texts) {
    const response = await axios.post('http://localhost:11434/api/embeddings', {
      model: 'nomic-embed-text',
      prompt: text,
    });
    embeddings.push(response.data.embedding);
  }

  return embeddings;
}
