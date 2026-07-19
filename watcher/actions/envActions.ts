'use server';

import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth'; // adjust to your auth import
import { headers } from 'next/headers';

const ENCRYPTION_KEY = process.env.MASTER_ENCRYPTION_KEY!;
const algorithm = 'aes-256-gcm';

function encrypt(text: string) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    algorithm,
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    iv
  );
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();
  return {
    iv: iv.toString('hex'),
    encryptedData: encrypted,
    authTag: authTag.toString('hex'),
  };
}

function decrypt(encrypted: { iv: string; encryptedData: string; authTag: string }) {
  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(ENCRYPTION_KEY, 'hex'),
    Buffer.from(encrypted.iv, 'hex')
  );
  decipher.setAuthTag(Buffer.from(encrypted.authTag, 'hex'));
  let decrypted = decipher.update(encrypted.encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

function encryptField(value: string | undefined) {
  if (!value) return null;
  return JSON.stringify(encrypt(value));
}

export async function saveInstanceConfig(data: {
  instanceName: string;
  port?: string;
  openrouterApiKey: string;
  defaultLlmModel: string;
  pineconeApiKey: string;
  pineconeIndexName: string;
  discordBotToken: string;
  discordChannelId: string;
  githubToken: string;
  githubRepoOwner: string;
  githubRepoName: string;
  prompt: string;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error('Unauthorized');

  const instance = await prisma.instance.create({
    data: {
      name: data.instanceName,
      userId: session.user.id,
      config: {
        create: {
          // Server
          port: data.port ? parseInt(data.port) : 3000,

          // OpenRouter (encrypted)
          openrouterApiKey:  encryptField(data.openrouterApiKey),
          defaultLlmModel:   data.defaultLlmModel,

          // Pinecone (encrypted)
          pineconeApiKey:    encryptField(data.pineconeApiKey),
          pineconeIndexName: data.pineconeIndexName,

          // Discord (encrypted)
          discordBotToken:          encryptField(data.discordBotToken),
          discordIncidentChannelId: data.discordChannelId,

          // GitHub (encrypted)
          githubToken:     encryptField(data.githubToken),
          githubRepoOwner: data.githubRepoOwner,
          githubRepoName:  data.githubRepoName,

          // Custom Prompt
          prompt:          data.prompt,
        },
      },
    },
  });

  return {
    success: true,
    message: 'Configuration saved successfully!',
    instanceId: instance.id,
  };
}

export async function getDecryptedEnvVars(instanceId: string) {
  const config = await prisma.instanceConfig.findUnique({
    where: { instanceId },
  });

  if (!config) throw new Error('Instance config not found');

  const decryptField = (val: string | null) =>
    val ? decrypt(JSON.parse(val)) : null;

  return {
    PORT:                        config.port?.toString(),
    OPENROUTER_API_KEY:          decryptField(config.openrouterApiKey),
    DEFAULT_LLM_MODEL:           config.defaultLlmModel,
    PINECONE_API_KEY:            decryptField(config.pineconeApiKey),
    PINECONE_INDEX_NAME:         config.pineconeIndexName,
    DISCORD_BOT_TOKEN:           decryptField(config.discordBotToken),
    DISCORD_INCIDENT_CHANNEL_ID: config.discordIncidentChannelId,
    GITHUB_TOKEN:                decryptField(config.githubToken),
    GITHUB_REPO_OWNER:           config.githubRepoOwner,
    GITHUB_REPO_NAME:            config.githubRepoName,
    PROMPT:                      config.prompt,
  };
}