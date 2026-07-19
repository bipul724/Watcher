/* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, react-hooks/immutability */
import { useState, useEffect, lazy, Suspense } from 'react';
import LandingPage from './components/LandingPage';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ConsoleDashboard from './components/ConsoleDashboard';
import ProjectModal from './components/ProjectModal';
import IncidentDetailsDrawer from './components/IncidentDetailsDrawer';
import { Loader2 } from 'lucide-react';

// Lazily load large guide components for dashboard optimization
const DiscordSetupGuide = lazy(() => import('./components/DiscordSetupGuide'));
const GithubSetupGuide = lazy(() => import('./components/GithubSetupGuide'));
const WebhookSetupGuide = lazy(() => import('./components/WebhookSetupGuide'));

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

function App() {
  const [view, setView] = useState('LANDING'); // LANDING, SIGN_IN, SIGN_UP, DASHBOARD
  const [dashboardTab, setDashboardTab] = useState('CONSOLE'); // CONSOLE, SETUP, GITHUB_SETUP, WEBHOOK_SETUP
  const [token, setToken] = useState(localStorage.getItem('watcher_token') || '');
  const [user, setUser] = useState(null);
  
  // Projects & Incidents State
  const [projects, setProjects] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingIncidents, setLoadingIncidents] = useState(false);
  
  // Forms State
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  
  // Project Form & Observability State
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null); // Project currently being edited
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false); // Mobile sidebar overlay drawer toggle
  
  const [projName, setProjName] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projGithubOwner, setProjGithubOwner] = useState('');
  const [projGithubRepo, setProjGithubRepo] = useState('');
  const [projGithubToken, setProjGithubToken] = useState('');
  const [projDiscordChannel, setProjDiscordChannel] = useState('');
  const [projDiscordBotToken, setProjDiscordBotToken] = useState('');
  const [projOpenRouterKey, setProjOpenRouterKey] = useState('');
  const [projFormError, setProjFormError] = useState('');
  const [projFormLoading, setProjFormLoading] = useState(false);
  const [projLlmProvider, setProjLlmProvider] = useState('OPENROUTER');
  const [projLlmModel, setProjLlmModel] = useState('');
  const [projLlmModelsList, setProjLlmModelsList] = useState([]);
  const [projLlmCredits, setProjLlmCredits] = useState(null);
  const [projLlmVerifying, setProjLlmVerifying] = useState(false);
  const [projLlmVerificationError, setProjLlmVerificationError] = useState('');

  // Selected Incident Detail Modal
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [copiedStates, setCopiedStates] = useState({}); // project.id -> boolean (for webhook secret copy feedback)
  const [guideOpen, setGuideOpen] = useState(true);
  
  // Discord bot integration setup states
  const [globalBotInfo, setGlobalBotInfo] = useState(null);
  const [loadingBotInfo, setLoadingBotInfo] = useState(false);

  // Pagination States
  const [projectPage, setProjectPage] = useState(1);
  const [incidentPage, setIncidentPage] = useState(1);
  const PROJECTS_PER_PAGE = 3;
  const INCIDENTS_PER_PAGE = 10;

  // Modal Open Handlers
  const handleOpenCreateModal = () => {
    setEditingProject(null);
    setProjName('');
    setProjDesc('');
    setProjGithubOwner('');
    setProjGithubRepo('');
    setProjGithubToken('');
    setProjDiscordChannel('');
    setProjDiscordBotToken('');
    setProjOpenRouterKey('');
    setProjLlmProvider('OPENROUTER');
    setProjLlmModel('');
    setProjLlmModelsList([]);
    setProjLlmCredits(null);
    setProjLlmVerificationError('');
    setProjFormError('');
    setShowProjectModal(true);
  };

  async function handleVerifyLlmKey(provider, apiKey) {
    setProjLlmVerifying(true);
    setProjLlmVerificationError('');
    setProjLlmCredits(null);
    try {
      const res = await fetch(`${API_BASE}/projects/validate-llm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          llm_provider: provider,
          llm_api_key: apiKey
        })
      });

      let data;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        const textSnippet = text.length > 100 ? text.substring(0, 100) + '...' : text;
        throw new Error(textSnippet || `HTTP error! Status: ${res.status}`);
      }

      if (res.ok) {
        setProjLlmModelsList(data.models || []);
        setProjLlmCredits(data.credits || null);
        if (data.models && data.models.length > 0) {
          const currentExists = data.models.some(m => m.id === projLlmModel);
          if (!currentExists) {
            setProjLlmModel(data.models[0].id);
          }
        }
      } else {
        setProjLlmVerificationError(data.error || 'Failed to validate API Key.');
      }
    } catch (err) {
      setProjLlmVerificationError(err.message || 'Fetch connection error during LLM validation.');
    } finally {
      setProjLlmVerifying(false);
    }
  }

  const handleOpenEditModal = (project) => {
    setEditingProject(project);
    setProjName(project.name || '');
    setProjDesc(project.description || '');
    setProjGithubOwner(project.github_owner || '');
    setProjGithubRepo(project.github_repo || '');
    setProjGithubToken(project.github_token || '');
    setProjDiscordChannel(project.discord_channel_id || '');
    setProjDiscordBotToken(project.discord_bot_token || '');
    setProjOpenRouterKey(project.openrouter_key || '');
    setProjLlmProvider(project.llm_provider || 'OPENROUTER');
    setProjLlmModel(project.llm_model || '');
    setProjLlmModelsList([]);
    setProjLlmCredits(null);
    setProjLlmVerificationError('');
    setProjFormError('');
    setShowProjectModal(true);

    if (project.openrouter_key || project.llm_provider) {
      handleVerifyLlmKey(project.llm_provider || 'OPENROUTER', project.openrouter_key || '');
    }
  };

  // Auth profile loading
  useEffect(() => {
    if (token) {
      localStorage.setItem('watcher_token', token);
      fetchProfile();
      fetchDashboardData();
    } else {
      localStorage.removeItem('watcher_token');
      setUser(null);
      setProjects([]);
      setIncidents([]);
    }
  }, [token]);

  // Poll for incidents updates smoothly when logged in
  useEffect(() => {
    let interval;
    if (token && view === 'DASHBOARD') {
      interval = setInterval(() => {
        fetchIncidents(true); // Pass isPoll=true to fetch silently in the background
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [token, view]);

  // Fetch global bot details on dashboard/setup navigation
  useEffect(() => {
    const fetchBotInfo = async () => {
      if (!token) return;
      setLoadingBotInfo(true);
      try {
        const res = await fetch(`${API_BASE}/discord/bot-info`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setGlobalBotInfo(data);
        }
      } catch (err) {
        console.error('Failed to fetch Discord bot details:', err);
      } finally {
        setLoadingBotInfo(false);
      }
    };

    if (view === 'DASHBOARD' && dashboardTab === 'SETUP') {
      fetchBotInfo();
    }
  }, [view, dashboardTab, token]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setView('DASHBOARD');
      } else {
        setToken('');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  const fetchDashboardData = () => {
    fetchProjects();
    fetchIncidents(false);
  };

  const fetchProjects = async () => {
    setLoadingProjects(true);
    try {
      const res = await fetch(`${API_BASE}/projects`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch (err) {
      console.error('Error loading projects:', err);
    } finally {
      setLoadingProjects(false);
    }
  };

  const fetchIncidents = async (isPoll = false) => {
    if (!isPoll) setLoadingIncidents(true);
    try {
      const res = await fetch(`${API_BASE}/incidents`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const newIncidents = data.incidents || [];
        
        // Deep-compare using stringified versions to check for actual differences
        setIncidents(prev => {
          if (JSON.stringify(prev) === JSON.stringify(newIncidents)) {
            return prev; // Prevents re-rendering table rows if data is identical
          }
          
          // Also update selected incident if it's currently open and has new logs/status
          if (selectedIncident) {
            const updatedSelected = newIncidents.find(i => i.id === selectedIncident.id);
            if (updatedSelected && JSON.stringify(updatedSelected) !== JSON.stringify(selectedIncident)) {
              setSelectedIncident(updatedSelected);
            }
          }
          
          return newIncidents;
        });
      }
    } catch (err) {
      console.error('Error loading incidents:', err);
    } finally {
      if (!isPoll) setLoadingIncidents(false);
    }
  };

  const handleAuthSubmit = async (e, type, localEmail, localPassword, localName) => {
    if (e) e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    const email = localEmail !== undefined ? localEmail : authEmail;
    const password = localPassword !== undefined ? localPassword : authPassword;
    const name = localName !== undefined ? localName : authName;

    // --- Frontend Validation with clear Issue & Solution ---
    if (type === 'SIGN_UP') {
      if (!name || name.trim() === '') {
        setAuthError("Issue: Full Name is required for signing up.\nSolution: Please enter your full name in the registration form.");
        setAuthLoading(false);
        return;
      }
      if (!email || !/\S+@\S+\.\S+/.test(email)) {
        setAuthError("Issue: Email address is invalid or empty.\nSolution: Please enter a valid email address (e.g. name@company.com).");
        setAuthLoading(false);
        return;
      }
      if (!password || password.length < 6) {
        const len = password ? password.length : 0;
        setAuthError(`Issue: Password is too short (current length: ${len}).\nSolution: Password should be minimum 6 characters long.`);
        setAuthLoading(false);
        return;
      }
    } else {
      // SIGN_IN
      if (!email || !/\S+@\S+\.\S+/.test(email)) {
        setAuthError("Issue: Email address is invalid or empty.\nSolution: Please enter a valid email address.");
        setAuthLoading(false);
        return;
      }
      if (!password || password.length < 1) {
        setAuthError("Issue: Password is required to access your account.\nSolution: Please enter your password.");
        setAuthLoading(false);
        return;
      }
    }

    const url = type === 'SIGN_UP' ? `${API_BASE}/auth/signup` : `${API_BASE}/auth/login`;
    const payload = type === 'SIGN_UP' 
      ? { email, password, name }
      : { email, password };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
        setAuthEmail('');
        setAuthPassword('');
        setAuthName('');
      } else {
        if (data.details && Array.isArray(data.details)) {
          // Parse backend zod validation errors
          const formatted = data.details.map(d => {
            const field = d.path ? d.path[d.path.length - 1] : 'field';
            const displayField = field.replace(/_/g, ' ');
            const capitalizedField = displayField.charAt(0).toUpperCase() + displayField.slice(1);
            let solution = `Please specify a valid value for the ${displayField}.`;
            if (field === 'password') {
              solution = 'Password should be minimum 6 characters long.';
            } else if (field === 'email') {
              solution = 'Please enter a valid email format (e.g. user@example.com).';
            }
            return `Issue: ${capitalizedField} validation failed - ${d.message}.\nSolution: ${solution}`;
          }).join('\n\n');
          setAuthError(formatted);
        } else {
          // General auth errors
          let solution = 'Please double check your credentials and try again.';
          if (data.error && data.error.includes('already exists')) {
            solution = 'Please use a different email address or log in to your existing account.';
          } else if (data.error && data.error.includes('Invalid email or password')) {
            solution = 'Please check if you typed the correct email and password. If you forgot your password, please reset it.';
          }
          setAuthError(`Issue: ${data.error || 'Authentication failed'}\nSolution: ${solution}`);
        }
      }
    } catch {
      setAuthError('Issue: Unable to connect to the backend server.\nSolution: Please check your network connection and ensure the backend service is running.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleCreateProject = async (e, localPayload) => {
    if (e) e.preventDefault();
    setProjFormLoading(true);
    setProjFormError('');

    const payload = localPayload || {
      name: projName,
      description: projDesc,
      github_owner: projGithubOwner,
      github_repo: projGithubRepo,
      github_token: projGithubToken,
      discord_channel_id: projDiscordChannel,
      discord_bot_token: projDiscordBotToken,
      openrouter_key: projOpenRouterKey,
      llm_provider: projLlmProvider,
      llm_model: projLlmModel
    };

    // --- Frontend Validation for Projects ---
    if (!payload.name || payload.name.trim() === '') {
      setProjFormError("Issue: Project Name is required.\nSolution: Please enter a name for your project.");
      setProjFormLoading(false);
      return;
    }
    if (!payload.github_owner || payload.github_owner.trim() === '') {
      setProjFormError("Issue: GitHub Owner/Organization is required.\nSolution: Please enter the GitHub username or organization name that owns the repository.");
      setProjFormLoading(false);
      return;
    }
    if (!payload.github_repo || payload.github_repo.trim() === '') {
      setProjFormError("Issue: GitHub Repository name is required.\nSolution: Please enter the name of the GitHub repository.");
      setProjFormLoading(false);
      return;
    }
    if (!payload.github_token || payload.github_token.trim() === '') {
      setProjFormError("Issue: GitHub Personal Access Token (PAT) is required.\nSolution: Please enter a valid GitHub token with repo scope permissions.");
      setProjFormLoading(false);
      return;
    }
    if (!payload.discord_channel_id || payload.discord_channel_id.trim() === '') {
      setProjFormError("Issue: Discord Channel ID is required.\nSolution: Please enter the target Discord channel ID where alerts will be dispatched.");
      setProjFormLoading(false);
      return;
    }

    try {
      const url = editingProject 
        ? `${API_BASE}/projects/${editingProject.id}` 
        : `${API_BASE}/projects`;
      const method = editingProject ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        if (editingProject) {
          // Update existing project in state
          setProjects(prev => prev.map(p => p.id === editingProject.id ? data.project : p));
        } else {
          // Add new project to state
          setProjects(prev => [data.project, ...prev]);
        }
        
        setShowProjectModal(false);
        setEditingProject(null);
        // Reset form fields
        setProjName('');
        setProjDesc('');
        setProjGithubOwner('');
        setProjGithubRepo('');
        setProjGithubToken('');
        setProjDiscordChannel('');
        setProjDiscordBotToken('');
        setProjOpenRouterKey('');
        setProjLlmProvider('OPENROUTER');
        setProjLlmModel('');
        setProjLlmModelsList([]);
        setProjLlmCredits(null);
        setProjLlmVerificationError('');
      } else {
        if (data.details && Array.isArray(data.details)) {
          // Parse backend zod validation errors
          const formatted = data.details.map(d => {
            const field = d.path ? d.path[d.path.length - 1] : 'field';
            const displayField = field.replace(/_/g, ' ');
            const capitalizedField = displayField.charAt(0).toUpperCase() + displayField.slice(1);
            let solution = `Please specify a valid value for the ${displayField}.`;
            if (field === 'github_token') {
              solution = 'Please generate and paste a valid GitHub Personal Access Token (PAT) with repo scopes.';
            } else if (field === 'discord_channel_id') {
              solution = 'Please copy a valid Discord channel ID from Discord settings.';
            }
            return `Issue: ${capitalizedField} validation failed - ${d.message}.\nSolution: ${solution}`;
          }).join('\n\n');
          setProjFormError(formatted);
        } else {
          setProjFormError(`Issue: ${data.error || 'Failed to process project credentials'}\nSolution: Please verify validation errors and try again.`);
        }
      }
    } catch {
      setProjFormError('Issue: Failed to communicate with the backend.\nSolution: Please check your network connection and ensure the server is running.');
    } finally {
      setProjFormLoading(false);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!window.confirm('Are you sure you want to delete this project? This will delete all its incidents as well.')) return;
    try {
      const res = await fetch(`${API_BASE}/projects/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setProjects(prev => prev.filter(p => p.id !== id));
        setIncidents(prev => prev.filter(i => i.project_id !== id));
      }
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  };

  const handleCopyWebhook = (secret, projectId) => {
    const url = `${API_BASE}/webhook/${secret}`;
    navigator.clipboard.writeText(url);
    setCopiedStates(prev => ({ ...prev, [projectId]: true }));
    setTimeout(() => {
      setCopiedStates(prev => ({ ...prev, [projectId]: false }));
    }, 2000);
  };

  const handleTriggerTestIncident = async (secret, serviceName) => {
    const url = `${API_BASE}/webhook/${secret}`;
    
    // Custom test payload that mirrors Sentry event payload
    const testPayload = {
      incident_id: `inc_${Math.floor(Math.random() * 900000) + 100000}`,
      service: serviceName || 'test-service',
      alert: {
        latencyMs: 342,
        errorRate: 0.08,
        durationMin: 5,
        transactionsAffected: 120,
        errorTypes: ['MongoNetworkError', 'MongooseError']
      },
      message: 'MongoNetworkError: connection timed out to replica set primary at primary.mongo.cluster:27017',
      severity: 'P1',
      category: 'DATABASE',
      error_signature: 'MongoNetworkError: connection timed out to replica set primary',
      runbook_hint: 'Verify Mongo container instance is running and check security groups.'
    };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload)
      });
      if (res.ok) {
        alert('🚀 Test Alert webhook fired successfully! Ingestion job queued on BullMQ.');
        fetchIncidents(false); // Force load
      } else {
        alert('❌ Failed to trigger test webhook. Ensure backend is running.');
      }
    } catch {
      alert('❌ Fetch connection error to Express backend.');
    }
  };

  const handleLogout = () => {
    setToken('');
    setView('LANDING');
  };

  // Rendering Helper Methods
  const getSeverityBadgeClass = (sev) => {
    switch (sev) {
      case 'P1': return 'bg-danger/10 text-danger border border-danger/20 font-semibold';
      case 'P2': return 'bg-warning/10 text-warning border border-warning/20 font-semibold';
      default: return 'bg-success/10 text-success border border-success/20 font-semibold';
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'TRIGGERED': return 'bg-primary/10 text-primary border border-primary/20 font-semibold';
      case 'AWAITING_APPROVAL': return 'bg-warning/10 text-warning border border-warning/20 font-semibold';
      case 'FIXING': return 'bg-cobalt-spark/10 text-cobalt-spark border border-cobalt-spark/20 font-semibold';
      case 'CLOSED_AND_LEARNED': return 'bg-success/10 text-success border border-success/20 font-semibold';
      case 'MUTED': return 'bg-warm-gray/10 text-warm-gray border border-warm-gray/20 font-semibold';
      default: return 'bg-danger/10 text-danger border border-danger/20 font-semibold';
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-background text-on-surface font-sans selection:bg-primary/20 relative">
      <div className="fixed inset-0 paper-texture pointer-events-none z-50"></div>
      
      {/* 1. LANDING PAGE VIEW */}
      {view === 'LANDING' && (
        <LandingPage setView={setView} />
      )}

      {/* 2. SIGN IN VIEW */}
      {view === 'SIGN_IN' && (
        <SignIn 
          setView={setView}
          authEmail={authEmail}
          setAuthEmail={setAuthEmail}
          authPassword={authPassword}
          setAuthPassword={setAuthPassword}
          authError={authError}
          setAuthError={setAuthError}
          authLoading={authLoading}
          handleAuthSubmit={handleAuthSubmit}
        />
      )}

      {/* 3. SIGN UP VIEW */}
      {view === 'SIGN_UP' && (
        <SignUp 
          setView={setView}
          authName={authName}
          setAuthName={setAuthName}
          authEmail={authEmail}
          setAuthEmail={setAuthEmail}
          authPassword={authPassword}
          setAuthPassword={setAuthPassword}
          authError={authError}
          setAuthError={setAuthError}
          authLoading={authLoading}
          handleAuthSubmit={handleAuthSubmit}
        />
      )}

      {/* 4. DASHBOARD VIEW */}
      {view === 'DASHBOARD' && (
        <div className="flex min-h-[100dvh] w-full overflow-hidden animate-fade relative z-10">
          
          <Sidebar 
            user={user}
            dashboardTab={dashboardTab}
            setDashboardTab={setDashboardTab}
            mobileSidebarOpen={mobileSidebarOpen}
            setMobileSidebarOpen={setMobileSidebarOpen}
            handleOpenCreateModal={handleOpenCreateModal}
            handleLogout={handleLogout}
          />

          {/* Main Content Area */}
          <main className="flex-1 min-w-0 flex flex-col overflow-y-auto overflow-x-hidden scroll-smooth relative">
            <Header 
              dashboardTab={dashboardTab}
              setMobileSidebarOpen={setMobileSidebarOpen}
              fetchDashboardData={fetchDashboardData}
              handleOpenCreateModal={handleOpenCreateModal}
              isRefreshing={loadingProjects || loadingIncidents}
            />

            {dashboardTab === 'CONSOLE' ? (
              <ConsoleDashboard 
                guideOpen={guideOpen}
                setGuideOpen={setGuideOpen}
                projects={projects}
                loadingProjects={loadingProjects}
                incidents={incidents}
                loadingIncidents={loadingIncidents}
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
                incidentPage={incidentPage}
                setIncidentPage={setIncidentPage}
                INCIDENTS_PER_PAGE={INCIDENTS_PER_PAGE}
                setSelectedIncident={setSelectedIncident}
                getSeverityBadgeClass={getSeverityBadgeClass}
                getStatusBadgeClass={getStatusBadgeClass}
              />
            ) : (
              <Suspense fallback={
                <div className="flex-1 flex items-center justify-center p-12 bg-canvas-white">
                  <div className="flex items-center gap-2 font-apkpraktikal text-xs uppercase tracking-widest text-iron">
                    <Loader2 className="w-4 h-4 animate-spin text-cobalt-spark" />
                    <span>Loading Document Guide...</span>
                  </div>
                </div>
              }>
                {dashboardTab === 'SETUP' ? (
                  <DiscordSetupGuide 
                    globalBot={globalBotInfo} 
                    loading={loadingBotInfo} 
                  />
                ) : dashboardTab === 'GITHUB_SETUP' ? (
                  <GithubSetupGuide />
                ) : (
                  <WebhookSetupGuide />
                )}
              </Suspense>
            )}
          </main>

          {/* PROJECT CREATION MODAL */}
          {showProjectModal && (
            <ProjectModal 
              key={editingProject ? editingProject.id : 'new-project'}
              showProjectModal={showProjectModal}
              setShowProjectModal={setShowProjectModal}
              editingProject={editingProject}
              projName={projName}
              setProjName={setProjName}
              projDesc={projDesc}
              setProjDesc={setProjDesc}
              projGithubOwner={projGithubOwner}
              setProjGithubOwner={setProjGithubOwner}
              projGithubRepo={projGithubRepo}
              setProjGithubRepo={setProjGithubRepo}
              projGithubToken={projGithubToken}
              setProjGithubToken={setProjGithubToken}
              projDiscordChannel={projDiscordChannel}
              setProjDiscordChannel={setProjDiscordChannel}
              projDiscordBotToken={projDiscordBotToken}
              setProjDiscordBotToken={setProjDiscordBotToken}
              projOpenRouterKey={projOpenRouterKey}
              setProjOpenRouterKey={setProjOpenRouterKey}
              projFormError={projFormError}
              setProjFormError={setProjFormError}
              projFormLoading={projFormLoading}
              handleCreateProject={handleCreateProject}
              projLlmProvider={projLlmProvider}
              setProjLlmProvider={setProjLlmProvider}
              projLlmModel={projLlmModel}
              setProjLlmModel={setProjLlmModel}
              projLlmModelsList={projLlmModelsList}
              projLlmCredits={projLlmCredits}
              projLlmVerifying={projLlmVerifying}
              projLlmVerificationError={projLlmVerificationError}
              handleVerifyLlmKey={handleVerifyLlmKey}
            />
          )}

          {/* INCIDENT DETAILS DRAWER */}
          <IncidentDetailsDrawer 
            selectedIncident={selectedIncident}
            setSelectedIncident={setSelectedIncident}
            getSeverityBadgeClass={getSeverityBadgeClass}
            getStatusBadgeClass={getStatusBadgeClass}
            token={token}
            onActionSuccess={fetchDashboardData}
          />

        </div>
      )}

    </div>
  );
}

export default App;
