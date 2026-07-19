// nodes/node-02-runbook/index.js
// Guardian Node 02 — Runbook Agent (Pinecone Edition)

import { searchRunbooks } from './pinecone-rag.js';

/**
 * Fetches relevant runbooks and past fixes using Pinecone RAG.
 */
export async function fetchRunbook(input, context) {
  const { service, reasoning, error_category, error_type } = input;
  
  const results = await searchRunbooks(service, reasoning, context, error_category, error_type);
  
  return {
    ...input,
    runbooks: results.map(r => ({
      title: r.title || 'Historical Fix',
      steps: r.steps || [],
      fix_diff: r.fix_diff || null,
      root_cause: r.root_cause || null,
      pr_url: r.pr_url || null,
      source: r.source,
      relevance: r.relevance,
      incident_id: r.incident_id,
    })),
    runbook_retrieved_at: new Date().toISOString()
  };
}

export default async function runRunbookNode(input, context) {
  return await fetchRunbook(input, context);
}
