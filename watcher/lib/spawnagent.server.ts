import "server-only";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

type SpawnAgentInput = {
  env: Record<string, string>;
  jobId: string;
  userId: string;
};

export async function spawnAgent({ env }: SpawnAgentInput): Promise<{ containerId: string }> {
  console.log("SPAWN START");
    const { stdout } = await execFileAsync("node", [
    "scripts/spawn-agent.js",
    JSON.stringify(env),
  ]);

  const match = stdout.match(/Started:\s*(.+)/);
  const containerId = match?.[1]?.trim();

  if (!containerId) {
    throw new Error("spawn-agent.js did not return a container id");
  }

  return { containerId };
}