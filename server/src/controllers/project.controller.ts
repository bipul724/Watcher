import { Response } from 'express';
import crypto from 'crypto';
import { AuthenticatedRequest } from '../middleware/auth.js';
import * as ProjectModel from '../models/project.js';
import { z } from 'zod';

export const CreateProjectSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Project name is required'),
    description: z.string().optional(),
    github_owner: z.string().min(1, 'GitHub owner is required'),
    github_repo: z.string().min(1, 'GitHub repo is required'),
    github_token: z.string().min(1, 'GitHub token is required'),
    discord_channel_id: z.string().min(1, 'Discord channel ID is required'),
    discord_bot_token: z.string().optional(),
    openrouter_key: z.string().optional().nullable(),
    pinecone_namespace: z.string().optional(),
    pinecone_api_key: z.string().optional(),
    llm_provider: z.string().optional(),
    llm_model: z.string().optional(),
  }),
});

export const UpdateProjectSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    github_owner: z.string().optional(),
    github_repo: z.string().optional(),
    github_token: z.string().optional(),
    discord_channel_id: z.string().optional(),
    discord_bot_token: z.string().optional(),
    openrouter_key: z.string().optional().nullable(),
    pinecone_namespace: z.string().optional(),
    pinecone_api_key: z.string().optional(),
    active: z.boolean().optional(),
    llm_provider: z.string().optional(),
    llm_model: z.string().optional(),
  }),
});

function maskProjectSecrets(project: any) {
  if (!project) return null;
  const copy = { ...project };
  if (copy.github_token) copy.github_token = '••••••••';
  if (copy.openrouter_key) copy.openrouter_key = '••••••••';
  if (copy.pinecone_api_key) copy.pinecone_api_key = '••••••••';
  if (copy.discord_bot_token) copy.discord_bot_token = '••••••••';
  return copy;
}

export async function create(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      name,
      description,
      github_owner,
      github_repo,
      github_token,
      discord_channel_id,
      discord_bot_token,
      openrouter_key,
      pinecone_api_key,
      llm_provider,
      llm_model,
    } = req.body;

    // Generate a unique project ID upfront to use for namespace isolation
    const projectId = crypto.randomUUID();
    // Generate a secure unique webhook secret for alert ingestion
    const webhook_secret = `wh_${crypto.randomBytes(24).toString('hex')}`;

    // Automatically generate a unique, clean pinecone namespace based on project name + ID for isolation
    const cleanProjectSlug = name.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'default';
    const pinecone_namespace = req.body.pinecone_namespace 
      ? `${req.body.pinecone_namespace.trim()}-${projectId}`
      : `watcher-${cleanProjectSlug}-${projectId}`;

    const project = await ProjectModel.createProject({
      id: projectId,
      user_id: userId,
      name,
      description,
      webhook_secret,
      github_owner,
      github_repo,
      github_token,
      discord_channel_id,
      discord_bot_token,
      openrouter_key,
      pinecone_namespace,
      pinecone_api_key,
      llm_provider,
      llm_model,
    });

    return res.status(201).json({
      message: 'Project created successfully',
      project: maskProjectSecrets(project),
    });
  } catch (error: any) {
    console.error('Create project error:', error);
    return res.status(500).json({ error: 'Failed to create project' });
  }
}

export async function list(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const projects = await ProjectModel.listProjects(userId);
    return res.json({ projects: projects.map(p => maskProjectSecrets(p)) });
  } catch (error: any) {
    console.error('List projects error:', error);
    return res.status(500).json({ error: 'Failed to list projects' });
  }
}

export async function get(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const project = await ProjectModel.getProjectById(id, userId);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    return res.json({ project: maskProjectSecrets(project) });
  } catch (error: any) {
    console.error('Get project error:', error);
    return res.status(500).json({ error: 'Failed to get project details' });
  }
}

export async function update(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const updateData = { ...req.body };
    const secretFields = ['github_token', 'discord_bot_token', 'openrouter_key', 'pinecone_api_key'];
    for (const field of secretFields) {
      if (updateData[field] === '••••••••') {
        delete updateData[field];
      }
    }

    if (updateData.pinecone_namespace) {
      // Suffix custom namespace with project ID to guarantee isolation
      updateData.pinecone_namespace = `${updateData.pinecone_namespace.trim()}-${id}`;
    }

    const updated = await ProjectModel.updateProject(id, userId, updateData);
    if (!updated) {
      return res.status(404).json({ error: 'Project not found or update failed' });
    }

    return res.json({
      message: 'Project updated successfully',
      project: maskProjectSecrets(updated),
    });
  } catch (error: any) {
    console.error('Update project error:', error);
    return res.status(500).json({ error: 'Failed to update project' });
  }
}

export async function remove(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const success = await ProjectModel.deleteProject(id, userId);
    if (!success) {
      return res.status(404).json({ error: 'Project not found' });
    }

    return res.json({ message: 'Project deleted successfully' });
  } catch (error: any) {
    console.error('Delete project error:', error);
    return res.status(500).json({ error: 'Failed to delete project' });
  }
}

export async function validateLLM(req: AuthenticatedRequest, res: Response) {
  try {
    const { llm_provider, llm_api_key } = req.body;
    
    let apiKey = llm_api_key;
    if (!apiKey) {
      if (llm_provider === 'OPENROUTER') {
        apiKey = process.env.OPENROUTER_API_KEY;
      } else if (llm_provider === 'OPENAI') {
        apiKey = process.env.OPENAI_API_KEY;
      } else if (llm_provider === 'ANTHROPIC') {
        apiKey = process.env.ANTHROPIC_API_KEY;
      } else if (llm_provider === 'GEMINI') {
        apiKey = process.env.GEMINI_API_KEY;
      }
    }

    if (!apiKey) {
      return res.status(400).json({ error: `API Key is missing for provider ${llm_provider} (no global fallback configured).` });
    }

    if (llm_provider === 'OPENROUTER') {
      const keyRes = await fetch('https://openrouter.ai/api/v1/auth/key', {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });

      if (!keyRes.ok) {
        const errorText = await keyRes.text();
        return res.status(keyRes.status).json({ error: `OpenRouter Key Validation Failed: ${errorText}` });
      }

      const keyData = (await keyRes.json()) as any;

      const modelsRes = await fetch('https://openrouter.ai/api/v1/models');
      if (!modelsRes.ok) {
        return res.status(modelsRes.status).json({ error: 'Failed to fetch OpenRouter models directory' });
      }
      const modelsData = (await modelsRes.json()) as any;

      return res.json({
        success: true,
        credits: {
          label: keyData.data?.label || 'OpenRouter Key',
          limit_remaining: keyData.data?.limit_remaining !== undefined ? keyData.data.limit_remaining : null,
          usage: keyData.data?.usage !== undefined ? keyData.data.usage : 0,
          is_active: keyData.data?.is_active ?? true
        },
        models: modelsData.data?.map((m: any) => ({ id: m.id, name: m.name })) || []
      });
    }

    if (llm_provider === 'OPENAI') {
      const modelsRes = await fetch('https://api.openai.com/v1/models', {
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });
      if (!modelsRes.ok) {
        const errorText = await modelsRes.text();
        return res.status(modelsRes.status).json({ error: `OpenAI Validation Failed: ${errorText}` });
      }
      const modelsData = (await modelsRes.json()) as any;
      const models = modelsData.data
        ?.filter((m: any) => m.id.startsWith('gpt-') || m.id.startsWith('o1-') || m.id.startsWith('o3-'))
        .map((m: any) => ({ id: m.id, name: m.id })) || [];
      return res.json({ success: true, credits: { label: 'OpenAI Direct Key', is_active: true }, models });
    }

    if (llm_provider === 'ANTHROPIC') {
      const modelsRes = await fetch('https://api.anthropic.com/v1/models', {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        }
      });
      if (!modelsRes.ok) {
        const errorText = await modelsRes.text();
        return res.status(modelsRes.status).json({ error: `Anthropic Validation Failed: ${errorText}` });
      }
      const modelsData = (await modelsRes.json()) as any;
      const models = modelsData.data?.map((m: any) => ({ id: m.id, name: m.display_name || m.id })) || [];
      return res.json({ success: true, credits: { label: 'Anthropic Direct Key', is_active: true }, models });
    }

    if (llm_provider === 'GEMINI') {
      const modelsRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
      if (!modelsRes.ok) {
        const errorText = await modelsRes.text();
        return res.status(modelsRes.status).json({ error: `Gemini Validation Failed: ${errorText}` });
      }
      const modelsData = (await modelsRes.json()) as any;
      const models = modelsData.models
        ?.filter((m: any) => m.supportedGenerationMethods?.includes('generateContent'))
        .map((m: any) => {
          const shortId = m.name?.replace('models/', '') || m.name;
          return { id: shortId, name: m.displayName || shortId };
        }) || [];
      return res.json({ success: true, credits: { label: 'Gemini Direct Key', is_active: true }, models });
    }

    return res.status(400).json({ error: 'Unsupported LLM provider' });
  } catch (err: any) {
    console.error('Validate LLM error:', err);
    return res.status(500).json({ error: `System error during LLM validation: ${err.message}` });
  }
}

