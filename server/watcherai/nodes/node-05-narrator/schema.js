// nodes/node-05-narrator/schema.js
import { z } from 'zod';

export const OutputSchema = z.object({
  incident_id: z.string(),
  service: z.string(),
  severity: z.enum(['P1', 'P2', 'P3']),
  pr_url: z.string().nullable().optional(),
  memory_updated: z.boolean(),
  chunks_stored: z.number().optional(),
  memory_indexed_at: z.string().optional(),
  pipeline_completed_at: z.string(),
  status: z.literal('CLOSED_AND_LEARNED'),
});
