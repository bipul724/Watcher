// watcher/app/actions/runAgent.ts
"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { spawnAgent } from "@/lib/spawnagent.server";
import { prepareAgentEnv } from "@/lib/prepareEnv.server";
import { getDecryptedEnvVars } from "./envActions";

export async function runAgent(formData: FormData) {
  const prompt = formData.get("prompt");

  if (!prompt || typeof prompt !== "string") {
    throw new Error("Prompt required");
  }

  // 🔥 Fake response for demo
  return {
    jobId: crypto.randomUUID(),
    status: "started",
    result: `Demo: Processed "${prompt}"`,
  };
}