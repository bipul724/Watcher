import { useState } from 'react';
import { ChevronDown, ChevronRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProjectModal({
  showProjectModal,
  setShowProjectModal,
  editingProject,
  projName,
  projDesc,
  projGithubOwner,
  projGithubRepo,
  projGithubToken,
  projDiscordChannel,
  projDiscordBotToken,
  projOpenRouterKey,
  projFormError,
  setProjFormError,
  projFormLoading,
  handleCreateProject,
  projLlmProvider,
  projLlmModel,
  projLlmModelsList,
  projLlmCredits,
  projLlmVerifying,
  projLlmVerificationError,
  handleVerifyLlmKey
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Eye toggle states for password/token fields
  const [showGithubToken, setShowGithubToken] = useState(false);
  const [showDiscordBotToken, setShowDiscordBotToken] = useState(false);
  const [showOpenRouterKey, setShowOpenRouterKey] = useState(false);

  // Local state to prevent lag on keystroke
  const [name, setName] = useState(projName || '');
  const [desc, setDesc] = useState(projDesc || '');
  const [githubOwner, setGithubOwner] = useState(projGithubOwner || '');
  const [githubRepo, setGithubRepo] = useState(projGithubRepo || '');
  const [githubToken, setGithubToken] = useState(projGithubToken || '');
  const [discordChannel, setDiscordChannel] = useState(projDiscordChannel || '');
  const [discordBotToken, setDiscordBotToken] = useState(projDiscordBotToken || '');
  const [openRouterKey, setOpenRouterKey] = useState(projOpenRouterKey || '');
  const [llmProvider, setLlmProvider] = useState(projLlmProvider || 'OPENROUTER');
  const [llmModel, setLlmModel] = useState(projLlmModel || '');

  // Adjust local state when parent LLM model changes (e.g. from key verification loaded defaults)
  const [prevProjLlmModel, setPrevProjLlmModel] = useState(projLlmModel);
  if (projLlmModel !== prevProjLlmModel) {
    setPrevProjLlmModel(projLlmModel);
    setLlmModel(projLlmModel || '');
  }

  // Adjust local state when parent LLM provider changes
  const [prevProjLlmProvider, setPrevProjLlmProvider] = useState(projLlmProvider);
  if (projLlmProvider !== prevProjLlmProvider) {
    setPrevProjLlmProvider(projLlmProvider);
    setLlmProvider(projLlmProvider || 'OPENROUTER');
  }

  if (!showProjectModal) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    handleCreateProject(e, {
      name,
      description: desc,
      github_owner: githubOwner,
      github_repo: githubRepo,
      github_token: githubToken,
      discord_channel_id: discordChannel,
      discord_bot_token: discordBotToken,
      openrouter_key: openRouterKey,
      llm_provider: llmProvider,
      llm_model: llmModel
    });
  };

  const renderError = (errorText) => {
    if (!errorText) return null;
    
    const blocks = errorText.split('\n\n').filter(Boolean);
    
    return (
      <div className="flex flex-col gap-3 px-8 pt-4 pb-0 shrink-0">
        {blocks.map((block, idx) => {
          const issueMatch = block.match(/Issue:\s*(.*)/i);
          const solutionMatch = block.match(/Solution:\s*(.*)/i);
          
          if (issueMatch || solutionMatch) {
            const issue = issueMatch ? issueMatch[1] : '';
            const solution = solutionMatch ? solutionMatch[1] : '';
            
            return (
              <div key={idx} className="bg-danger/5 border-l-4 border-danger p-4 rounded-r-lg text-left text-xs font-sans">
                {issue && (
                  <div className="mb-2 flex flex-col gap-0.5">
                    <span className="font-apkpraktikal font-bold text-danger uppercase tracking-widest text-[9px] bg-danger/10 px-1.5 py-0.5 rounded w-max">Issue</span>
                    <span className="font-apk-galeria text-carbon-ink font-medium mt-0.5">{issue}</span>
                  </div>
                )}
                {solution && (
                  <div className="flex flex-col gap-0.5 mt-1.5">
                    <span className="font-apkpraktikal font-bold text-success uppercase tracking-widest text-[9px] bg-success/10 px-1.5 py-0.5 rounded w-max">Solution</span>
                    <span className="font-apk-galeria text-iron font-medium mt-0.5">{solution}</span>
                  </div>
                )}
              </div>
            );
          }
          
          return (
            <div key={idx} className="bg-danger/10 border border-danger/20 text-danger font-apk-galeria text-[13px] p-3 rounded-md text-center font-medium">
              {block}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-hidden">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-carbon-ink/15 backdrop-blur-xs"
        onClick={() => { setShowProjectModal(false); setProjFormError(''); }}
      ></motion.div>
      
      {/* Modal Container */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        className="bg-canvas-white border border-ash rounded-xl w-full max-w-[600px] overflow-hidden flex flex-col max-h-[92dvh] text-left z-10 min-w-0"
      >
        <div className="px-5 sm:px-8 py-5 sm:py-6 border-b border-ash flex justify-between items-center gap-4 bg-canvas-white shrink-0 min-w-0">
          <div>
            {/* Eyebrow */}
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cobalt-spark"></span>
              <span className="font-apkpraktikal text-[9px] font-bold uppercase text-iron tracking-widest">ONBOARDING GATE</span>
            </div>

            <h2 className="font-apk-galeria text-lg sm:text-xl font-medium m-0 text-carbon-ink break-words">
              {editingProject ? 'Edit Project Credentials' : 'Onboard New Project'}
            </h2>
            <p className="font-apk-galeria text-xs text-iron mt-1">
              {editingProject 
                ? 'Modify your repository and alert integration parameters.' 
                : 'Configure your repository and alert endpoints to start monitoring.'}
            </p>
          </div>
          <button 
            type="button"
            className="bg-transparent border border-ash text-slate hover:text-carbon-ink w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-colors" 
            onClick={() => { setShowProjectModal(false); setProjFormError(''); }}
          >
            &times;
          </button>
        </div>

        {renderError(projFormError)}
        
        <form onSubmit={handleSubmit} className="px-5 sm:px-8 py-5 sm:py-6 overflow-y-auto overflow-x-hidden text-left max-h-[calc(92dvh-120px)] flex-1 min-w-0">
          {/* Required Configuration */}
          <div className="flex items-center gap-2 mb-4 pb-1 border-b border-dashed border-ash">
            <span className="w-1.5 h-1.5 rounded-full bg-cobalt-spark"></span>
            <span className="font-apkpraktikal text-[9px] font-bold tracking-widest text-carbon-ink uppercase">Required Settings</span>
          </div>
          
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex flex-col gap-2 text-left">
              <label className="font-apkpraktikal text-[10px] font-bold text-iron uppercase tracking-widest">Project / Service Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="e.g. Production Analytics API" 
                required 
                className="bg-mist border border-ash rounded-lg px-4 py-3 text-sm text-carbon-ink outline-none transition-all duration-200 focus:ring-1 focus:ring-cobalt-spark focus:border-cobalt-spark w-full font-sans"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex flex-col gap-2 text-left flex-1">
              <label className="font-apkpraktikal text-[10px] font-bold text-iron uppercase tracking-widest">GitHub Owner</label>
              <input 
                type="text" 
                value={githubOwner} 
                onChange={(e) => setGithubOwner(e.target.value)} 
                placeholder="org-or-username" 
                required 
                className="bg-mist border border-ash rounded-lg px-4 py-3 text-sm text-carbon-ink outline-none transition-all duration-200 focus:ring-1 focus:ring-cobalt-spark focus:border-cobalt-spark w-full font-sans"
              />
            </div>
            <div className="flex flex-col gap-2 text-left flex-1">
              <label className="font-apkpraktikal text-[10px] font-bold text-iron uppercase tracking-widest">GitHub Repo Name</label>
              <input 
                type="text" 
                value={githubRepo} 
                onChange={(e) => setGithubRepo(e.target.value)} 
                placeholder="repo-slug" 
                required 
                className="bg-mist border border-ash rounded-lg px-4 py-3 text-sm text-carbon-ink outline-none transition-all duration-200 focus:ring-1 focus:ring-cobalt-spark focus:border-cobalt-spark w-full font-sans"
              />
            </div>
          </div>

          <div className="flex flex-col gap-4 mb-4">
            <div className="flex flex-col gap-2 text-left">
              <label className="font-apkpraktikal text-[10px] font-bold text-iron uppercase tracking-widest">GitHub PAT Token</label>
              <div className="relative w-full">
                <input 
                  type={showGithubToken ? "text" : "password"} 
                  value={githubToken} 
                  onChange={(e) => setGithubToken(e.target.value)} 
                  placeholder="ghp_xxxxxxxxxxxx (Requires repo scopes)" 
                  required 
                  className="bg-mist border border-ash rounded-lg pl-4 pr-10 py-3 text-sm text-carbon-ink outline-none transition-all duration-200 focus:ring-1 focus:ring-cobalt-spark focus:border-cobalt-spark w-full font-sans"
                />
                <button
                  type="button"
                  onClick={() => setShowGithubToken(!showGithubToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none text-slate hover:text-carbon-ink cursor-pointer flex items-center justify-center p-1 outline-none transition-colors"
                >
                  {showGithubToken ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 mb-4">
            <div className="flex flex-col gap-2 text-left">
              <label className="font-apkpraktikal text-[10px] font-bold text-iron uppercase tracking-widest">Discord Incident Channel ID</label>
              <input 
                type="text" 
                value={discordChannel} 
                onChange={(e) => setDiscordChannel(e.target.value)} 
                placeholder="e.g. 1122334455" 
                required 
                className="bg-mist border border-ash rounded-lg px-4 py-3 text-sm text-carbon-ink outline-none transition-all duration-200 focus:ring-1 focus:ring-cobalt-spark focus:border-cobalt-spark w-full font-sans"
              />
            </div>
          </div>

          {/* Advanced / Optional Configurations */}
          <div className="mt-6 border border-ash rounded-xl overflow-hidden bg-mist/30">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between px-5 py-4 bg-mist hover:bg-mist/70 transition-colors text-left border-none outline-none cursor-pointer"
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-apkpraktikal text-[10px] font-bold text-carbon-ink uppercase tracking-widest">Advanced Configuration</span>
                <span className="font-apk-galeria text-[11px] text-iron font-medium">Configure custom models, keys, and bot integrations</span>
              </div>
              <div className="text-slate">
                {showAdvanced ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </div>
            </button>

            {showAdvanced && (
              <div className="px-5 py-5 border-t border-ash bg-canvas-white flex flex-col gap-4">
                <div className="flex flex-col gap-2 text-left">
                  <label className="font-apkpraktikal text-[10px] font-bold text-iron uppercase tracking-widest">Discord Bot Token (Optional)</label>
                  <div className="relative w-full">
                    <input 
                      type={showDiscordBotToken ? "text" : "password"} 
                      value={discordBotToken || ''} 
                      onChange={(e) => setDiscordBotToken(e.target.value)} 
                      placeholder="Falls back to global server bot if empty" 
                      className="bg-mist border border-ash rounded-lg pl-4 pr-10 py-3 text-sm text-carbon-ink outline-none transition-all duration-200 focus:ring-1 focus:ring-cobalt-spark focus:border-cobalt-spark w-full font-sans"
                    />
                    <button
                      type="button"
                      onClick={() => setShowDiscordBotToken(!showDiscordBotToken)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none text-slate hover:text-carbon-ink cursor-pointer flex items-center justify-center p-1 outline-none transition-colors"
                    >
                      {showDiscordBotToken ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="border-t border-ash my-2"></div>

                <div className="flex flex-col gap-2 text-left w-full">
                  <label className="font-apkpraktikal text-[10px] font-bold text-iron uppercase tracking-widest">LLM Provider</label>
                  <select
                    value={llmProvider}
                    onChange={(e) => setLlmProvider(e.target.value)}
                    className="bg-mist border border-ash rounded-lg px-4 py-3 text-sm text-carbon-ink outline-none transition-all duration-200 focus:ring-1 focus:ring-cobalt-spark focus:border-cobalt-spark w-full font-sans"
                  >
                    <option value="OPENROUTER">OpenRouter (Unified API Gateway)</option>
                    <option value="OPENAI">OpenAI (Direct API Key)</option>
                    <option value="ANTHROPIC">Anthropic Claude (Direct API Key)</option>
                    <option value="GEMINI">Google Gemini (Direct API Key)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-2 text-left">
                  <label className="font-apkpraktikal text-[10px] font-bold text-iron uppercase tracking-widest">
                    {llmProvider === 'OPENROUTER' ? 'OpenRouter API Key (Optional)' :
                     llmProvider === 'OPENAI' ? 'OpenAI Secret Key (Optional)' :
                     llmProvider === 'ANTHROPIC' ? 'Anthropic API Key (Optional)' :
                     'Google AI Studio API Key (Optional)'}
                  </label>
                  <div className="flex gap-2 w-full">
                    <div className="relative flex-1">
                      <input 
                        type={showOpenRouterKey ? "text" : "password"} 
                        value={openRouterKey || ''} 
                        onChange={(e) => setOpenRouterKey(e.target.value)} 
                        placeholder="Falls back to system-wide fallbacks if empty" 
                        className="bg-mist border border-ash rounded-lg pl-4 pr-10 py-3 text-sm text-carbon-ink outline-none transition-all duration-200 focus:ring-1 focus:ring-cobalt-spark focus:border-cobalt-spark w-full font-sans"
                      />
                      <button
                        type="button"
                        onClick={() => setShowOpenRouterKey(!showOpenRouterKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none text-slate hover:text-carbon-ink cursor-pointer flex items-center justify-center p-1 outline-none transition-colors"
                      >
                        {showOpenRouterKey ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleVerifyLlmKey(llmProvider, openRouterKey)}
                      disabled={projLlmVerifying}
                      className="bg-mist hover:bg-mist/80 text-carbon-ink border border-ash rounded-lg px-4 py-2 text-xs font-apkpraktikal uppercase tracking-widest shrink-0 cursor-pointer active:scale-95 duration-150 transition-all disabled:opacity-50 w-full sm:w-auto"
                    >
                      {projLlmVerifying ? 'Verifying...' : 'Verify Key'}
                    </button>
                  </div>
                </div>

                {projLlmVerificationError && (
                  <div className="bg-danger/10 border border-danger/20 rounded-lg p-3 text-xs text-danger text-left font-semibold">
                    ❌ {projLlmVerificationError}
                  </div>
                )}

                {projLlmCredits && (
                  <div className="bg-success/15 border border-success/30 rounded-lg p-3 text-xs text-success text-left font-semibold flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                      <span>Key Verified: <strong>{projLlmCredits.label || 'Active'}</strong></span>
                    </div>
                    {projLlmCredits.usage !== undefined && (
                      <span className="text-[10px] text-iron font-medium ml-3">
                        Usage: ${Number(projLlmCredits.usage).toFixed(4)} {projLlmCredits.limit_remaining !== null ? `| Credits: $${Number(projLlmCredits.limit_remaining).toFixed(4)}` : ''}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex flex-col gap-2 text-left w-full">
                  <label className="font-apkpraktikal text-[10px] font-bold text-iron uppercase tracking-widest">Target Model</label>
                  {projLlmModelsList && projLlmModelsList.length > 0 ? (
                    <select
                      value={llmModel}
                      onChange={(e) => setLlmModel(e.target.value)}
                      className="bg-mist border border-ash rounded-lg px-4 py-3 text-sm text-carbon-ink outline-none transition-all duration-200 focus:ring-1 focus:ring-cobalt-spark focus:border-cobalt-spark w-full font-sans"
                    >
                      {projLlmModelsList.map((m) => (
                        <option key={m.id} value={m.id}>{m.name || m.id}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={llmModel}
                      onChange={(e) => setLlmModel(e.target.value)}
                      placeholder="Enter model slug (e.g. google/gemini-2.5-flash)"
                      className="bg-mist border border-ash rounded-lg px-4 py-3 text-sm text-carbon-ink outline-none transition-all duration-200 focus:ring-1 focus:ring-cobalt-spark focus:border-cobalt-spark w-full font-sans"
                    />
                  )}
                  <span className="font-apk-galeria text-[11px] text-slate">
                    {projLlmModelsList && projLlmModelsList.length > 0
                      ? 'Successfully loaded models from API.'
                      : 'Enter a custom model identifier or verify your API key above.'}
                  </span>
                </div>

                <div className="border-t border-ash my-2"></div>

                <div className="flex flex-col gap-2 text-left">
                  <label className="font-apkpraktikal text-[10px] font-bold text-iron uppercase tracking-widest">Custom Runbook preferences (Optional)</label>
                  <input 
                    type="text" 
                    value={desc} 
                    onChange={(e) => setDesc(e.target.value)} 
                    placeholder="e.g. Run setup scripts before testing patches" 
                    className="bg-mist border border-ash rounded-lg px-4 py-3 text-sm text-carbon-ink outline-none transition-all duration-200 focus:ring-1 focus:ring-cobalt-spark focus:border-cobalt-spark w-full font-sans"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8 shrink-0">
            {/* Cancel Button - Outline/text styling */}
            <button 
              type="button" 
              className="bg-transparent text-iron border border-ash rounded-full px-5 py-2.5 font-apkpraktikal text-xs font-bold uppercase tracking-widest cursor-pointer transition-all duration-150 hover:bg-mist w-full sm:w-auto" 
              onClick={() => { setShowProjectModal(false); setProjFormError(''); }}
            >
              Cancel
            </button>
            
            {/* Submit Button - Secondary Black CTA equivalent */}
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit" 
              className="bg-carbon-ink text-canvas-white border border-none rounded-full px-6 py-2.5 font-apkpraktikal text-xs font-bold uppercase tracking-widest cursor-pointer transition-all duration-150 disabled:opacity-60 flex items-center justify-center gap-1.5 w-full sm:w-auto" 
              disabled={projFormLoading}
            >
              {projFormLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-lime-glow" />
                  <span>{editingProject ? 'Saving...' : 'Configuring...'}</span>
                </>
              ) : (
                <span>{editingProject ? 'Save Changes' : 'Activate Webhook'}</span>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
