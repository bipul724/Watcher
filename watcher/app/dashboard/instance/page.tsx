'use client';

import { Button } from "@/components/ui/button";
import { Eye, Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { saveInstanceConfig } from "@/actions/envActions";
import { useRouter } from "next/navigation";

export default function AddInstancePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    instanceName: '',
    port: '',
    openrouterApiKey: '',
    defaultLlmModel: 'google/gemini-flash-1.5',
    pineconeApiKey: '',
    pineconeIndexName: 'guardian-knowledge',
    discordBotToken: '',
    discordChannelId: '',
    githubToken: '',
    githubRepoOwner: '',
    githubRepoName: '',
    prompt: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!formData.instanceName) {
      alert('Please enter an instance name');
      return;
    }

    if (!formData.openrouterApiKey || !formData.pineconeApiKey || 
        !formData.discordBotToken || !formData.githubToken) {
      alert('Please fill in all required API keys');
      return;
    }

    setLoading(true);
    
    try {
      const result = await saveInstanceConfig(formData);
      
      if (result.success) {
        alert('✅ Configuration saved successfully!');
        router.push('/dashboard');
      }
    } catch (error) {
      alert('❌ Error saving configuration: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-3 py-2.5 rounded-md border border-[#c6c6cd] bg-[#f8f9ff] text-[#0b1c30] placeholder-[#76777d] focus:outline-none focus:border-[#4b41e1] focus:ring-2 focus:ring-[#4b41e1]/10 transition-all text-sm";

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] font-sans">
      {/* Navigation */}
      <nav className="border-b border-[#e5eeff] bg-white sticky top-0 z-40">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 group cursor-pointer">
              <div className="w-8 h-8 bg-[#131b2e] rounded-md flex items-center justify-center group-hover:bg-[#0b1c30] transition-colors">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight group-hover:text-[#4b41e1] transition-colors">Watcher</span>
            </Link>
            <span className="ml-6 text-sm text-[#76777d] font-medium">/ Configure Instance</span>
          </div>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-12">
        {/* Back link & Header */}
        <div className="mb-10">
          <Link href="/dashboard" className="inline-flex items-center text-sm text-[#4b41e1] hover:underline transition mb-6 font-medium">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-[30px] font-semibold tracking-tight text-[#0b1c30] mb-2">Configure Instance</h1>
          <p className="text-[#45464d] text-[16px]">Set up the environment configuration for your new Watcher instance.</p>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-[#e5eeff] rounded-lg shadow-[0px_4px_20px_rgba(11,28,48,0.02)] p-8">
          <form onSubmit={handleSubmit} className="space-y-10">

            {/* General Info */}
            <section>
              <h2 className="text-[10px] font-bold tracking-widest uppercase text-[#76777d] mb-6 pb-3 border-b border-[#e5eeff]">General</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#0b1c30] mb-1.5">
                    Instance Name <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="e.g. Production Watcher" 
                    value={formData.instanceName}
                    onChange={(e) => handleChange('instanceName', e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0b1c30] mb-1.5">Port (Optional)</label>
                  <input 
                    type="number" 
                    placeholder="3000" 
                    value={formData.port}
                    onChange={(e) => handleChange('port', e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            </section>

            {/* OpenRouter Config */}
            <section>
              <h2 className="text-[10px] font-bold tracking-widest uppercase text-[#76777d] mb-6 pb-3 border-b border-[#e5eeff]">OpenRouter (LLM Orchestration)</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#0b1c30] mb-1.5">
                    OpenRouter API Key <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <input 
                    type="password" 
                    placeholder="your_openrouter_api_key" 
                    value={formData.openrouterApiKey}
                    onChange={(e) => handleChange('openrouterApiKey', e.target.value)}
                    className={inputClass}
                    autoComplete="off"
                    required
                  />
                  <p className="text-xs text-[#76777d] mt-1.5">
                    Get your key at <a href="https://openrouter.ai/" target="_blank" className="text-[#4b41e1] hover:underline">openrouter.ai</a>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0b1c30] mb-1.5">Default LLM Model</label>
                  <input 
                    type="text" 
                    placeholder="google/gemini-flash-1.5" 
                    value={formData.defaultLlmModel}
                    onChange={(e) => handleChange('defaultLlmModel', e.target.value)}
                    className={inputClass}
                  />
                  <p className="text-xs text-[#76777d] mt-1.5">Recommended: &apos;google/gemini-flash-1.5&apos; or &apos;meta-llama/llama-3-8b&apos;</p>
                </div>
              </div>
            </section>

            {/* Pinecone Config */}
            <section>
              <h2 className="text-[10px] font-bold tracking-widest uppercase text-[#76777d] mb-6 pb-3 border-b border-[#e5eeff]">Pinecone (Vector RAG)</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#0b1c30] mb-1.5">
                    Pinecone API Key <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <input 
                    type="password" 
                    placeholder="your_pinecone_api_key" 
                    value={formData.pineconeApiKey}
                    onChange={(e) => handleChange('pineconeApiKey', e.target.value)}
                    className={inputClass}
                    autoComplete="off"
                    required
                  />
                  <p className="text-xs text-[#76777d] mt-1.5">
                    Get your key at <a href="https://www.pinecone.io/" target="_blank" className="text-[#4b41e1] hover:underline">pinecone.io</a>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0b1c30] mb-1.5">Pinecone Index Name</label>
                  <input 
                    type="text" 
                    placeholder="guardian-knowledge" 
                    value={formData.pineconeIndexName}
                    onChange={(e) => handleChange('pineconeIndexName', e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>
            </section>

            {/* Discord Config */}
            <section>
              <h2 className="text-[10px] font-bold tracking-widest uppercase text-[#76777d] mb-6 pb-3 border-b border-[#e5eeff]">Discord (HITL Interface)</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#0b1c30] mb-1.5">
                    Discord Bot Token <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <input 
                    type="password" 
                    placeholder="your_discord_bot_token" 
                    value={formData.discordBotToken}
                    onChange={(e) => handleChange('discordBotToken', e.target.value)}
                    className={inputClass}
                    autoComplete="off"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0b1c30] mb-1.5">
                    Discord Incident Channel ID <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <input 
                    type="text" 
                    placeholder="your_channel_id" 
                    value={formData.discordChannelId}
                    onChange={(e) => handleChange('discordChannelId', e.target.value)}
                    className={inputClass}
                    required
                  />
                </div>
              </div>
            </section>

            {/* GitHub Config */}
            <section>
              <h2 className="text-[10px] font-bold tracking-widest uppercase text-[#76777d] mb-6 pb-3 border-b border-[#e5eeff]">GitHub (Fix Deployment)</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#0b1c30] mb-1.5">
                    GitHub Personal Access Token <span className="text-[#ba1a1a]">*</span>
                  </label>
                  <input 
                    type="password" 
                    placeholder="your_personal_access_token" 
                    value={formData.githubToken}
                    onChange={(e) => handleChange('githubToken', e.target.value)}
                    className={inputClass}
                    autoComplete="off"
                    required
                  />
                  <p className="text-xs text-[#76777d] mt-1.5">
                    Generate at <a href="https://github.com/settings/tokens" target="_blank" className="text-[#4b41e1] hover:underline">GitHub Settings → Tokens</a>
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#0b1c30] mb-1.5">
                      Repo Owner <span className="text-[#ba1a1a]">*</span>
                    </label>
                    <input 
                      type="text" 
                      placeholder="your_github_username" 
                      value={formData.githubRepoOwner}
                      onChange={(e) => handleChange('githubRepoOwner', e.target.value)}
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0b1c30] mb-1.5">
                      Repo Name <span className="text-[#ba1a1a]">*</span>
                    </label>
                    <input 
                      type="text" 
                      placeholder="your_repo_name" 
                      value={formData.githubRepoName}
                      onChange={(e) => handleChange('githubRepoName', e.target.value)}
                      className={inputClass}
                      required
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Custom Prompt Config */}
            <section>
              <h2 className="text-[10px] font-bold tracking-widest uppercase text-[#76777d] mb-6 pb-3 border-b border-[#e5eeff]">Watcher Custom Instructions</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#0b1c30] mb-1.5">
                    System Prompt <span className="text-[#76777d] text-xs font-normal ml-1">(Optional)</span>
                  </label>
                  <textarea 
                    placeholder="Enter custom instructions for how the AI should behave..." 
                    value={formData.prompt}
                    onChange={(e) => handleChange('prompt', e.target.value)}
                    className={`${inputClass} h-32 resize-y`}
                  />
                  <p className="text-xs text-[#76777d] mt-1.5">
                    Provide specific context, coding guidelines, or rules you want the Watcher agent to follow when fixing bugs for this instance.
                  </p>
                </div>
              </div>
            </section>

            {/* Security Notice */}
            <div className="p-4 rounded-md bg-[#eff4ff] border border-[#dce9ff]">
              <p className="text-sm text-[#0b1c30] font-medium flex items-center gap-2">
                <span>🔒</span> All API keys are encrypted before storage and never exposed in logs or client code.
              </p>
            </div>

            {/* Actions */}
            <div className="pt-6 flex justify-end gap-4 border-t border-[#e5eeff]">
              <Link href="/dashboard">
                <Button variant="ghost" type="button" className="text-[#45464d] hover:text-[#0b1c30] hover:bg-[#f8f9ff]">Cancel</Button>
              </Link>
              <Button 
                type="submit" 
                className="bg-[#131b2e] hover:bg-[#0b1c30] text-white flex items-center gap-2 rounded-md px-6"
                disabled={loading}
              >
                {loading ? (
                  <>Saving...</>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Save Configuration
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}