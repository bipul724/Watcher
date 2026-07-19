// nodes/node-04-warroom/schema.js
import { z } from 'zod';

export const OutputSchema = z.object({
  incident_id: z.string(),
  service: z.string(),
  severity: z.enum(['P1', 'P2', 'P3']),
  pr_url: z.string().nullable().optional(),
  pr_status: z.enum([
    'CREATED',
    'FAILED',
    'FAILED_NO_CODE',
    'FAILED_INVALID_PATH',
    'FAILED_FILE_NOT_FOUND',
    'SKIPPED_NO_AUTH',
    'DUPLICATE_SKIPPED',
    'SKIPPED_UNCERTAIN',
    'FAILED_GUARDRAIL',
  ]),
  ai_fix_suggestion: z.object({
    file_path: z.string().nullable().optional(),
    diff: z.string().nullable().optional(),
    new_content: z.string().nullable().optional(),
    reasoning: z.string().nullable().optional(),
    confidence: z.number().nullable().optional(),
  }).nullable().optional(),
  original_content: z.string().nullable().optional(),
  resolved_at: z.string().optional(),
  fix_initiated_at: z.string(),
});
