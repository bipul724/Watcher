import { useState } from 'react';
import { Settings, Zap, AlertTriangle, Check, Copy } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WebhookSetupGuide() {
  const [copiedLink, setCopiedLink] = useState(false);
  const sampleSecret = "wh_b78e89f81ca90bd847ef89dc7e36ad18";
  
  const getSampleWebhookUrl = () => {
    const origin = window.location.origin;
    const apiBase = origin.includes('localhost') ? 'http://localhost:3001' : origin;
    return `${apiBase}/api/v1/webhook/${sampleSecret}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(getSampleWebhookUrl());
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
              <span className="font-apkpraktikal text-[9px] font-bold uppercase text-iron tracking-widest">INGESTION ENDPOINTS</span>
            </div>
            
            <h2 className="font-apk-galeria text-2xl font-medium text-carbon-ink mb-2">
              Webhook Ingestion Setup
            </h2>
            <p className="font-apk-galeria text-sm text-iron max-w-[650px] leading-relaxed m-0">
              Watcher Agent listens to incident alerts and triggers automated remediation runs using HTTP webhook payloads. Set up webhooks in your monitoring and hosting platforms to start auto-healing alerts.
            </p>
          </div>
          <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-5 pointer-events-none flex items-center justify-center">
            <Zap className="w-48 h-48" />
          </div>
        </div>

        {/* Mandatory Setup Warning */}
        <div className="bg-danger/5 border-l-4 border-danger rounded-r-cards p-5 mb-6 text-left flex gap-4">
          <div className="p-1.5 bg-danger/10 rounded-full text-danger h-fit shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-left flex-1">
            <h4 className="m-0 mb-1 font-apkpraktikal text-[10px] font-bold text-carbon-ink uppercase tracking-widest">Mandatory Requirement</h4>
            <p className="m-0 font-apk-galeria text-xs text-iron leading-relaxed font-medium">
              You must set up the project webhook inside your production application, deployment pipeline, or incident management console. <strong>The Watcher Agent cannot detect problems on its own; it relies entirely on a successful webhook payload delivery to trigger remediation.</strong>
            </p>
          </div>
        </div>

        {/* Memory Recall Accuracy Tip */}
        <div className="bg-mist border border-ash rounded-cards p-5 mb-8 text-left flex gap-4">
          <div className="p-1.5 bg-canvas-white border border-ash rounded-full text-carbon-ink h-fit shrink-0">
            <Settings className="w-4 h-4 text-cobalt-spark" />
          </div>
          <div className="text-left flex-1">
            <h4 className="m-0 mb-1 font-apkpraktikal text-[10px] font-bold text-carbon-ink uppercase tracking-widest">Maximizing Agent Accuracy</h4>
            <p className="m-0 font-apk-galeria text-xs text-iron leading-relaxed">
              To drastically improve the agent's code fixing accuracy, make sure your webhook logs or payloads contain the **recall trace** (error signature, stack trace, and root frames). Including these details allows the Watcher Agent's Pinecone vector engine to perform precision memory recall matching, helping it identify the correct historical fix.
            </p>
          </div>
        </div>

        {/* Webhook Endpoint Box */}
        <h3 className="font-apk-galeria text-base font-semibold text-carbon-ink mb-2">Your Webhook URL Format</h3>
        <p className="font-apk-galeria text-sm text-iron leading-relaxed mb-4">
          Each project generates a secure, unique <code>webhook_secret</code> during creation. You can find this secret key directly on your project card in the Console Dashboard. The endpoint accepts POST requests in the following format:
        </p>
        <div className="bg-mist border border-ash rounded-cards p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="min-w-0 flex-1 text-left">
            <span className="font-apkpraktikal text-[9px] font-bold text-carbon-ink uppercase tracking-widest block mb-1">PROJECT WEBHOOK ENDPOINT</span>
            <code className="text-xs break-all block text-iron font-mono bg-canvas-white px-2 py-1.5 rounded border border-ash/40">{getSampleWebhookUrl()}</code>
          </div>
          
          {/* Copy Button - Pill shaped Carbon Ink CTA */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleCopyLink}
            className="shrink-0 flex items-center gap-1.5 bg-carbon-ink text-canvas-white border-none rounded-full px-5 py-2.5 font-apkpraktikal text-[10px] font-bold uppercase tracking-widest cursor-pointer transition-all duration-150"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-lime-glow" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedLink ? 'Copied' : 'Copy URL'}
          </motion.button>
        </div>

        {/* Integration examples heading */}
        <div className="flex items-center gap-2 mb-6 pb-2 border-b border-ash mt-4">
          <span className="w-1.5 h-1.5 rounded-full bg-cobalt-spark"></span>
          <span className="font-apkpraktikal text-[10px] font-bold tracking-widest text-carbon-ink uppercase">Integration Examples</span>
        </div>

        <div className="flex flex-col gap-6">

          {/* Example 1: PagerDuty */}
          <div className="text-left border-b border-ash pb-6">
            <h4 className="font-apk-galeria text-base font-semibold text-carbon-ink mb-2">
              PagerDuty / Incident Alert Managers
            </h4>
            <p className="font-apk-galeria text-sm text-iron leading-relaxed mb-3">
              Route alerts through PagerDuty to automatically trigger the auto-healer whenever an incident is triggered on a service:
            </p>
            <ol className="list-decimal pl-5 font-apk-galeria text-xs text-iron space-y-1.5 leading-relaxed">
              <li>In PagerDuty, navigate to <strong>Services</strong> → <strong>Service Directory</strong> and select your service.</li>
              <li>Click the <strong>Integrations</strong> tab, and click <strong>Add an integration</strong>.</li>
              <li>Select <strong>Generic Webhooks v3</strong> and click Add.</li>
              <li>Paste your Watcher project webhook URL into the <strong>Webhook URL</strong> field.</li>
              <li>Under <strong>Event Subscription</strong>, select <code>incident.triggered</code> and <code>incident.reopened</code>.</li>
            </ol>
          </div>

          {/* Example 2: Render */}
          <div className="text-left border-b border-ash pb-6">
            <h4 className="font-apk-galeria text-base font-semibold text-carbon-ink mb-2">
              Render (PaaS Deployment Platform)
            </h4>
            <p className="font-apk-galeria text-sm text-iron leading-relaxed mb-3">
              Triggers the agent when build or deploy events succeed or fail on Render:
            </p>
            <ol className="list-decimal pl-5 font-apk-galeria text-xs text-iron space-y-1.5 leading-relaxed">
              <li>Log in to your Render Dashboard and select your Web Service.</li>
              <li>Go to the <strong>Settings</strong> tab.</li>
              <li>Scroll down to the <strong>Deploy Webhook</strong> or Webhook notifications section.</li>
              <li>Paste your Watcher project webhook URL. Render will now send POST notifications containing build statuses.</li>
            </ol>
          </div>

          {/* Example 3: VPS / Custom Scripts */}
          <div className="text-left">
            <h4 className="font-apk-galeria text-base font-semibold text-carbon-ink mb-2">
              VPS / Bash Crash Hook
            </h4>
            <p className="font-apk-galeria text-sm text-iron leading-relaxed mb-3">
              For applications running directly on a custom VPS, you can hook a script (such as inside Systemd or node process monitors like PM2) to curl a payload to the webhook whenever a process dies:
            </p>
            <div className="bg-mist border border-ash rounded-cards p-4 font-mono text-[11px] text-iron overflow-x-auto text-left max-w-full scrollbar-none">
              <pre>{`curl -X POST ${getSampleWebhookUrl()} \\
  -H "Content-Type: application/json" \\
  -d '{
    "event": "alert",
    "service": "billing-service",
    "severity": "CRITICAL",
    "message": "uncaughtException: Connection timeout to payment gateway",
    "stack_trace": "Error: ETIMEDOUT\\n    at Socket.cb (connection.js:189:12)\\n    at processTicksAndRejections (task.js:95:5)"
  }'`}</pre>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
