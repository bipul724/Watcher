import { useState } from 'react';
import { GitBranch, ExternalLink, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

export default function IncidentDetailsDrawer({
  selectedIncident,
  setSelectedIncident,
  getSeverityBadgeClass,
  token,
  onActionSuccess
}) {
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  const handleAction = async (action) => {
    setActionLoading(true);
    setActionError('');
    try {
      const res = await fetch(`${API_BASE}/callback/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          incidentId: selectedIncident.id,
          action,
          comment: `Manually ${action.toLowerCase()}d via Web Dashboard.`
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSelectedIncident(null);
        if (onActionSuccess) onActionSuccess();
      } else {
        setActionError(data.error || `Failed to ${action.toLowerCase()} incident.`);
      }
    } catch {
      setActionError('Network connection failure.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex justify-end overflow-hidden">
          {/* Backdrop fade */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-carbon-ink/15 backdrop-blur-xs" 
            onClick={() => setSelectedIncident(null)}
          ></motion.div>
          
          {/* Slide-in drawer container - flat canvas, 1px border, no drop shadow */}
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 220, damping: 24 }}
            className="relative w-full sm:max-w-[520px] h-full max-h-[100dvh] bg-canvas-white border-l border-ash flex flex-col overflow-hidden text-left min-w-0"
          >
            {/* Header strip */}
            <div className="px-5 sm:px-8 py-5 sm:py-6 border-b border-ash flex justify-between items-center gap-3 bg-canvas-white shrink-0 min-w-0">
              <div className="flex items-center gap-3 min-w-0">
                <span className={`font-apkpraktikal text-[8px] font-bold rounded-full px-2 py-0.5 tracking-wider uppercase ${getSeverityBadgeClass(selectedIncident.severity)}`}>
                  {selectedIncident.severity}
                </span>
                <h2 className="font-apk-galeria text-base sm:text-lg font-medium m-0 text-carbon-ink break-words min-w-0">
                  Incident: {selectedIncident.id.slice(0, 8)}...
                </h2>
              </div>
              <button 
                type="button"
                className="bg-transparent border border-ash text-slate hover:text-carbon-ink w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-colors" 
                onClick={() => setSelectedIncident(null)}
              >
                &times;
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto overflow-x-hidden px-5 sm:px-8 py-5 sm:py-6 flex flex-col gap-6 text-left min-h-0 min-w-0">
              
              {/* Pipeline Visual Progress */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cobalt-spark"></span>
                  <span className="font-apkpraktikal text-[9px] font-bold uppercase text-iron tracking-widest">Pipeline Visual Progress</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-1 bg-mist border border-ash px-4 py-4 sm:py-5 rounded-cards relative overflow-hidden sm:overflow-x-auto">
                  {/* Connector line */}
                  <div className="absolute top-[28px] left-[10%] right-[10%] h-[1px] bg-slate/20 z-[1] hidden sm:block"></div>
                  
                  {[
                    { num: 1, label: 'Triage', getState: () => selectedIncident.status === 'CLOSED_AND_LEARNED' ? 'completed' : (selectedIncident.status === 'TRIGGERED' || selectedIncident.status === 'QUEUED') ? 'active' : 'completed' },
                    { num: 2, label: 'Approval', getState: () => selectedIncident.status === 'CLOSED_AND_LEARNED' ? 'completed' : (selectedIncident.status === 'TRIGGERED' || selectedIncident.status === 'QUEUED') ? 'inactive' : selectedIncident.status === 'AWAITING_APPROVAL' ? 'active' : 'completed' },
                    { num: 3, label: 'Fixer', getState: () => selectedIncident.status === 'CLOSED_AND_LEARNED' ? 'completed' : (selectedIncident.status === 'TRIGGERED' || selectedIncident.status === 'QUEUED' || selectedIncident.status === 'AWAITING_APPROVAL') ? 'inactive' : selectedIncident.status === 'FIXING' ? 'active' : 'completed' },
                    { num: 4, label: 'Memory', getState: () => selectedIncident.status === 'CLOSED_AND_LEARNED' ? 'completed' : 'inactive' }
                  ].map(step => {
                    const state = step.getState();
                    const dotClass = state === 'completed' 
                      ? 'bg-success/15 border-success text-success' 
                      : state === 'active' 
                      ? 'bg-cobalt-spark/15 border-cobalt-spark text-cobalt-spark animate-pulse' 
                      : 'bg-canvas-white border-ash text-slate';
                    const labelClass = state === 'completed' ? 'text-carbon-ink font-semibold' : state === 'active' ? 'text-cobalt-spark font-semibold' : 'text-slate';
                    return (
                      <div key={step.num} className="flex flex-col items-center flex-1 relative z-10 min-w-[56px] sm:min-w-[70px]">
                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-apkpraktikal font-bold transition-all duration-300 ${dotClass}`}>
                          {step.num}
                        </div>
                        <div className={`font-apkpraktikal text-[8px] tracking-wider uppercase mt-2 text-center ${labelClass}`}>{step.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Incident Metadata Details */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cobalt-spark"></span>
                  <span className="font-apkpraktikal text-[9px] font-bold uppercase text-iron tracking-widest">Incident Execution Metadata</span>
                </div>
                <div className="bg-mist border border-ash px-4 py-4 rounded-cards grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="flex flex-col gap-1">
                    <span className="font-apkpraktikal text-[8px] font-bold uppercase text-slate tracking-widest">Remediation Status</span>
                    <span className="font-apk-galeria text-carbon-ink font-medium">{selectedIncident.status}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-apkpraktikal text-[8px] font-bold uppercase text-slate tracking-widest">LLM Model Target</span>
                    <span className="font-apk-galeria text-carbon-ink font-medium">Gemini 2.5 Flash</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-apkpraktikal text-[8px] font-bold uppercase text-slate tracking-widest">Error Category</span>
                    <span className="font-apk-galeria text-carbon-ink font-medium">{selectedIncident.category || 'PENDING'}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-apkpraktikal text-[8px] font-bold uppercase text-slate tracking-widest">Ingested At</span>
                    <span className="font-apk-galeria text-carbon-ink font-medium">{new Date(selectedIncident.created_at).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>

              {/* Manual Gatekeeper Controls */}
              {['TRIGGERED', 'TRIAGED', 'AWAITING_APPROVAL'].includes(selectedIncident.status) && (
                <div className="flex flex-col gap-2 bg-ice-blue border border-ash/40 rounded-cards p-5 mt-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cobalt-spark"></span>
                    <span className="font-apkpraktikal text-[9px] font-bold uppercase text-cobalt-spark tracking-widest">Manual Gatekeeper Controls</span>
                  </div>
                  <p className="font-apk-galeria text-xs text-iron m-0 mt-1 leading-relaxed">
                    Take immediate action to approve the patch pipeline or dismiss this incident directly from the web console.
                  </p>
                  {actionError && (
                    <div className="font-apk-galeria text-xs text-danger font-semibold mt-2">
                      ❌ {actionError}
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row gap-3 mt-4">
                    {/* Primary Lime Glow CTA for approving pipeline code patch */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => handleAction('APPROVE')}
                      disabled={actionLoading}
                      className="flex-1 bg-lime-glow text-carbon-ink border border-iron/10 rounded-full py-2.5 font-apkpraktikal text-xs font-bold uppercase tracking-widest cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1.5"
                    >
                      {actionLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-carbon-ink" />
                          <span>Processing...</span>
                        </>
                      ) : 'Approve & Patch'}
                    </motion.button>
                    
                    {/* Secondary Dismiss Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => handleAction('REJECT')}
                      disabled={actionLoading}
                      className="bg-transparent hover:bg-danger/10 text-danger border border-danger/30 rounded-full px-5 py-2.5 font-apkpraktikal text-xs font-bold uppercase tracking-widest cursor-pointer disabled:opacity-60"
                    >
                      Dismiss
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Normalized Error Signature */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cobalt-spark"></span>
                  <span className="font-apkpraktikal text-[9px] font-bold uppercase text-iron tracking-widest">Normalized Error Signature</span>
                </div>
                <pre className="bg-mist border border-ash rounded-cards p-4 font-mono text-xs text-danger m-0 whitespace-pre-wrap break-all scrollbar-none min-w-0">
                  {selectedIncident.error_signature}
                </pre>
              </div>

              {/* Incident Remediation Timeline */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cobalt-spark"></span>
                  <span className="font-apkpraktikal text-[9px] font-bold uppercase text-iron tracking-widest">Incident Remediation Timeline</span>
                </div>
                <div className="flex flex-col gap-5 relative pl-5 border-l border-ash ml-2.5 py-1">
                  {/* Timeline nodes */}
                  {[
                    { time: selectedIncident.created_at, label: 'Alert Ingested & Triaged', desc: `Ingested ${selectedIncident.category || ''} payload.` },
                    selectedIncident.discord_message_id && { time: selectedIncident.updated_at, label: 'Discord Approval Card Sent', desc: `Interactive thread initiated in Discord.` },
                    selectedIncident.pr_url && { time: selectedIncident.updated_at, label: 'Agent Workspace PR Drafted', desc: 'Code patched, tests verified in isolation.' },
                    selectedIncident.status === 'CLOSED_AND_LEARNED' && { time: selectedIncident.updated_at, label: 'Resolution learned', desc: 'Markdown postmortem injected to Pinecone.' }
                  ].filter(Boolean).map((node, index) => (
                    <div key={index} className="relative text-xs">
                      {/* Wayfinding timeline dot */}
                      <span className="absolute -left-[27.5px] top-[3.5px] w-2 h-2 rounded-full bg-cobalt-spark border border-canvas-white"></span>
                      <div className="font-apk-galeria font-medium text-carbon-ink text-sm">{node.label}</div>
                      <div className="font-apk-galeria text-xs text-iron mt-0.5 leading-relaxed">{node.desc}</div>
                      <div className="font-apkpraktikal text-[9px] tracking-wider text-slate uppercase mt-1">{new Date(node.time).toLocaleTimeString()}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Remediation PR Link */}
              {selectedIncident.pr_url && (
                <div className="flex flex-col gap-2 mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cobalt-spark"></span>
                    <span className="font-apkpraktikal text-[9px] font-bold uppercase text-iron tracking-widest">Remediation PR Target</span>
                  </div>
                  
                  {/* Styled as a ghost text link with a signature ↗ arrow */}
                  <a 
                    href={selectedIncident.pr_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-carbon-ink text-canvas-white border border-none rounded-full p-3 font-apkpraktikal text-xs font-bold uppercase tracking-widest no-underline transition-opacity duration-150 hover:opacity-95 cursor-pointer"
                  >
                    <GitBranch className="w-4 h-4 text-lime-glow stroke-[1.5px]" /> View Opened Pull Request <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
