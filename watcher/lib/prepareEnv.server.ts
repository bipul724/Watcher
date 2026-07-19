import "server-only";

const REQUIRED_USER_KEYS = [
  "OPENROUTER_API_KEY",
  "PINECONE_API_KEY",
  "DISCORD_BOT_TOKEN",
  "GITHUB_TOKEN",
  "GITHUB_REPO_OWNER",
  "GITHUB_REPO_NAME",
  "DISCORD_INCIDENT_CHANNEL_ID",
];

function validateUserEnv(env: Record<string, string>) {
  for (const key of REQUIRED_USER_KEYS) {
    if (!env[key]) {
      throw new Error(`Missing required user env: ${key}`);
    }
  }
}

export function prepareAgentEnv({
  userEnv,
  prompt,
  jobId,
  userId,
}: {
  userEnv: Record<string, string>;
  prompt: string;
  jobId: string;
  userId: string;
}) {
  validateUserEnv(userEnv);

  return {
    // --- System defaults ---
    PORT: userEnv.PORT || process.env.PORT || "3000",
    INTERNAL_CALLBACK_SECRET: process.env.INTERNAL_CALLBACK_SECRET || "default_secret_change_me_in_prod",
    ORCHESTRATOR_URL:
      process.env.ORCHESTRATOR_URL || "http://watcher:3000",

    PIPELINE_TIMEOUT_MS:
      process.env.PIPELINE_TIMEOUT_MS || "90000",

    LLM_TIMEOUT_MS:
      process.env.LLM_TIMEOUT_MS || "30000",

    HITL_TIMEOUT_MS:
      process.env.HITL_TIMEOUT_MS || "900000",

    DEFAULT_LLM_MODEL:
      userEnv.DEFAULT_LLM_MODEL || process.env.DEFAULT_LLM_MODEL || "google/gemini-flash-1.5",

    PINECONE_INDEX_NAME:
      userEnv.PINECONE_INDEX_NAME || process.env.PINECONE_INDEX_NAME || "guardian-knowledge",

    DISCORD_INCIDENT_CHANNEL_ID:
      userEnv.DISCORD_INCIDENT_CHANNEL_ID || process.env.DISCORD_INCIDENT_CHANNEL_ID || "",

    // --- Runtime ---
    PROMPT: prompt,
    JOB_ID: jobId,
    USER_ID: userId,

    service: "demo-service",
  alert: "test-alert",
  triggered_at: new Date().toISOString(),

    // 🔥 USER KEYS (MAIN SOURCE)
    ...userEnv,
  };
}