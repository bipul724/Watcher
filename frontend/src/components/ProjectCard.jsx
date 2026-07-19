import { useState } from 'react';
import { GitBranch, Edit, Trash2, Check, Copy, Play, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProjectCard({
  project,
  handleOpenEditModal,
  handleDeleteProject,
  handleCopyWebhook,
  copiedStates,
  handleTriggerTestIncident,
  API_BASE
}) {
  const [isFiring, setIsFiring] = useState(false);

  return (
    <div className="bg-canvas-white border border-ash rounded-cards p-4 sm:p-5 text-left transition-all duration-200 hover:border-cobalt-spark/30 min-w-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4 min-w-0">
        <div className="min-w-0">
          <h3 className="font-apk-galeria text-base font-semibold m-0 mb-1.5 text-carbon-ink break-words">{project.name}</h3>
          <div className="flex items-center gap-1.5 font-apk-galeria text-xs text-iron font-medium min-w-0 break-words">
            <GitBranch className="w-3.5 h-3.5 text-cobalt-spark stroke-[1.5px]" />
            <span className="break-all">{project.github_owner}/{project.github_repo}</span>
          </div>
        </div>
        <div className="flex gap-1 shrink-0 self-start">
          <button 
            type="button"
            className="bg-transparent border-none text-slate cursor-pointer p-1.5 rounded-full transition-all duration-150 hover:bg-mist hover:text-carbon-ink flex items-center justify-center" 
            title="Edit Credentials" 
            onClick={() => handleOpenEditModal(project)}
          >
            <Edit className="w-3.5 h-3.5 stroke-[1.5px]" />
          </button>
          <button 
            type="button"
            className="bg-transparent border-none text-slate cursor-pointer p-1.5 rounded-full transition-all duration-150 hover:bg-danger/10 hover:text-danger flex items-center justify-center" 
            title="Delete Project" 
            onClick={() => handleDeleteProject(project.id)}
          >
            <Trash2 className="w-3.5 h-3.5 stroke-[1.5px]" />
          </button>
        </div>
      </div>
      
      {/* Webhook Configuration panel - flat mock window appearance */}
      <div className="bg-mist border border-ash rounded-cards p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="font-apkpraktikal text-[9px] font-bold text-iron uppercase tracking-widest">Secure Ingest Webhook</span>
          
          {/* Pill Badge */}
          <span className="font-apkpraktikal text-[8px] font-bold bg-canvas-white text-cobalt-spark border border-ash rounded-full px-2 py-0.5 uppercase tracking-wider">
            Active
          </span>
        </div>
        <div className="flex items-center bg-canvas-white border border-ash rounded-lg px-3 py-2 justify-between gap-3 overflow-hidden min-w-0">
          <code className="font-mono text-xs text-cobalt-spark whitespace-nowrap overflow-x-auto text-left scrollbar-none flex-1">
            {`${API_BASE}/webhook/${project.webhook_secret}`}
          </code>
          <button 
            type="button"
            className="bg-transparent border-none text-slate cursor-pointer p-1.5 rounded-lg flex items-center justify-center transition-all duration-150 hover:text-carbon-ink hover:bg-mist shrink-0" 
            onClick={() => handleCopyWebhook(project.webhook_secret, project.id)}
            title="Copy URL"
          >
            {copiedStates[project.id] ? <Check className="w-4 h-4 text-success stroke-[2px]" /> : <Copy className="w-4 h-4 stroke-[1.5px]" />}
          </button>
        </div>
        <div className="mt-3">
          {/* Secondary Black CTA - Filled pill button, 9999px radius, carbon-ink background, canvas-white text */}
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            className="w-full flex items-center justify-center gap-1.5 bg-carbon-ink text-canvas-white border border-none rounded-full py-2.5 font-apkpraktikal text-[10px] font-bold uppercase tracking-widest cursor-pointer transition-all duration-150 disabled:opacity-60"
            onClick={async () => {
              setIsFiring(true);
              try {
                await handleTriggerTestIncident(project.webhook_secret, project.name);
              } finally {
                setIsFiring(false);
              }
            }}
            disabled={isFiring}
          >
            {isFiring ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-lime-glow" />
                <span>Firing Test Alert...</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-current text-lime-glow stroke-none" />
                <span>Fire Test Alert (BullMQ)</span>
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
