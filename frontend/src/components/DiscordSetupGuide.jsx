import { useState } from 'react';
import { Eye, Cpu, Plus, ExternalLink, Check, Copy, CheckCircle2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DiscordSetupGuide({ globalBot, loading }) {
  const [copiedLink, setCopiedLink] = useState(false);
  const inviteUrlPlaceholder = "https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=397284485184&scope=bot";

  const inviteUrl = globalBot?.isActive
    ? `https://discord.com/api/oauth2/authorize?client_id=${globalBot.clientId}&permissions=397284485184&scope=bot`
    : inviteUrlPlaceholder;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 md:px-8 py-6 text-left min-h-0 bg-canvas-white">
      <div className="max-w-[900px] mx-auto bg-canvas-white border border-ash rounded-xl p-6 md:p-8">
        
        {/* Banner header styled as Ice Blue Feature Panel / Tinted Card */}
        <div className="bg-ice-blue rounded-cards p-6 md:p-8 mb-8 relative overflow-hidden">
          <div className="relative z-10 text-left">
            {/* Eyebrow */}
            <div className="flex items-center gap-1.5 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cobalt-spark"></span>
              <span className="font-apkpraktikal text-[9px] font-bold uppercase text-iron tracking-widest">INTEGRATIONS SETUP</span>
            </div>
            
            <h2 className="font-apk-galeria text-2xl font-medium text-carbon-ink mb-2">
              Discord Bot Integration
            </h2>
            <p className="font-apk-galeria text-sm text-iron max-w-[650px] leading-relaxed m-0">
              To request fixes and get real-time approvals (HITL - Human-in-the-Loop) directly inside your Discord servers, you must configure a Discord Bot Token and Channel ID for your project. Follow these quick steps to get set up.
            </p>
          </div>
          <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-5 pointer-events-none flex items-center justify-center">
            <Eye className="w-48 h-48" />
          </div>
        </div>

        {/* Global Shared Bot helper card */}
        {loading ? (
          <div className="h-[96px] rounded-cards mb-8 bg-mist border border-ash flex items-center justify-center text-xs text-iron font-apkpraktikal uppercase tracking-wider gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-cobalt-spark" />
            <span>Retrieving shared bot...</span>
          </div>
        ) : globalBot?.isActive ? (
          <div className="bg-mist border border-ash rounded-cards p-5 md:p-6 mb-8 text-left flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-11 h-11 rounded-full bg-carbon-ink flex items-center justify-center text-canvas-white shrink-0 relative border border-ash">
                {globalBot.avatar ? (
                  <img src={globalBot.avatar} alt="Bot Avatar" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <Cpu className="w-5 h-5 text-lime-glow stroke-[1.5px]" />
                )}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-success border border-canvas-white rounded-full"></span>
              </div>
              <div className="min-w-0 text-left">
                <span className="font-apkpraktikal text-[8px] font-bold text-cobalt-spark uppercase tracking-widest block mb-0.5">Shared Global Bot Ready</span>
                <h4 className="font-apk-galeria m-0 text-base font-semibold text-carbon-ink truncate">{globalBot.username}</h4>
                <p className="font-apk-galeria m-0 text-xs text-iron leading-relaxed">
                  You can use the platform's shared bot. Simply invite the bot and configure your channel ID.
                </p>
              </div>
            </div>
            
            {/* Invite button - Secondary black CTA */}
            <motion.a
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              href={inviteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center gap-2 bg-carbon-ink text-canvas-white border-none rounded-full px-5 py-2.5 font-apkpraktikal text-[10px] font-bold uppercase tracking-widest cursor-pointer no-underline"
            >
              <Plus className="w-3.5 h-3.5 text-lime-glow" /> Invite Bot
            </motion.a>
          </div>
        ) : null}

        {/* Steps */}
        <div className="flex flex-col gap-6">
          
          {/* Step 1 */}
          <div className="flex gap-4 md:gap-6 border-b border-ash pb-6 text-left">
            <div className="w-8 h-8 rounded-full bg-mist border border-ash flex items-center justify-center font-apkpraktikal text-xs font-bold text-carbon-ink shrink-0">
              1
            </div>
            <div className="flex-1">
              <h3 className="font-apk-galeria text-base font-semibold text-carbon-ink mb-2">Create a Discord Application</h3>
              <p className="font-apk-galeria text-sm text-iron leading-relaxed mb-3">
                Go to the <a href="https://discord.com/developers/applications" target="_blank" rel="noopener noreferrer" className="text-cobalt-spark font-medium hover:underline inline-flex items-center gap-1">Discord Developer Portal <ExternalLink className="w-3.5 h-3.5 text-cobalt-spark" /></a> and log in with your Discord credentials.
              </p>
              <ul className="list-disc pl-5 font-apk-galeria text-sm text-iron space-y-1.5 leading-relaxed">
                <li>Click on the <strong>New Application</strong> button at the top right.</li>
                <li>Enter a name for your bot (e.g. <code>WatcherAgent Core</code>) and click <strong>Create</strong>.</li>
              </ul>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-4 md:gap-6 border-b border-ash pb-6 text-left">
            <div className="w-8 h-8 rounded-full bg-mist border border-ash flex items-center justify-center font-apkpraktikal text-xs font-bold text-carbon-ink shrink-0">
              2
            </div>
            <div className="flex-1">
              <h3 className="font-apk-galeria text-base font-semibold text-carbon-ink mb-2">Configure Bot & Retrieve Token</h3>
              <p className="font-apk-galeria text-sm text-iron leading-relaxed mb-3">
                In your Application dashboard, navigate to the <strong>Bot</strong> tab on the left sidebar:
              </p>
              <ul className="list-disc pl-5 font-apk-galeria text-sm text-iron space-y-2 leading-relaxed">
                <li>Click <strong>Add Bot</strong> to turn your application into a bot.</li>
                <li>Under the <strong>Token</strong> section, click <strong>Reset Token</strong> to reveal your bot token. Copy this token immediately and save it somewhere secure. This is your <code>Discord Bot Token</code>.</li>
                <li>
                  Scroll down to the <strong>Privileged Gateway Intents</strong> section and enable:
                  <div className="flex flex-col gap-1.5 mt-2 bg-mist border border-ash rounded-lg p-3 max-w-[400px]">
                    <span className="font-apkpraktikal text-[10px] font-bold text-carbon-ink flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-success" /> Guild Members Intent
                    </span>
                    <span className="font-apkpraktikal text-[10px] font-bold text-carbon-ink flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-success" /> Message Content Intent
                    </span>
                  </div>
                </li>
                <li>Click <strong>Save Changes</strong> at the bottom.</li>
              </ul>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-4 md:gap-6 border-b border-ash pb-6 text-left">
            <div className="w-8 h-8 rounded-full bg-mist border border-ash flex items-center justify-center font-apkpraktikal text-xs font-bold text-carbon-ink shrink-0">
              3
            </div>
            <div className="flex-1">
              <h3 className="font-apk-galeria text-base font-semibold text-carbon-ink mb-2">Invite the Bot to your Server</h3>
              <p className="font-apk-galeria text-sm text-iron leading-relaxed mb-3">
                Generate the invite link to authorize the bot on your target server:
              </p>
              <ul className="list-disc pl-5 font-apk-galeria text-sm text-iron space-y-2 leading-relaxed mb-4">
                <li>Go to the <strong>OAuth2</strong> tab, and click <strong>URL Generator</strong> under it.</li>
                <li>Under <strong>Scopes</strong>, check the <code>bot</code> box.</li>
                <li>Under <strong>Bot Permissions</strong>, select the following permissions:
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 mt-2 font-apk-galeria text-xs text-iron max-w-[500px]">
                    <span className="flex items-center gap-1.5"><Check className="w-3 h-3 text-cobalt-spark" /> Send Messages</span>
                    <span className="flex items-center gap-1.5"><Check className="w-3 h-3 text-cobalt-spark" /> Create Public Threads</span>
                    <span className="flex items-center gap-1.5"><Check className="w-3 h-3 text-cobalt-spark" /> Send Messages in Threads</span>
                    <span className="flex items-center gap-1.5"><Check className="w-3 h-3 text-cobalt-spark" /> Embed Links</span>
                    <span className="flex items-center gap-1.5"><Check className="w-3 h-3 text-cobalt-spark" /> Read Message History</span>
                  </div>
                </li>
                <li>Copy the generated URL at the bottom and open it in a new browser tab to add the bot to your server.</li>
              </ul>
              
              {/* Invite panel */}
              <div className="bg-mist border border-ash rounded-cards p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="min-w-0 flex-1 text-left">
                  <span className="font-apkpraktikal text-[9px] font-bold text-carbon-ink uppercase tracking-widest block mb-1">
                    {globalBot?.isActive ? 'Global Bot Invite Link' : 'Standard Invite URL'}
                  </span>
                  <code className="text-xs break-all block text-iron font-mono">{inviteUrl}</code>
                </div>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="shrink-0 flex items-center gap-1.5 bg-carbon-ink text-canvas-white border-none rounded-full px-4 py-2 font-apkpraktikal text-[10px] font-bold uppercase tracking-widest cursor-pointer transition-all duration-150"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-lime-glow" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedLink ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex gap-4 md:gap-6 border-b border-ash pb-6 text-left">
            <div className="w-8 h-8 rounded-full bg-mist border border-ash flex items-center justify-center font-apkpraktikal text-xs font-bold text-carbon-ink shrink-0">
              4
            </div>
            <div className="flex-1">
              <h3 className="font-apk-galeria text-base font-semibold text-carbon-ink mb-2">Get Discord Channel ID</h3>
              <p className="font-apk-galeria text-sm text-iron leading-relaxed">
                Now open the Discord client:
              </p>
              <ul className="list-disc pl-5 font-apk-galeria text-sm text-iron space-y-1.5 leading-relaxed mt-2">
                <li>Go to <strong>User Settings</strong> → <strong>Advanced</strong>, and toggle <strong>Developer Mode</strong> ON.</li>
                <li>Right-click on the specific channel in your server where alerts should be posted, and select <strong>Copy Channel ID</strong>.</li>
              </ul>
            </div>
          </div>

          {/* Step 5 */}
          <div className="flex gap-4 md:gap-6 text-left">
            <div className="w-8 h-8 rounded-full bg-mist border border-ash flex items-center justify-center font-apkpraktikal text-xs font-bold text-carbon-ink shrink-0">
              5
            </div>
            <div className="flex-1">
              <h3 className="font-apk-galeria text-base font-semibold text-carbon-ink mb-2">Update Project Settings</h3>
              <p className="font-apk-galeria text-sm text-iron leading-relaxed">
                Return to the <strong>Console Dashboard</strong> tab on the left sidebar:
              </p>
              <ul className="list-disc pl-5 font-apk-galeria text-sm text-iron space-y-1.5 leading-relaxed mt-2">
                <li>Create a new project or edit your existing project.</li>
                <li>Paste the <strong>Discord Channel ID</strong> and your copied <strong>Discord Bot Token</strong> into the respective fields.</li>
                <li>Click <strong>Save Changes</strong> to activate.</li>
              </ul>
            </div>
          </div>

        </div>

        {/* Tip Box */}
        <div className="mt-8 bg-mist border border-ash rounded-cards p-5 text-left flex gap-4">
          <div className="p-2 bg-canvas-white rounded-full text-carbon-ink h-fit shrink-0 border border-ash">
            <Eye className="w-4 h-4 text-cobalt-spark" />
          </div>
          <div className="text-left">
            <h4 className="font-apk-galeria m-0 mb-1 text-sm font-semibold text-carbon-ink">Graceful Fallback Mode</h4>
            <p className="font-apk-galeria m-0 text-xs text-iron leading-relaxed">
              If you leave the <strong>Discord Bot Token</strong> empty in your project settings, the server will default to using the global bot configured in the system environment (if one exists). This allows administrators to set up one bot for all users, or let users configure their own bots for complete isolation!
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
