// nodes/node-05-narrator/memory-updater.js
// Guardian Node 05 — Pinecone RAG Memory Updater
// Feeds successful fixes back into Pinecone for future retrieval

import { Pinecone } from '@pinecone-database/pinecone';
import dotenv from 'dotenv';
import { getEmbedding } from '../shared/ai.js';
import { normalizeErrorSignature } from '../shared/normalize.js';
import { categorizeError } from '../shared/categorize.js';

dotenv.config();

const INDEX_NAME = process.env.PINECONE_INDEX_NAME || 'watcher-knowledge';

/**
 * Pinecone metadata values must be string | number | boolean | string[].
 * This helper converts null/undefined to '' so upsert never fails.
 */
function meta(value, fallback = '') {
  if (value === null || value === undefined) return fallback;
  return value;
}

/**
 * Updates Pinecone RAG with the latest successful fix.
 */
export async function updateAgentMemory(incidentData, context) {
  const apiKey = context?.project?.pineconeApiKey || process.env.PINECONE_API_KEY;
  if (!apiKey) {
    console.warn('⚠️ No Pinecone API Key. Memory update skipped.');
    return { ...incidentData, memory_updated: false };
  }

  if (
    incidentData.runbooks?.[0]?.source === 'LOCAL_FALLBACK' ||
    incidentData.runbooks?.[0]?.source === 'LOCAL_RUNBOOK' ||
    incidentData.runbooks?.[0]?.source === 'CACHED_FALLBACK'
  ) {
    console.warn('⚠️ Skipping memory update — resolution came from fallback, not a real fix.');
    return { ...incidentData, memory_updated: false, skip_reason: 'FALLBACK_SOURCE' };
  }

  if (!incidentData.pr_url || incidentData.pr_status !== 'CREATED') {
    console.warn('⚠️ Skipping memory update — no verified PR was created.');
    return { ...incidentData, memory_updated: false, skip_reason: 'NO_VERIFIED_FIX' };
  }

  const incidentId = incidentData.incident_id || `INC-UNKNOWN-${Date.now()}`;
  const normalizedSignature = normalizeErrorSignature(
    incidentData.raw_error_message || incidentData.reasoning || 'Unknown error'
  );
  const fixSteps = incidentData.ai_fix_suggestion?.reasoning
    ? [incidentData.ai_fix_suggestion.reasoning]
    : [];

  const fixDiff     = meta(incidentData.ai_fix_suggestion?.diff);
  const fixFile     = meta(incidentData.ai_fix_suggestion?.file_path);
  const fixReason   = meta(incidentData.ai_fix_suggestion?.reasoning);
  const prUrl       = meta(incidentData.pr_url);
  const errCategory = meta(
    incidentData.error_category ||
    categorizeError(incidentData.raw_error_message, incidentData.error_type),
    'UNKNOWN'
  );

  const chunks = [
    {
      id: `${incidentId}::error_signature`,
      embedText: `[Service: ${meta(incidentData.service, 'unknown')}] [Category: ${errCategory}] ERROR ${incidentData.error_type || 'runtime'}: ${normalizedSignature}`,
      metadata: {
        chunk_type: 'error_signature',
        incident_id: incidentId,
        service: meta(incidentData.service, 'unknown'),
        normalized_signature: normalizedSignature,
        raw_error: meta(incidentData.reasoning),
        priority: meta(incidentData.severity, 'unknown'),
        error_category: errCategory,
        title: `Error: ${normalizedSignature.slice(0, 80)}`,
        steps: JSON.stringify(fixSteps),
        // Store fix details here so RAG recall can surface them directly
        fix_diff: fixDiff,
        fix_file: fixFile,
        fix_reasoning: fixReason,
        pr_url: prUrl,
        source: 'HISTORICAL_FIX',
        created_at: new Date().toISOString()
      }
    },
    {
      id: `${incidentId}::root_cause`,
      embedText: `ROOT CAUSE in ${incidentData.service || 'unknown'}: ${fixReason}`,
      metadata: {
        chunk_type: 'root_cause',
        incident_id: incidentId,
        service: meta(incidentData.service, 'unknown'),
        root_cause: fixReason,
        title: `Root cause: ${incidentId}`,
        steps: JSON.stringify(fixSteps),
        source: 'HISTORICAL_FIX',
        created_at: new Date().toISOString()
      }
    },
    {
      id: `${incidentId}::fix`,
      embedText: `FIX for ${incidentData.error_type || 'error'} in ${incidentData.service || 'unknown'}: ${fixReason}`,
      metadata: {
        chunk_type: 'fix',
        incident_id: incidentId,
        service: meta(incidentData.service, 'unknown'),
        error_category: errCategory,
        fix_diff: fixDiff,
        fix_file: fixFile,
        fix_reasoning: fixReason,
        pr_url: prUrl,
        title: `Fix: ${incidentId}`,
        steps: JSON.stringify(fixSteps),
        source: 'HISTORICAL_FIX',
        created_at: new Date().toISOString()
      }
    },
    {
      id: `${incidentId}::symptom`,
      embedText: `SYMPTOM ${incidentData.service || 'unknown'} ${incidentData.severity || 'unknown'}: ${meta(incidentData.reasoning)}`,
      metadata: {
        chunk_type: 'symptom',
        incident_id: incidentId,
        service: meta(incidentData.service, 'unknown'),
        title: `Symptom: ${incidentId}`,
        steps: JSON.stringify(fixSteps),
        source: 'HISTORICAL_FIX',
        created_at: new Date().toISOString()
      }
    }
  ];

  try {
    const pinecone = new Pinecone({ apiKey });

    const namespace = context?.project?.pineconeNamespace || (context?.project?.id ? `project_${context.project.id}` : undefined);
    const index = pinecone.index(INDEX_NAME);
    const targetIndex = namespace ? index.namespace(namespace) : index;

    console.log(`🧠 Updating Pinecone Memory for ${incidentId} (Namespace: ${namespace || 'default'}) with ${chunks.length} chunks...`);

    if (!pinecone.inference) {
      throw new Error('Pinecone client not initialized with inference capabilities. Ensure you are using SDK v7+');
    }

    const embedTexts = chunks.map(c => c.embedText.slice(0, 8000));
    console.log(`🧠 Generating batch embeddings for ${chunks.length} text chunks...`);
    
    const response = await pinecone.inference.embed({
      model: 'multilingual-e5-large',
      inputs: embedTexts,
      parameters: { inputType: 'passage', truncate: 'END' }
    });

    if (!response || !response.data || response.data.length !== chunks.length) {
      throw new Error('Pinecone batch embedding returned invalid data: response length mismatch');
    }

    const records = chunks.map((chunk, index) => ({
      id: chunk.id,
      values: response.data[index].values,
      metadata: chunk.metadata
    }));

    await targetIndex.upsert({ records });
    const successCount = chunks.length;

    return {
      ...incidentData,
      incident_id: incidentId,
      memory_updated: true,
      chunks_stored: successCount,
      memory_indexed_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Memory Update Error:', error);
    return { ...incidentData, memory_updated: false, error: error.message };
  }
}
