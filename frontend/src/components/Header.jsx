import { Menu, RefreshCw, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Header({
  dashboardTab,
  setMobileSidebarOpen,
  fetchDashboardData,
  handleOpenCreateModal,
  isRefreshing
}) {
  return (
    <header className="shrink-0 border-b border-ash bg-canvas-white/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 md:px-8 py-4 md:py-0 min-h-20 sticky top-0 z-30">
      <div className="flex items-center min-w-0 flex-1">
        <button 
          className="lg:hidden p-2 text-carbon-ink bg-transparent border border-ash cursor-pointer mr-3 rounded-full hover:bg-mist transition-colors flex items-center justify-center"
          onClick={() => setMobileSidebarOpen(true)}
          title="Open Sidebar"
        >
          <Menu className="w-4 h-4" />
        </button>
        <div className="text-left min-w-0">
          <h1 className="font-apk-galeria text-lg md:text-xl font-medium m-0 mb-0.5 tracking-tight text-carbon-ink truncate">
            {dashboardTab === 'CONSOLE' ? 'Platform Console' : 
             dashboardTab === 'SETUP' ? 'Discord Bot Setup' :
             dashboardTab === 'GITHUB_SETUP' ? 'GitHub Repository Setup' :
             'Webhook Alert Integration'}
          </h1>
          <p className="font-apk-galeria text-[11px] md:text-xs text-iron m-0 truncate hidden md:block">
            {dashboardTab === 'CONSOLE' ? 'Monitor multi-project alerts, manage BullMQ queues, and oversee resolutions.' : 
             dashboardTab === 'SETUP' ? 'Step-by-step documentation on how to configure and invite your Discord bot.' :
             dashboardTab === 'GITHUB_SETUP' ? 'Learn how to generate personal access tokens and link your repository.' :
             'Configure alert triggers for PagerDuty, Render, and custom VPS servers.'}
          </p>
        </div>
      </div>
      
      <div className="flex flex-wrap justify-end gap-2 shrink-0 max-w-full">
        {dashboardTab === 'CONSOLE' && (
          <>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-mist border border-ash text-carbon-ink rounded-full px-4 py-2 text-[11px] font-apkpraktikal uppercase tracking-widest cursor-pointer flex items-center gap-2 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={fetchDashboardData}
              title="Refresh Console"
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cobalt-spark ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </motion.button>

            {/* Lime Glow conversion action for "Add Project" */}
            <motion.button 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="bg-lime-glow text-carbon-ink border border-iron/10 rounded-full px-4 py-2.5 text-[11px] font-apkpraktikal font-bold uppercase tracking-widest cursor-pointer flex items-center gap-2 transition-all duration-150"
              onClick={handleOpenCreateModal}
              title="Add Project"
            >
              <Plus className="w-3.5 h-3.5 text-carbon-ink" />
              <span className="hidden sm:inline">Add Project</span>
            </motion.button>
          </>
        )}
      </div>
    </header>
  );
}
