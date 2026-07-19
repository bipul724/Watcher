import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load .env searching upwards from current working directory
const loadEnv = () => {
  let currentDir = process.cwd();
  for (let i = 0; i < 4; i++) {
    const envPath = path.join(currentDir, '.env');
    if (fs.existsSync(envPath)) {
      dotenv.config({ path: envPath });
      break;
    }
    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) break;
    currentDir = parentDir;
  }
};
loadEnv();

import { Worker } from 'bullmq';
import { processQueueJob } from './processor.js';
// @ts-ignore
import { loginBot } from '../../watcherai/nodes/node-03-hitl/discord-bot.js';

console.log('🚀 Watcher Queue Worker starting...');

// Initialize Discord bot connection for sending approval cards
try {
  await loginBot();
} catch (error) {
  console.error('⚠️ Discord bot initialization failed in worker:', error);
}

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);

const worker = new Worker(
  'incident-queue',
  async (job) => {
    console.log(`[Worker] Received Job ${job.id} (Name: ${job.name})`);
    const result = await processQueueJob(job.name, job.data);
    return result;
  },
  {
    connection: {
      host: REDIS_HOST,
      port: REDIS_PORT,
    },
  }
);

worker.on('completed', (job) => {
  console.log(`[Worker] Job ${job.id} (${job.name}) finished successfully`);
});

worker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job?.id} (${job?.name}) failed:`, err);
});
