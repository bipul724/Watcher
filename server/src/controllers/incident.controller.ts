import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import * as IncidentModel from '../models/incident.js';
import * as RunModel from '../models/run.js';

export async function list(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const { projectId } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    let incidents;
    if (projectId && typeof projectId === 'string') {
      incidents = await IncidentModel.listIncidents(projectId, userId);
    } else {
      incidents = await IncidentModel.listAllIncidentsForUser(userId);
    }

    return res.json({ incidents });
  } catch (error: any) {
    console.error('List incidents error:', error);
    return res.status(500).json({ error: 'Failed to retrieve incidents list' });
  }
}

export async function get(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const incident = await IncidentModel.getIncidentById(id, userId);
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    return res.json({ incident });
  } catch (error: any) {
    console.error('Get incident error:', error);
    return res.status(500).json({ error: 'Failed to retrieve incident details' });
  }
}

export async function getRuns(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Verify incident belongs to user
    const incident = await IncidentModel.getIncidentById(id, userId);
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    const runs = await RunModel.listRunsForIncident(id);
    return res.json({ runs });
  } catch (error: any) {
    console.error('Get runs error:', error);
    return res.status(500).json({ error: 'Failed to retrieve runs history' });
  }
}
