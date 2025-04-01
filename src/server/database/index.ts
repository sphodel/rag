import { Pinecone } from '@pinecone-database/pinecone';
import * as dotenv from 'dotenv';
import { embedTextWithOllama } from '../uttils/ollama';
dotenv.config()
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

export const index = pinecone.Index(process.env.PINECONE_INDEX!);

export async function upsertToPinecone(indexName: string, texts: string[], vectors: number[][]) {
    const index = pinecone.Index(indexName);
    const timestamp = Date.now();
    const items = texts.map((text, i) => ({
      id: `doc-${timestamp}-${i}`,
      values: vectors[i],
      metadata: { text },
    }));
  
    await index.upsert(items);
  }
  
  export async function querySimilar(text: string, indexName: string, topK = 5) {
    const [embedding] = await embedTextWithOllama([text]);
    const index = pinecone.Index(indexName);
  
    const result = await index.query({
      vector: embedding,
      topK,
      includeMetadata: true,
    });
  
    return result.matches.map(match => ({
      score: match.score,
      text: match.metadata?.text,
    }));
  }
  