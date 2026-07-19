// nodes/shared/context-schema.js
// Execution Context Validation Schema using Zod
// Maps all project-scoped credentials, parameters, and alert metadata to prevent runtime errors.

import { z } from 'zod';

export const ProjectContextSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().optional(),
  
  // GitHub Integration Credentials & Repo Scopes
  githubToken: z.string().min(1, "GitHub Token is required"),
  githubOwner: z.string().min(1, "GitHub Repository Owner is required"),
  githubRepo: z.string().min(1, "GitHub Repository Name is required"),
  
  // Discord Channel Routing & Optional Bot Key
  discordChannelId: z.string().min(1, "Discord Channel ID is required"),
  discordBotToken: z.string().optional(), // Fallback to process.env.DISCORD_BOT_TOKEN
  
  // Pinecone Integration & Memory Segmentation
  pineconeNamespace: z.string().min(1, "Pinecone Namespace is required"),
  pineconeApiKey: z.string().optional(), // Fallback to process.env.PINECONE_API_KEY
  pineconeIndexName: z.string().optional(), // Fallback to process.env.PINECONE_INDEX_NAME || 'watcher-knowledge'
  pineconeScoreThreshold: z.number().min(0).max(1).optional(), // Fallback to process.env.PINECONE_SCORE_THRESHOLD || 0.78
  pineconeScoreThresholdBroad: z.number().min(0).max(1).optional(), // Fallback to process.env.PINECONE_SCORE_THRESHOLD_BROAD || 0.82
  
  // LLM Configurations
  openrouterKey: z.string().optional().nullable(),
  llmProvider: z.string().optional(),
  llmModel: z.string().optional().nullable(),
  defaultLlmModel: z.string().optional(), // Fallback to process.env.DEFAULT_LLM_MODEL
  llmTimeoutMs: z.number().positive().optional(), // Fallback to process.env.LLM_TIMEOUT_MS || 30000

  
  // Custom Project Ingestion Noise Thresholds (overriding defaults if specified)
  noiseErrorRateThreshold: z.number().min(0).max(1).optional(), // Fallback to 0.02
  noiseLatencyMsThreshold: z.number().nonnegative().optional(), // Fallback to 200
  noiseDurationMinThreshold: z.number().nonnegative().optional(), // Fallback to 1
  
  // Human-in-the-loop (HITL) configurations
  hitlTimeoutMs: z.number().positive().optional(), // Fallback to process.env.HITL_TIMEOUT_MS || 900000
});

export const IncidentContextSchema = z.object({
  id: z.string().min(1, "Incident ID is required"),
  service: z.string().min(1, "Service name is required"),
  triggeredAt: z.string().datetime().optional(), // In ISO format
  status: z.string().optional(), // Current lifecycle state
});

export const ExecutionContextSchema = z.object({
  project: ProjectContextSchema,
  incident: IncidentContextSchema,
});
