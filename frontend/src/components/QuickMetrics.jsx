import { Cpu, Activity, AlertTriangle } from 'lucide-react';

export default function QuickMetrics({
  projectsCount,
  incidentsCount,
  awaitingApprovalCount
}) {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 px-4 sm:px-6 md:px-8 mt-4 sm:mt-6 shrink-0 bg-transparent min-w-0">
      {/* Metric Card 1 */}
      <div className="bg-canvas-white border border-ash rounded-cards p-4 sm:p-6 text-left hover:border-cobalt-spark/30 transition-all duration-200 min-w-0">
        <div className="flex justify-between items-center mb-4">
          <span className="font-apkpraktikal text-[9px] font-bold uppercase text-iron tracking-widest">Active Projects</span>
          <span className="p-2 bg-mist rounded-full text-carbon-ink border border-ash/40">
            <Cpu className="w-4 h-4 stroke-[1.5px] text-cobalt-spark" />
          </span>
        </div>
        <div className="font-apk-galeria text-3xl sm:text-4xl font-medium text-carbon-ink mb-1">{projectsCount}</div>
        <div className="font-apk-galeria text-xs text-slate">Configured environments</div>
      </div>
      
      {/* Metric Card 2 */}
      <div className="bg-canvas-white border border-ash rounded-cards p-4 sm:p-6 text-left hover:border-cobalt-spark/30 transition-all duration-200 min-w-0">
        <div className="flex justify-between items-center mb-4">
          <span className="font-apkpraktikal text-[9px] font-bold uppercase text-iron tracking-widest">Total Alert Volume</span>
          <span className="p-2 bg-mist rounded-full text-carbon-ink border border-ash/40">
            <Activity className="w-4 h-4 stroke-[1.5px]" />
          </span>
        </div>
        <div className="font-apk-galeria text-3xl sm:text-4xl font-medium text-carbon-ink mb-1">{incidentsCount}</div>
        <div className="font-apk-galeria text-xs text-slate">Remediated via pipeline</div>
      </div>

      {/* Metric Card 3 */}
      <div className="bg-canvas-white border border-ash rounded-cards p-4 sm:p-6 text-left hover:border-cobalt-spark/30 transition-all duration-200 min-w-0">
        <div className="flex justify-between items-center mb-4">
          <span className="font-apkpraktikal text-[9px] font-bold uppercase text-iron tracking-widest">Awaiting Approval</span>
          <span className="p-2 bg-mist rounded-full text-carbon-ink border border-ash/40">
            <AlertTriangle className="w-4 h-4 stroke-[1.5px] text-cobalt-spark" />
          </span>
        </div>
        <div className="font-apk-galeria text-3xl sm:text-4xl font-medium text-carbon-ink mb-1">
          {awaitingApprovalCount}
        </div>
        <div className="font-apk-galeria text-xs text-slate">HITL Discord checkouts</div>
      </div>
    </section>
  );
}
