// nodes/node-04-warroom/index.js
// Guardian Node 04 — Fixer Agent (GitHub Edition)

import { createFixPR } from './github-fixer.js';

/**
 * Executes the automated fix by creating a GitHub Pull Request.
 */
export async function runFixerNode(input, context) {
  console.log(`🛠️ Initiating GitHub PR fix for ${input.incident_id}...`);
  
  const result = await createFixPR(input, context);
  
  return {
    ...result,
    fix_initiated_at: new Date().toISOString()
  };
}

export default async function runNode(input, context) {
  return await runFixerNode(input, context);
}
