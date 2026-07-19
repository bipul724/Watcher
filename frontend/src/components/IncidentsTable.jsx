import { History } from 'lucide-react';

export default function IncidentsTable({
  incidents,
  loadingIncidents,
  setSelectedIncident,
  getSeverityBadgeClass,
  getStatusBadgeClass,
  incidentPage,
  setIncidentPage,
  INCIDENTS_PER_PAGE
}) {
  // Paginated Incidents
  const totalIncidentPages = Math.ceil(incidents.length / INCIDENTS_PER_PAGE) || 1;
  const clampedIncidentPage = Math.min(incidentPage, totalIncidentPages);
  const currentIncidents = incidents.slice((clampedIncidentPage - 1) * INCIDENTS_PER_PAGE, clampedIncidentPage * INCIDENTS_PER_PAGE);

  return (
    <div className="col-span-1 lg:col-span-5 bg-canvas-white border border-ash rounded-xl flex flex-col overflow-hidden min-h-[420px] lg:h-[680px] min-w-0">
      <div className="px-4 sm:px-6 py-4 sm:py-[18px] border-b border-ash text-left bg-canvas-white shrink-0 min-w-0">
        <h2 className="font-apk-galeria text-base font-medium m-0 text-carbon-ink">Active Incident Remediation logs</h2>
      </div>

      {/* Background reloading indicator bar */}
      {loadingIncidents && incidents.length > 0 ? (
        <div className="h-[2px] w-full bg-cobalt-spark/10 overflow-hidden relative shrink-0">
          <div className="h-full bg-cobalt-spark absolute rounded-full animate-loading-slide"></div>
        </div>
      ) : (
        <div className="h-[2px] w-full bg-transparent shrink-0"></div>
      )}

      {loadingIncidents && incidents.length === 0 ? (
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-2 min-h-0">
          <div className="h-12 animate-skeleton rounded-cards shrink-0" />
          <div className="h-12 animate-skeleton rounded-cards shrink-0" style={{ animationDelay: '0.15s' }} />
          <div className="h-12 animate-skeleton rounded-cards shrink-0" style={{ animationDelay: '0.3s' }} />
          <div className="h-12 animate-skeleton rounded-cards shrink-0" style={{ animationDelay: '0.45s' }} />
        </div>
      ) : incidents.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 text-center min-h-0">
          <div className="w-16 h-16 mb-4 rounded-full bg-mist flex items-center justify-center text-slate border border-ash shrink-0">
            <History className="w-5 h-5 stroke-[1.5px]" />
          </div>
          <p className="font-apk-galeria text-sm font-medium text-iron italic">No incidents logged yet</p>
          <div className="mt-6 w-full max-w-[160px] h-[3px] bg-mist rounded-full overflow-hidden shrink-0">
            <div className="h-full bg-cobalt-spark/20 w-1/3"></div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto overflow-x-auto min-h-0">
            <table className="w-full min-w-[640px] border-collapse text-xs text-left table-fixed">
              <thead>
                <tr>
                  <th className="bg-mist px-4 py-3 font-apkpraktikal text-[9px] font-bold uppercase text-iron border-b border-ash sticky top-0 z-[2] w-[20%] text-center">Severity</th>
                  <th className="bg-mist px-4 py-3 font-apkpraktikal text-[9px] font-bold uppercase text-iron border-b border-ash sticky top-0 z-[2] w-[35%]">Service</th>
                  <th className="bg-mist px-4 py-3 font-apkpraktikal text-[9px] font-bold uppercase text-iron border-b border-ash sticky top-0 z-[2] w-[25%] text-center">Status</th>
                  <th className="bg-mist px-4 py-3 font-apkpraktikal text-[9px] font-bold uppercase text-iron border-b border-ash sticky top-0 z-[2] w-[20%] text-right">Time</th>
                </tr>
              </thead>
              <tbody className={`transition-opacity duration-200 ${loadingIncidents ? 'opacity-60 pointer-events-none' : ''}`}>
                {currentIncidents.map(inc => (
                  <tr 
                    key={inc.id} 
                    onClick={() => setSelectedIncident(inc)}
                    className="cursor-pointer transition-colors duration-150 hover:bg-mist/40 border-b border-ash/50"
                  >
                    <td className="px-4 py-3 text-center">
                      <span className={`font-apkpraktikal text-[8px] font-bold rounded-full px-2 py-0.5 tracking-wider uppercase inline-block ${getSeverityBadgeClass(inc.severity)}`}>
                        {inc.severity}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-apk-galeria font-medium text-carbon-ink truncate">
                      {inc.raw_payload?.service || 'service'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-apkpraktikal text-[8px] font-bold rounded-full px-2 py-0.5 inline-flex items-center uppercase tracking-wider ${getStatusBadgeClass(inc.status)}`}>
                        {inc.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-apkpraktikal text-[10px] text-iron tracking-wider">
                      {new Date(inc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalIncidentPages > 1 && (
            <div className="px-4 sm:px-6 py-4 border-t border-ash flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center bg-canvas-white shrink-0 select-none rounded-b-xl">
              <span className="font-apk-galeria text-xs text-iron">
                Showing <strong className="text-carbon-ink">{(clampedIncidentPage - 1) * INCIDENTS_PER_PAGE + 1}-{Math.min(clampedIncidentPage * INCIDENTS_PER_PAGE, incidents.length)}</strong> of <strong className="text-carbon-ink">{incidents.length}</strong>
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIncidentPage(p => Math.max(1, p - 1))}
                  disabled={clampedIncidentPage === 1}
                  className="px-4 py-1.5 border border-ash rounded-full text-xs font-apkpraktikal uppercase tracking-wider bg-transparent text-iron hover:bg-mist disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer"
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() => setIncidentPage(p => Math.min(totalIncidentPages, p + 1))}
                  disabled={clampedIncidentPage === totalIncidentPages}
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
