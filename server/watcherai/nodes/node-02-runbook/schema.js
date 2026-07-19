// nodes/node-02-runbook/schema.js
// Input/output JSON schema definitions using Zod

import { z } from 'zod';

const RunbookSchema = z.object({
  title:       z.string(),
  steps:       z.array(z.string()),
  source:      z.string(),
  relevance:   z.number().min(0).max(1).optional(),
  fix_diff:    z.string().nullable().optional(),
  root_cause:  z.string().nullable().optional(),
  pr_url:      z.string().nullable().optional(),
  incident_id: z.string().optional(),
  url:         z.string().optional(),
  lastUpdated: z.string().optional(),
  owner:       z.string().optional(),
});

export const InputSchema = z.object({
  incident_id:                z.string(),
  service:                    z.string(),
  severity:                   z.enum(['P1', 'P2', 'P3']),
  confidence:                 z.number(),
  reasoning:                  z.string(),
  isCriticalService:          z.boolean(),
  alert_raw:                  z.record(z.unknown()),
  triggered_at:               z.string(),
  triage_completed_at:        z.string(),
  // Technical fields forwarded from node01
  raw_error_message:          z.string().optional(),
  normalized_error_signature: z.string().optional(),
  root_frame:                 z.object({ file: z.string().nullable(), line: z.number().nullable(), function: z.string().nullable() }).optional(),
  affected_files:             z.array(z.string()).optional(),
  error_type:                 z.string().optional(),
  ai_explanation:             z.string().nullable().optional(),
}).passthrough();

export const OutputSchema = InputSchema.extend({
  runbooks:             z.array(RunbookSchema),
  runbook_retrieved_at: z.string(),
});
