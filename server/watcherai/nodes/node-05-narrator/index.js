// nodes/node-05-narrator/index.js
// Guardian Node 05 — Memory Agent
// Final stage: Record the fix and update the learning loop

import { updateAgentMemory } from './memory-updater.js';

/**
 * Finalizes the incident by updating the RAG memory.
 */
export async function runMemoryNode(input, context) {
  console.log(`🎓 Finalizing incident ${input.incident_id}. Updating learning loop...`);
  
  const result = await updateAgentMemory(input, context);
  
  return {
    ...result,
    pipeline_completed_at: new Date().toISOString(),
    status: 'CLOSED_AND_LEARNED'
  };
}

export default async function runNode(input, context) {
  return await runMemoryNode(input, context);
}
