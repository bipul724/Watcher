// nodes/node-03-hitl/index.js
// Guardian Node 03 — HITL Gate (Discord Edition)

import { sendApprovalCard } from './discord-bot.js';

/**
 * Initiates the Human-in-the-Loop process via Discord.
 * Structures the Discord result into the { hitl: {...} } shape required by T3Out schema.
 */
export async function runHITLNode(input, context) {
  console.log(`💬 Sending incident ${input.incident_id} to Discord for approval...`);

  const result = await sendApprovalCard(input, context);

  // Pull out hitl-specific fields and nest them under `hitl` to match OutputSchema
  const {
    hitl_status,
    discord_message_id,
    discord_thread_id,
    hitl_initiated_at,
    hitl_expires_at,
    discord_error,
    // rest is the original incidentData pass-through
    ...passthrough
  } = result;

  return {
    ...passthrough,
    hitl: {
      hitl_status,
      discord_message_id,
      discord_thread_id,
      hitl_initiated_at: hitl_initiated_at || new Date().toISOString(),
      hitl_expires_at,
      ...(discord_error ? { discord_error } : {}),
    },
  };
}

export default async function runNode(input, context) {
  return await runHITLNode(input, context);
}
