import { Eye, Settings, Plus, LogOut, Activity, X, GitBranch, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar({
  user,
  dashboardTab,
  setDashboardTab,
  mobileSidebarOpen,
  setMobileSidebarOpen,
  handleOpenCreateModal,
  handleLogout
}) {
  const navItems = [
    { id: 'CONSOLE', label: 'Console Dashboard', icon: Activity, section: 'MANAGEMENT' },
    { id: 'SETUP', label: 'Discord Bot Setup', icon: Settings, section: 'GUIDES & SETUP' },
    { id: 'GITHUB_SETUP', label: 'GitHub Repo Setup', icon: GitBranch, section: 'GUIDES & SETUP' },
    { id: 'WEBHOOK_SETUP', label: 'Webhook Alert Setup', icon: Zap, section: 'GUIDES & SETUP' },
  ];

  const renderNavGroup = (sectionName) => {
    const items = navItems.filter(item => item.section === sectionName);
    return (
      <div key={sectionName} className="flex flex-col gap-1 mb-5">
        {/* Eyebrow label for category */}
        <div className="flex items-center gap-2 mb-2 ml-3">
          <span className="w-1 h-1 rounded-full bg-cobalt-spark"></span>
          <span className="font-apkpraktikal text-[9px] font-bold tracking-widest text-slate uppercase">
            {sectionName}
          </span>
        </div>
        
        {items.map(item => {
          const Icon = item.icon;
          const isActive = dashboardTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={`flex items-center justify-between px-3.5 py-3 rounded-full text-xs font-apkpraktikal uppercase tracking-wider transition-all duration-150 border-none cursor-pointer w-full text-left bg-transparent ${
                isActive 
                  ? 'bg-mist text-carbon-ink font-bold border border-ash/50' 
                  : 'text-slate hover:text-carbon-ink hover:bg-mist/30'
              }`}
              onClick={() => {
                setDashboardTab(item.id);
                setMobileSidebarOpen(false);
              }}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 stroke-[1.5px] ${isActive ? 'text-cobalt-spark' : 'text-slate'}`} />
                <span>{item.label}</span>
              </div>
              {isActive && (
                <motion.span 
                  layoutId="activeIndicator"
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  className="text-cobalt-spark text-sm font-bold"
                >
                  →
                </motion.span>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  const profileCard = (
    <div className="flex items-center gap-3 p-3.5 rounded-xl bg-mist/50 border border-ash mb-6">
      <div className="w-9 h-9 rounded-full bg-carbon-ink text-canvas-white flex items-center justify-center font-apkpraktikal font-bold text-xs select-none">
        {user?.name?.charAt(0).toUpperCase() || 'U'}
      </div>
      <div className="flex flex-col text-left min-w-0">
        <span className="font-apk-galeria text-[13px] font-medium text-carbon-ink whitespace-nowrap overflow-hidden text-ellipsis">
          {user?.name || 'User Profile'}
        </span>
        <span className="font-apkpraktikal text-[10px] text-iron whitespace-nowrap overflow-hidden text-ellipsis">
          {user?.email}
        </span>
      </div>
    </div>
  );

  const sidebarContent = (
    <div className="flex flex-col h-full justify-between">
      <div className="flex-1 overflow-y-auto pr-1">
        {profileCard}
        {renderNavGroup('MANAGEMENT')}
        {renderNavGroup('GUIDES & SETUP')}

        <div className="flex flex-col gap-1 mt-4">
          <div className="flex items-center gap-2 mb-2 ml-3">
            <span className="w-1 h-1 rounded-full bg-cobalt-spark"></span>
            <span className="font-apkpraktikal text-[9px] font-bold tracking-widest text-slate uppercase">
              ACTIONS
            </span>
          </div>
          <button 
            type="button"
            className="flex items-center justify-between px-3.5 py-3 rounded-full text-xs font-apkpraktikal uppercase tracking-wider text-iron hover:text-carbon-ink hover:bg-mist/30 transition-all border-none bg-transparent cursor-pointer w-full"
            onClick={() => {
              setMobileSidebarOpen(false);
              handleOpenCreateModal();
            }}
          >
            <div className="flex items-center gap-3">
              <Plus className="w-4 h-4 text-cobalt-spark stroke-[1.5px]" />
              <span>Create Project</span>
            </div>
            <span className="text-slate text-xs">+</span>
          </button>
        </div>
      </div>

      <div className="mt-auto pt-6 border-t border-ash">
        <button 
          className="w-full flex items-center justify-center gap-2 bg-transparent text-iron border border-ash hover:border-danger/30 hover:bg-danger/5 hover:text-danger rounded-full py-3 font-apkpraktikal text-xs font-bold uppercase tracking-widest cursor-pointer transition-all duration-150"
          onClick={() => { setMobileSidebarOpen(false); handleLogout(); }}
        >
          <LogOut className="w-3.5 h-3.5 stroke-[1.5px]" /> Log Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar Overlay Drawer */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-carbon-ink/20 backdrop-blur-xs"
              onClick={() => setMobileSidebarOpen(false)}
            ></motion.div>
            
            {/* Drawer */}
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 220, damping: 24 }}
              className="relative w-[min(90vw,320px)] max-w-[90vw] h-full max-h-[100dvh] bg-canvas-white border-r border-ash flex flex-col p-6 shadow-sm text-left overflow-hidden"
            >
              <div className="flex items-center justify-between mb-8 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-6.5 h-6.5 rounded-full bg-carbon-ink flex items-center justify-center text-canvas-white">
                    <Eye className="w-3.5 h-3.5 text-lime-glow" />
                  </div>
                  <div className="text-left">
                    <span className="font-apk-galeria text-base font-medium block text-carbon-ink leading-tight">watcher.agent</span>
                    <span className="font-apkpraktikal text-[8px] text-slate font-bold tracking-widest uppercase block">Console Tower</span>
                  </div>
                </div>
                <button 
                  className="bg-transparent border border-ash text-slate hover:text-carbon-ink p-1.5 rounded-full transition-colors cursor-pointer flex items-center justify-center"
                  onClick={() => setMobileSidebarOpen(false)}
                  title="Close Sidebar"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              
              <div className="flex-1 min-h-0 overflow-hidden">
                {sidebarContent}
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-[260px] shrink-0 bg-canvas-white border-r border-ash flex-col p-6 text-left min-h-0">
        <div className="flex items-center gap-3 mb-8 shrink-0">
          <div className="w-7 h-7 rounded-full bg-carbon-ink flex items-center justify-center text-canvas-white">
            <Eye className="w-4 h-4 text-lime-glow" />
          </div>
          <div className="text-left">
            <span className="font-apk-galeria text-base font-medium block text-carbon-ink leading-tight">watcher.agent</span>
            <span className="font-apkpraktikal text-[8px] text-slate font-bold tracking-widest uppercase block">Console Tower</span>
          </div>
        </div>
        
        <div className="flex-1 min-h-0 overflow-hidden">
          {sidebarContent}
        </div>
      </aside>
    </>
  );
}
