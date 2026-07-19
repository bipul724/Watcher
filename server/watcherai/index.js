// index.js
// WatcherAgent Platform Library Entry Point
// Exposes the modular split-phase execution functions for queue workers.

import runTriageNode from './nodes/node-01-triage/index.js';
import runRunbookNode from './nodes/node-02-runbook/index.js';
import runHITLNode from './nodes/node-03-hitl/index.js';
import runFixerNode from './nodes/node-04-warroom/index.js';
import runMemoryNode from './nodes/node-05-narrator/index.js';

// Schemas for input/output verification
import { InputSchema as T1In, OutputSchema as T1Out } from './nodes/node-01-triage/schema.js';
import { InputSchema as T2In, OutputSchema as T2Out } from './nodes/node-02-runbook/schema.js';
import { OutputSchema as T3Out } from './nodes/node-03-hitl/schema.js';
import { OutputSchema as T4Out } from './nodes/node-04-warroom/schema.js';
import { OutputSchema as T5Out } from './nodes/node-05-narrator/schema.js';

// Context Validation Schema
import { ExecutionContextSchema } from './nodes/shared/context-schema.js';

/**
 * Validates data against a Zod schema, throwing clear errors on failure.
 */
function validate(schema, data, label) {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errorDetails = JSON.stringify(result.error.flatten());
    console.error(`❌ Validation failed at [${label}]:`, errorDetails);
    throw new Error(`Schema violation at ${label}: ${errorDetails}`);
  }
  return result.data;
}

/**
 * PHASE 1: Incident Ingestion & Triage
 * Runs Node 1 (Triage) ➔ Node 2 (Runbook RAG) ➔ Node 3 (Discord Approval)
 *
 * @param {object} payload - Raw incident alert payload from monitoring systems.
 * @param {object} context - Execution context containing project settings and incident metadata.
 * @returns {Promise<object>} Node 3 output (Awaiting Approval card details).
 */
export async function runPhase1(payload, context) {
  console.log(`🚀 [Phase 1] Starting execution for Incident: ${context?.incident?.id || 'unknown'}`);
  
  // Validate Execution Context
  const validatedContext = validate(ExecutionContextSchema, context, 'Phase 1 Context');

  // Node 1: Triage
  const triageInput = validate(T1In, payload, 'Node 1 Input');
  console.log(`▶ Running Node 1 (Triage) for incident ${triageInput.incident_id}...`);
  const triageResult = await runTriageNode(triageInput, validatedContext);
  const triageOutput = validate(T1Out, triageResult, 'Node 1 Output');

  // Node 2: Runbook RAG
  const runbookInput = validate(T2In, triageOutput, 'Node 2 Input');
  console.log(`▶ Running Node 2 (Runbook) for incident ${runbookInput.incident_id}...`);
  const runbookResult = await runRunbookNode(runbookInput, validatedContext);
  const runbookOutput = validate(T2Out, runbookResult, 'Node 2 Output');

  // Node 3: HITL Gateway (Discord notification)
  console.log(`▶ Running Node 3 (Discord HITL) for incident ${runbookOutput.incident_id}...`);
  const hitlResult = await runHITLNode(runbookOutput, validatedContext);
  const hitlOutput = validate(T3Out, hitlResult, 'Node 3 Output');

  console.log(`✅ [Phase 1] Completed. Incident ${hitlOutput.incident_id} is now AWAITING_APPROVAL.`);
  return hitlOutput;
}

/**
 * PHASE 2: Incident Remediation & Commit
 * Runs Node 4 (GitHub Fixer) ➔ Node 5 (Memory Narrator)
 *
 * @param {object} phase1Output - Output of runPhase1 (from database state).
 * @param {object} context - Execution context containing project settings and incident metadata.
 * @returns {Promise<object>} Node 5 output (Completed and learned details).
 */
export async function runPhase2(phase1Output, context) {
  console.log(`🚀 [Phase 2] Starting remediation for Incident: ${context?.incident?.id || 'unknown'}`);
  
  // Validate Execution Context
  const validatedContext = validate(ExecutionContextSchema, context, 'Phase 2 Context');

  // Node 4: GitHub Fixer PR
  // Pass the verified Phase 1 outputs to start the warroom fixing process
  console.log(`▶ Running Node 4 (GitHub Fixer) for incident ${phase1Output.incident_id}...`);
  const fixerResult = await runFixerNode(phase1Output, validatedContext);
  const fixerOutput = validate(T4Out, fixerResult, 'Node 4 Output');

  // Node 5: Memory Narrator / learning loop update
  console.log(`▶ Running Node 5 (Memory Narrator) for incident ${fixerOutput.incident_id}...`);
  const memoryResult = await runMemoryNode(fixerOutput, validatedContext);
  const memoryOutput = validate(T5Out, memoryResult, 'Node 5 Output');

  console.log(`✅ [Phase 2] Completed. Incident ${memoryOutput.incident_id} has been CLOSED_AND_LEARNED.`);
  return memoryOutput;
}
