import { Request, Response } from 'express';
import { getIncidentWithProject, updateIncident } from '../models/incident.js';
import { addFixJob } from '../queue/index.js';
import { config } from '../config/index.js';
import { decrypt } from '../utils/crypto.js';
import jwt from 'jsonwebtoken';

async function updateDiscordStatus(incident: any, project: any, action: 'APPROVE' | 'REJECT', source: 'Web' | 'Discord', approver: string) {
  try {
    const messageId = incident.discord_message_id;
    const channelId = project.discord_channel_id;
    const rawToken = project.discord_bot_token;
    const botToken = (rawToken ? decrypt(rawToken) : null) || process.env.DISCORD_BOT_TOKEN;

    if (!botToken || !channelId || !messageId) {
      console.log('ℹ️ Discord message update skipped: token, channelId or messageId is missing.');
      return;
    }

    const embed = {
      color: action === 'APPROVE' ? 0x00c853 : 0x5c5c5c,
      title: action === 'APPROVE' ? `✅ Fix Approved: inc-${incident.id}` : `🗑️ Incident Ignored: inc-${incident.id}`,
      description: action === 'APPROVE'
        ? `Approved by **${approver}** via **${source}**. Deploying automated PR...`
        : `Dismissed by **${approver}** via **${source}**. No action will be taken.`,
      timestamp: new Date().toISOString(),
    };

    // Update original alert message to remove buttons and show status
    const url = `https://discord.com/api/v10/channels/${channelId}/messages/${messageId}`;
    const patchRes = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bot ${botToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        embeds: [embed],
        components: [], // Remove buttons
      }),
    });

    if (!patchRes.ok) {
      const errText = await patchRes.text();
      console.error(`❌ Discord API message patch failed: Status ${patchRes.status} - ${errText}`);
    }

    // Try to notify the thread as well
    const triage = typeof incident.triage === 'string' ? JSON.parse(incident.triage) : incident.triage;
    const threadId = triage?.hitl?.discord_thread_id || triage?.discord_thread_id;
    if (threadId) {
      const threadUrl = `https://discord.com/api/v10/channels/${threadId}/messages`;
      const threadMsg = action === 'APPROVE'
        ? `✅ Fix approved by **${approver}** via **${source}**. PR pipeline running...`
        : `🗑️ Incident dismissed by **${approver}** via **${source}**. Archived with no action.`;
      
      const threadRes = await fetch(threadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bot ${botToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: threadMsg,
        }),
      });

      if (threadRes.ok && action === 'REJECT') {
        // Try to archive thread
        const threadChannelUrl = `https://discord.com/api/v10/channels/${threadId}`;
        await fetch(threadChannelUrl, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bot ${botToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            archived: true,
          }),
        }).catch(() => {});
      }
    }
  } catch (err: any) {
    console.error('❌ Failed to update Discord status from orchestrator callback:', err.message || err);
  }
}

export async function handleApproval(req: Request, res: Response) {
  try {
    const { incidentId, action, comment } = req.body;
    
    if (!incidentId || !action) {
      return res.status(400).json({ error: 'incidentId and action are required' });
    }

    // 1. Authorize: Check if INTERNAL_CALLBACK_SECRET is sent in headers OR if JWT is valid
    let authorized = false;
    const authHeader = req.headers['authorization'];
    const clientSecret = req.headers['x-callback-secret'];

    if (clientSecret === config.INTERNAL_CALLBACK_SECRET) {
      authorized = true;
    } else if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        jwt.verify(token, config.JWT_SECRET);
        authorized = true;
      } catch (jwtErr) {
        return res.status(403).json({ error: 'Invalid or expired auth credentials' });
      }
    }

    if (!authorized) {
      return res.status(401).json({ error: 'Unauthorized callback endpoint' });
    }

    // 2. Fetch the incident and its project configuration
    const incidentWithProject = await getIncidentWithProject(incidentId);
    if (!incidentWithProject) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    const { status, triage, runbook } = incidentWithProject;

    if (action === 'APPROVE') {
      if (status !== 'AWAITING_APPROVAL' && status !== 'TRIGGERED' && status !== 'TRIAGED') {
        return res.status(400).json({
          error: `Incident cannot be approved from current state: ${status}`,
        });
      }

      // Update incident state to FIXING
      await updateIncident(incidentId, {
        status: 'FIXING',
        updated_at: new Date(),
      });

      // Prepare payload parameter matching runPhase2 input (Phase 1 output)
      const phase1Output = {
        incident_id: incidentId,
        service: (incidentWithProject.raw_payload as any)?.service || incidentWithProject.project.name || 'unknown-service',
        severity: incidentWithProject.severity,
        // Include any details parsed from triage/runbook fields
        raw_error_message: triage?.raw_error_message || triage?.error || incidentWithProject.error_signature,
        normalized_error_signature: triage?.normalized_error_signature || incidentWithProject.error_signature,
        root_frame: triage?.root_frame || undefined,
        affected_files: triage?.affected_files || runbook?.affected_files || [],
        error_type: triage?.error_type || undefined,
        error_category: incidentWithProject.category,
        confidence: triage?.confidence || 100,
        reasoning: triage?.reasoning || 'Approved manually',
        isCriticalService: triage?.isCriticalService || false,
        criticalMultiplierApplied: triage?.criticalMultiplierApplied || false,
        alert_raw: incidentWithProject.raw_payload,
        runbooks: (() => {
          try {
            return typeof runbook === 'string' ? JSON.parse(runbook) : (runbook || []);
          } catch {
            return [];
          }
        })(),
        triggered_at: incidentWithProject.created_at.toISOString(),
        triage_completed_at: new Date().toISOString(),
      };

      // Enqueue job to perform Phase 2 fix (GitHub War Room PR -> Learning update)
      await addFixJob(incidentId, phase1Output);

      // Update original Discord card to show "Approved" and remove buttons
      const source = clientSecret === config.INTERNAL_CALLBACK_SECRET ? 'Discord' : 'Web';
      const approverName = comment?.match(/Approved by Discord user (.*)/)?.[1] 
        || comment?.match(/Approved by (.*)/)?.[1]
        || (source === 'Web' ? 'Operator' : 'Discord User');

      await updateDiscordStatus(incidentWithProject, incidentWithProject.project, 'APPROVE', source, approverName);

      return res.json({
        message: 'Incident approved. Remediation queued.',
        status: 'FIXING',
      });
    } 
    
    if (action === 'REJECT') {
      await updateIncident(incidentId, {
        status: 'MUTED',
        root_cause: comment || 'Rejected by operator',
        updated_at: new Date(),
      });

      // Update original Discord card to show "Rejected" and remove buttons
      const source = clientSecret === config.INTERNAL_CALLBACK_SECRET ? 'Discord' : 'Web';
      const approverName = comment?.match(/Rejected by Discord user (.*)/)?.[1]
        || comment?.match(/Rejected by (.*)/)?.[1]
        || (source === 'Web' ? 'Operator' : 'Discord User');

      await updateDiscordStatus(incidentWithProject, incidentWithProject.project, 'REJECT', source, approverName);

      return res.json({
        message: 'Incident muted and rejected.',
        status: 'MUTED',
      });
    }

    return res.status(400).json({ error: 'Unsupported approval action value' });
  } catch (error: any) {
    console.error('Approval callback error:', error);
    return res.status(500).json({ error: 'Failed to process incident approval request' });
  }
}
