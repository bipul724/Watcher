import { Queue } from 'bullmq';
import { config } from '../config/index.js';

export const QUEUE_NAME = 'incident-queue';

export const redisConnection = {
  host: config.REDIS_HOST,
  port: config.REDIS_PORT,
};

export const incidentQueue = new Queue(QUEUE_NAME, {
  connection: redisConnection,
});

export async function addIngestionJob(incidentId: string, payload: any) {
  return incidentQueue.add(
    'INCIDENT_INGESTION',
    { incidentId, payload },
    {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
    }
  );
}

export async function addFixJob(incidentId: string, approvalData: any) {
  return incidentQueue.add(
    'INCIDENT_FIX',
    { incidentId, approvalData },
    {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
    }
  );
}
