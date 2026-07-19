'use client';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signOut, useSession } from "@/lib/auth-client";
import { getInstances, getBugsData, getBugTypesData, getRecentPRs, getDashboardStats } from "@/actions/dashboard";
import {
  Eye,
  AlertCircle,
  GitPullRequest,
  CheckCircle,
  TrendingUp,
  Settings,
  LogOut,
  Github,
  Plus,
  MoreVertical,
  ExternalLink,
  Search,
  Bell,
  HelpCircle,
  LayoutDashboard,
  FolderOpen,
  Workflow,
  ScrollText,
  Bot
} from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { runAgent } from "@/actions/runAgent";

export default function Dashboard() {
  const router = useRouter();
  const [userInstances, setUserInstances] = useState<any[]>([]);
  const [loadingInstances, setLoadingInstances] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bugsData, setBugsData] = useState<any[]>([]);
  const [bugTypesData, setBugTypesData] = useState<any[]>([]);
  const [recentPRs, setRecentPRs] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalBugs: 0, totalPRs: 0, fixedBugs: 0 });
  const { data: sessionData, isPending: isSessionLoading } = useSession();
  const session = sessionData?.user;
  const userInitial = isSessionLoading ? "..." : (session?.email ? session.email.charAt(0).toUpperCase() : (session?.name ? session.name.charAt(0).toUpperCase() : "?"));

  useEffect(() => {
    Promise.all([
      getInstances(),
      getBugsData(),
      getBugTypesData(),
      getRecentPRs(),
      getDashboardStats()
    ]).then(([instances, bugs, bugTypes, prs, dashboardStats]) => {
      setUserInstances(instances);
      setBugsData(bugs);
      setBugTypesData(bugTypes);
      setRecentPRs(prs);
      setStats(dashboardStats);
    }).catch(console.error).finally(() => setLoadingInstances(false));
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/sign-in");
          },
        },
      });
      // Aggressive fallback for stuck sessions on localhost
      setTimeout(() => {
        window.location.href = "/sign-in";
      }, 1500);
    } catch (error) {
      console.error("Logout error:", error);
      window.location.href = "/sign-in";
    }
  };

  return (
    <div className="flex h-screen bg-[#f8f9ff] text-[#0b1c30] font-sans overflow-hidden">
      
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-[#e5eeff] flex-col justify-between hidden md:flex shrink-0">
        <div>
          <div className="p-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#131b2e] rounded-md flex items-center justify-center">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-[16px] leading-tight text-[#0b1c30]">Watcher</div>
                <div className="text-[10px] text-[#76777d] font-bold tracking-wider mt-0.5 uppercase">AI Agent Active</div>
              </div>
            </Link>
          </div>
          
          <nav className="px-4 py-2 space-y-1">
            <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-md bg-[#f8f9ff] text-[#0b1c30] font-medium text-sm border-l-2 border-[#0b1c30]">
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-[#45464d] hover:bg-[#f8f9ff] hover:text-[#0b1c30] font-medium text-sm transition-colors border-l-2 border-transparent">
              <FolderOpen className="w-4 h-4" />
              Projects
            </Link>
            <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-[#45464d] hover:bg-[#f8f9ff] hover:text-[#0b1c30] font-medium text-sm transition-colors border-l-2 border-transparent">
              <Workflow className="w-4 h-4" />
              Pipelines
            </Link>
            <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-[#45464d] hover:bg-[#f8f9ff] hover:text-[#0b1c30] font-medium text-sm transition-colors border-l-2 border-transparent">
              <ScrollText className="w-4 h-4" />
              Logs
            </Link>
            <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-[#45464d] hover:bg-[#f8f9ff] hover:text-[#0b1c30] font-medium text-sm transition-colors border-l-2 border-transparent">
              <Bot className="w-4 h-4" />
              Agents
            </Link>
          </nav>
        </div>

        <div className="p-4 mb-4">
          <Link href="/dashboard/instance">
            <button className="w-full py-2.5 bg-[#131b2e] hover:bg-[#0b1c30] text-white text-xs font-bold tracking-widest uppercase rounded-md transition-colors flex items-center justify-center cursor-pointer">
              New Pipeline
            </button>
          </Link>
          <Dialog>
            <DialogTrigger asChild>
              <button
                className="w-full mt-4 py-2.5 bg-[#131b2e] hover:bg-[#0b1c30] text-white text-xs font-bold tracking-widest uppercase rounded-md transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </DialogTrigger>
            <DialogContent className="bg-white border border-[#e5eeff] rounded-lg shadow-[0px_4px_20px_rgba(11,28,48,0.08)] max-w-sm">
              <DialogHeader>
                <DialogTitle className="text-[#0b1c30] text-lg font-bold">Are you sure you want to log out?</DialogTitle>
                <DialogDescription className="text-[#45464d] text-sm mt-1">
                  You will be redirected to the sign-in page and will need to authenticate again to access your dashboard.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-3 mt-6">
                <DialogTrigger asChild>
                  <button className="px-4 py-2 rounded-md border border-[#c6c6cd] text-[#45464d] text-sm font-medium hover:bg-[#f8f9ff] transition-colors cursor-pointer">
                    Cancel
                  </button>
                </DialogTrigger>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 rounded-md bg-[#131b2e] hover:bg-[#0b1c30] text-white text-sm font-medium transition-colors cursor-pointer"
                >
                  Log Out
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header */}
        <header className="h-18 bg-white border-b border-[#e5eeff] flex items-center justify-between px-8 shrink-0 z-10">
          <div className="flex items-center gap-4 flex-1">
            <div className="flex items-center gap-3 font-bold text-lg md:hidden">
              <div className="w-8 h-8 bg-[#131b2e] rounded-md flex items-center justify-center">
                <Eye className="w-5 h-5 text-white" />
              </div>
              Watcher
            </div>
            
            <div className="hidden md:flex relative w-full max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#76777d]" />
              <input 
                type="text" 
                placeholder="Search systems..." 
                className="w-full bg-[#f8f9ff] border-none rounded-md py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-[#c6c6cd] text-[#0b1c30] placeholder-[#76777d]"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-5 text-[#45464d]">

            <div className="w-8 h-8 rounded-full bg-[#131b2e] flex items-center justify-center ml-2 border-2 border-white shadow-sm">
              <span className="text-white text-xs font-bold">{userInitial}</span>
            </div>
          </div>
        </header>

        {/* Scrollable Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-300 mx-auto">
            
            {/* Page Title */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h1 className="text-[30px] font-semibold tracking-tight text-[#0b1c30] mb-1">System Overview</h1>
                <p className="text-[#45464d] text-[16px]">Real-time intelligence and autonomous agent monitoring.</p>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#eff4ff] text-[#0b1c30] rounded-full border border-[#dce9ff]">
                <div className="w-2 h-2 rounded-full bg-[#10b981]"></div>
                <span className="text-[10px] font-bold tracking-widest uppercase">AI Agent: Optimized</span>
              </div>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              
              {/* Card 1 */}
              <div className="bg-white border border-[#e5eeff] rounded-md p-6 shadow-[0px_4px_20px_rgba(11,28,48,0.02)]">
                <div className="text-[10px] font-bold tracking-widest uppercase text-[#76777d] mb-4">Total Bugs Detected</div>
                <div className="flex items-end gap-3 mb-6">
                  <div className="text-5xl font-bold tracking-tight text-[#0b1c30]">{stats.totalBugs || "1,284"}</div>
                  <div className="text-[#10b981] font-semibold text-sm mb-1.5 flex items-center">↑ 12%</div>
                </div>
                <div style={{ height: 140 }} className="bg-[#f8f9ff] rounded border border-[#e5eeff] overflow-hidden">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={bugsData.length ? bugsData : [{week:'1',bugs:10},{week:'2',bugs:15}]}>
                      <Line type="monotone" dataKey="bugs" stroke="#4b41e1" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-white border border-[#e5eeff] rounded-md p-6 shadow-[0px_4px_20px_rgba(11,28,48,0.02)]">
                <div className="text-[10px] font-bold tracking-widest uppercase text-[#76777d] mb-4">Autonomous PRs</div>
                <div className="flex items-center gap-6 mb-6">
                  <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e5eeff" strokeWidth="3" />
                      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#4b41e1" strokeWidth="3" strokeDasharray="84, 100" />
                    </svg>
                    <div className="absolute text-sm font-bold text-[#0b1c30]">84%</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold tracking-tight text-[#0b1c30]">{stats.totalPRs || "432"}</div>
                    <div className="text-sm text-[#76777d]">Merged this month</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#45464d]">Security Fixes</span>
                      <span className="font-semibold text-[#0b1c30]">128</span>
                    </div>
                    <div className="w-full bg-[#e5eeff] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#4b41e1] h-full rounded-full" style={{ width: '40%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#45464d]">Refactoring</span>
                      <span className="font-semibold text-[#0b1c30]">304</span>
                    </div>
                    <div className="w-full bg-[#e5eeff] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#0b1c30] h-full rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Repositories Section */}
            <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h2 className="text-[24px] font-semibold tracking-tight text-[#0b1c30]">Connected Repositories</h2>
              <div className="flex gap-3">
                <Link href="/dashboard/instance">
                  <Button className="bg-[#131b2e] hover:bg-[#0b1c30] text-white h-9">
                    Add Repository
                  </Button>
                </Link>
              </div>
            </div>

            <div className="bg-white border border-[#e5eeff] rounded-md shadow-[0px_4px_20px_rgba(11,28,48,0.02)] mb-10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-[#e5eeff] bg-white">
                      <th className="py-4 px-6 text-[10px] font-bold tracking-widest uppercase text-[#76777d]">Repository Name</th>
                      <th className="py-4 px-6 text-[10px] font-bold tracking-widest uppercase text-[#76777d]">Health Status</th>
                      <th className="py-4 px-6 text-[10px] font-bold tracking-widest uppercase text-[#76777d]">AI Coverage</th>
                      <th className="py-4 px-6 text-[10px] font-bold tracking-widest uppercase text-[#76777d]">Last Sync</th>
                      <th className="py-4 px-6 text-[10px] font-bold tracking-widest uppercase text-[#76777d] text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingInstances ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-[#76777d]">Loading repositories...</td>
                      </tr>
                    ) : userInstances.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-[#76777d]">
                          No instances yet. Add a repository first, then you can run the agent from the instance rows.
                        </td>
                      </tr>
                    ) : (
                      userInstances.map((instance, idx) => (
                        <tr key={instance.id} className="border-b border-[#e5eeff] last:border-0 hover:bg-[#f8f9ff] transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-[#f8f9ff] flex items-center justify-center border border-[#e5eeff]">
                                <FolderOpen className="w-4 h-4 text-[#76777d]" />
                              </div>
                              <div>
                                <div className="font-semibold text-[#0b1c30]">{instance.name}</div>
                                <div className="text-xs text-[#76777d]">ID: {instance.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-[#d1fae5] text-[#065f46]">Stable</span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-24 bg-[#e5eeff] h-1.5 rounded-full overflow-hidden">
                                <div className="bg-[#4b41e1] h-full rounded-full" style={{ width: `${80 - (idx * 10)}%` }}></div>
                              </div>
                              <span className="text-xs font-bold text-[#0b1c30]">{80 - (idx * 10)}%</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-[#45464d] text-xs">{instance.createdAt ? new Date(instance.createdAt).toLocaleDateString() : '—'}</td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <form action={runAgent} onSubmit={() => setSubmitting(true)}>
                                <input type="hidden" name="instanceId" value={instance.id} />
                                <button
                                  type="submit"
                                  disabled={submitting}
                                  className="px-3 py-1.5 text-xs font-semibold bg-[#4b41e1] text-white rounded hover:bg-[#3a33c7] disabled:opacity-60"
                                >
                                  {submitting ? 'Starting…' : 'Run Agent'}
                                </button>
                              </form>
                              <button className="text-[#76777d] hover:text-[#0b1c30]"><MoreVertical className="w-4 h-4 inline" /></button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="flex flex-col gap-6">
              
              {/* Watcher Insights */}
              <div className="bg-white border border-[#e5eeff] rounded-md shadow-[0px_4px_20px_rgba(11,28,48,0.02)] flex flex-col">
                <div className="p-6 border-b border-[#e5eeff] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 text-[#4b41e1]"><GitPullRequest /></div>
                    <h3 className="font-bold text-lg text-[#0b1c30]">Recent Pull Requests</h3>
                  </div>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-[#76777d]">{recentPRs.length} PRs</span>
                </div>
                
                <div className="p-6 space-y-0 flex-1 overflow-y-auto">
                  {recentPRs.length === 0 ? (
                    <div className="text-center py-8 text-[#76777d] text-sm">
                      No pull requests found. Connect a repository to get started.
                    </div>
                  ) : (
                    recentPRs.map((pr, idx) => (
                      <div key={pr.id}>
                        <div className="flex gap-4 py-4">
                          <div className={`w-1 rounded-full shrink-0 ${pr.status === 'merged' ? 'bg-[#8b5cf6]' : pr.status === 'pending' ? 'bg-[#4b41e1]' : 'bg-[#c6c6cd]'}`}></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0">
                                <h4 className="font-semibold text-[#0b1c30] mb-1 truncate">{pr.title}</h4>
                                <p className="text-sm text-[#45464d] mb-2">
                                  <code className="bg-[#f8f9ff] text-[#0b1c30] px-1.5 py-0.5 rounded border border-[#e5eeff] text-xs font-mono">{pr.repo}</code>
                                  <span className="ml-2 text-[#76777d]">· {pr.created}</span>
                                </p>
                              </div>
                              <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${
                                pr.status === 'merged' ? 'bg-[#ede9fe] text-[#6d28d9]' : 
                                pr.status === 'pending' ? 'bg-[#dbeafe] text-[#1e40af]' : 
                                'bg-[#f3f4f6] text-[#6b7280]'
                              }`}>
                                {pr.status}
                              </span>
                            </div>
                            {pr.url && (
                              <a href={pr.url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-[#4b41e1] hover:underline flex items-center gap-1">
                                View PR <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                        {idx < recentPRs.length - 1 && <div className="h-px bg-[#e5eeff] w-full"></div>}
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>
        </main>
      </div>
    </div>
  );
}