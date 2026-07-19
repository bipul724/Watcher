import { motion } from 'framer-motion';
import QuickMetrics from './QuickMetrics';
import ProjectsList from './ProjectsList';
import IncidentsTable from './IncidentsTable';

export default function ConsoleDashboard({
  guideOpen,
  setGuideOpen,
  projects,
  loadingProjects,
  incidents,
  loadingIncidents,
  handleOpenCreateModal,
  handleOpenEditModal,
  handleDeleteProject,
  handleCopyWebhook,
  copiedStates,
  handleTriggerTestIncident,
  API_BASE,
  projectPage,
  setProjectPage,
  PROJECTS_PER_PAGE,
  incidentPage,
  setIncidentPage,
  INCIDENTS_PER_PAGE,
  setSelectedIncident,
  getSeverityBadgeClass,
  getStatusBadgeClass
}) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex-1 flex flex-col min-h-0 bg-canvas-white"
    >
      {/* Developer Guidance Banner styled as the "Ice Blue Feature Panel" from Style Reference */}
      <div className="mx-4 sm:mx-6 md:mx-8 mt-4 sm:mt-6 bg-ice-blue rounded-cards p-4 sm:p-6 text-left relative overflow-hidden shrink-0 min-w-0">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 select-none">
          <div>
            {/* Eyebrow */}
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cobalt-spark"></span>
              <span className="font-apkpraktikal text-[9px] font-bold tracking-widest text-carbon-ink uppercase">OPERATIONAL ARCHITECTURE</span>
            </div>
            
            <h3 className="font-apk-galeria text-lg md:text-xl font-medium text-carbon-ink">
              Watcher Platform Core
            </h3>
          </div>
          
          <button 
            type="button"
            onClick={() => setGuideOpen(!guideOpen)}
            className="px-4 py-1.5 bg-canvas-white border border-ash text-carbon-ink font-apkpraktikal font-semibold text-[9px] uppercase tracking-widest rounded-full hover:bg-mist transition-colors cursor-pointer"
          >
            {guideOpen ? 'Collapse' : 'Expand Details'}
          </button>
        </div>
        
        {guideOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.2 }}
            className="mt-5 text-sm leading-relaxed border-t border-dashed border-silver/30 pt-5"
          >
            <p className="font-apk-galeria text-xs md:text-sm text-iron leading-relaxed mb-4">
              WatcherAgent monitors a multi-project, Human-in-the-Loop AI Incident Remediation Pipeline backed by BullMQ. Follow this workflow to trigger and test the active agent pipeline:
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { title: '1. Copy Webhook URL', desc: 'Onboard a project and copy the unique webhook URL. Alerts are routed here.' },
                { title: '2. Click "Fire Test Alert"', desc: 'Simulates a database crash alert, queueing an ingestion task on BullMQ.' },
                { title: '3. Approve on Discord', desc: 'The worker logs the incident and pings Discord. Click "Accept & Fix" on Discord.' },
                { title: '4. Automated Fix', desc: 'The agent sandbox writes code, opens a GitHub PR, and updates Pinecone vectors.' }
              ].map(step => (
                <div key={step.title} className="bg-canvas-white border border-ash rounded-cards p-4 text-left">
                  <h4 className="font-apk-galeria text-xs font-semibold text-carbon-ink m-0 mb-1">{step.title}</h4>
                  <p className="font-apk-galeria text-[11px] text-iron m-0 leading-normal">{step.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Quick Metrics Grid */}
      <QuickMetrics 
        projectsCount={projects.length}
        incidentsCount={incidents.length}
        awaitingApprovalCount={incidents.filter(i => i.status === 'AWAITING_APPROVAL').length}
      />

      {/* Content Layout Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 px-4 sm:px-6 md:px-8 pb-6 sm:pb-8 mt-4 sm:mt-6 bg-transparent min-h-0 flex-1 min-w-0">
        
        {/* Left Column: Projects List */}
        <ProjectsList 
          projects={projects}
          loadingProjects={loadingProjects}
          handleOpenCreateModal={handleOpenCreateModal}
          handleOpenEditModal={handleOpenEditModal}
          handleDeleteProject={handleDeleteProject}
          handleCopyWebhook={handleCopyWebhook}
          copiedStates={copiedStates}
          handleTriggerTestIncident={handleTriggerTestIncident}
          API_BASE={API_BASE}
          projectPage={projectPage}
          setProjectPage={setProjectPage}
          PROJECTS_PER_PAGE={PROJECTS_PER_PAGE}
        />

        {/* Right Column: Live Incident Tracking */}
        <IncidentsTable 
          incidents={incidents}
          loadingIncidents={loadingIncidents}
          setSelectedIncident={setSelectedIncident}
          getSeverityBadgeClass={getSeverityBadgeClass}
          getStatusBadgeClass={getStatusBadgeClass}
          incidentPage={incidentPage}
          setIncidentPage={setIncidentPage}
          INCIDENTS_PER_PAGE={INCIDENTS_PER_PAGE}
        />

      </div>
    </motion.div>
  );
}
