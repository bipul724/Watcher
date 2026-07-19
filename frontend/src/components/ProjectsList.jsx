import { Cpu } from 'lucide-react';
import { motion } from 'framer-motion';
import ProjectCard from './ProjectCard';

export default function ProjectsList({
  projects,
  loadingProjects,
  handleOpenCreateModal,
  handleOpenEditModal,
  handleDeleteProject,
  handleCopyWebhook,
  copiedStates,
  handleTriggerTestIncident,
  API_BASE,
  projectPage,
  setProjectPage,
  PROJECTS_PER_PAGE
}) {
  // Paginated Projects
  const totalProjectPages = Math.ceil(projects.length / PROJECTS_PER_PAGE) || 1;
  const clampedProjectPage = Math.min(projectPage, totalProjectPages);
  const currentProjects = projects.slice((clampedProjectPage - 1) * PROJECTS_PER_PAGE, clampedProjectPage * PROJECTS_PER_PAGE);

  return (
    <div className="col-span-1 lg:col-span-7 bg-canvas-white border border-ash rounded-xl flex flex-col overflow-hidden min-h-[420px] lg:h-[680px] min-w-0">
      <div className="px-4 sm:px-6 py-4 sm:py-[18px] border-b border-ash text-left bg-canvas-white flex justify-between items-center shrink-0 min-w-0">
        <h2 className="font-apk-galeria text-base font-medium m-0 text-carbon-ink">Configured Webhooks & Repositories</h2>
      </div>
      
      {/* Background reloading indicator bar */}
      {loadingProjects && projects.length > 0 ? (
        <div className="h-[2px] w-full bg-cobalt-spark/10 overflow-hidden relative shrink-0">
          <div className="h-full bg-cobalt-spark absolute rounded-full animate-loading-slide"></div>
        </div>
      ) : (
        <div className="h-[2px] w-full bg-transparent shrink-0"></div>
      )}
      
      {loadingProjects && projects.length === 0 ? (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4 min-h-0">
          <div className="h-[140px] animate-skeleton rounded-cards shrink-0" />
          <div className="h-[140px] animate-skeleton rounded-cards shrink-0" style={{ animationDelay: '0.2s' }} />
        </div>
      ) : projects.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 text-center min-h-0">
          <div className="w-16 h-16 mb-6 rounded-full bg-mist flex items-center justify-center text-slate border border-ash shrink-0">
            <Cpu className="w-6 h-6 stroke-[1.5px]" />
          </div>
          <h3 className="font-apk-galeria text-lg text-carbon-ink mb-2">No configured projects</h3>
          <p className="font-apk-galeria text-xs text-iron leading-relaxed max-w-sm mb-6">Connect your GitHub, GitLab, or custom webhook endpoints to start monitoring infrastructure events.</p>
          
          {/* Lime Glow conversion button for onboarding a new project */}
          <motion.button 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            className="px-6 py-2.5 bg-lime-glow text-carbon-ink border border-iron/10 font-apkpraktikal font-bold text-xs uppercase tracking-widest rounded-full cursor-pointer transition-all duration-150"
            onClick={handleOpenCreateModal}
          >
            Onboard Project
          </motion.button>
        </div>
      ) : (
        <>
          <div className={`flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col gap-4 min-h-0 transition-opacity duration-200 ${loadingProjects ? 'opacity-60 pointer-events-none' : ''}`}>
            {currentProjects.map(project => (
              <ProjectCard 
                key={project.id}
                project={project}
                handleOpenEditModal={handleOpenEditModal}
                handleDeleteProject={handleDeleteProject}
                handleCopyWebhook={handleCopyWebhook}
                copiedStates={copiedStates}
                handleTriggerTestIncident={handleTriggerTestIncident}
                API_BASE={API_BASE}
              />
            ))}
          </div>
          {totalProjectPages > 1 && (
            <div className="px-4 sm:px-6 py-4 border-t border-ash flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center bg-canvas-white shrink-0 select-none rounded-b-xl">
              <span className="font-apk-galeria text-xs text-iron">
                Showing <strong className="text-carbon-ink">{(clampedProjectPage - 1) * PROJECTS_PER_PAGE + 1}-{Math.min(clampedProjectPage * PROJECTS_PER_PAGE, projects.length)}</strong> of <strong className="text-carbon-ink">{projects.length}</strong>
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setProjectPage(p => Math.max(1, p - 1))}
                  disabled={clampedProjectPage === 1}
                  className="px-4 py-1.5 border border-ash rounded-full text-xs font-apkpraktikal uppercase tracking-wider bg-transparent text-iron hover:bg-mist disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer"
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() => setProjectPage(p => Math.min(totalProjectPages, p + 1))}
                  disabled={clampedProjectPage === totalProjectPages}
                  className="px-4 py-1.5 border border-ash rounded-full text-xs font-apkpraktikal uppercase tracking-wider bg-transparent text-iron hover:bg-mist disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
