import { Eye, GitBranch, ExternalLink, CheckCircle2 } from 'lucide-react';

export default function GithubSetupGuide() {
  const patGuideUrl = "https://github.com/settings/tokens";

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
              GitHub Repository Integration
            </h2>
            <p className="font-apk-galeria text-sm text-iron max-w-[650px] leading-relaxed m-0">
              To allow the Watcher Agent to locate files, inspect stack traces, compile code fixes, and submit auto-healing Pull Requests, you must link your GitHub repository. Follow this guide to configure access.
            </p>
          </div>
          <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-5 pointer-events-none flex items-center justify-center">
            <GitBranch className="w-48 h-48" />
          </div>
        </div>

        {/* Steps */}
        <div className="flex flex-col gap-6">
          
          {/* Step 1 */}
          <div className="flex gap-4 md:gap-6 border-b border-ash pb-6 text-left">
            <div className="w-8 h-8 rounded-full bg-mist border border-ash flex items-center justify-center font-apkpraktikal text-xs font-bold text-carbon-ink shrink-0">
              1
            </div>
            <div className="flex-1">
              <h3 className="font-apk-galeria text-base font-semibold text-carbon-ink mb-2">Create a GitHub Personal Access Token (PAT)</h3>
              <p className="font-apk-galeria text-sm text-iron leading-relaxed mb-3">
                Go to the <a href={patGuideUrl} target="_blank" rel="noopener noreferrer" className="text-cobalt-spark font-medium hover:underline inline-flex items-center gap-1">GitHub Developer Token Settings <ExternalLink className="w-3.5 h-3.5 text-cobalt-spark" /></a> and log in with your GitHub account.
              </p>
              <ul className="list-disc pl-5 font-apk-galeria text-sm text-iron space-y-1.5 leading-relaxed">
                <li>Click on the <strong>Generate new token</strong> dropdown and select <strong>Generate new token (classic)</strong>.</li>
                <li>Give your token a descriptive note (e.g. <code>Watcher Agent Auto-Healer</code>).</li>
                <li>Set an expiration date (we recommend 90 days or custom as per your security policy).</li>
              </ul>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex gap-4 md:gap-6 border-b border-ash pb-6 text-left">
            <div className="w-8 h-8 rounded-full bg-mist border border-ash flex items-center justify-center font-apkpraktikal text-xs font-bold text-carbon-ink shrink-0">
              2
            </div>
            <div className="flex-1">
              <h3 className="font-apk-galeria text-base font-semibold text-carbon-ink mb-2">Configure Scopes & Permissions</h3>
              <p className="font-apk-galeria text-sm text-iron leading-relaxed mb-3">
                Select the scopes required to grant the agent correct read and write access to your code:
              </p>
              <ul className="list-disc pl-5 font-apk-galeria text-sm text-iron space-y-2 leading-relaxed">
                <li>
                  Check the <strong>repo</strong> checkbox. This provides complete access to private and public repositories, which is required to check out branches, read code, commit bug fixes, and submit PRs.
                  <div className="flex flex-col gap-1.5 mt-2 bg-mist border border-ash rounded-lg p-3 max-w-[400px]">
                    <span className="font-apkpraktikal text-[10px] font-bold text-carbon-ink flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-success" /> repo (all scopes)
                    </span>
                  </div>
                </li>
                <li>(Optional) Check the <strong>workflow</strong> scope if you want the agent to trigger, run, or cancel GitHub Action workflows on bugfix branches.</li>
                <li>Scroll to the bottom and click <strong>Generate token</strong>.</li>
                <li><strong>Copy the token immediately</strong> and save it securely. You will not be able to see it again on GitHub.</li>
              </ul>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex gap-4 md:gap-6 border-b border-ash pb-6 text-left">
            <div className="w-8 h-8 rounded-full bg-mist border border-ash flex items-center justify-center font-apkpraktikal text-xs font-bold text-carbon-ink shrink-0">
              3
            </div>
            <div className="flex-1">
              <h3 className="font-apk-galeria text-base font-semibold text-carbon-ink mb-2">Identify Repository Details</h3>
              <p className="font-apk-galeria text-sm text-iron leading-relaxed mb-3">
                Determine your repository Owner and Repo Name from your repository's URL:
              </p>
              
              {/* Flat mock frame */}
              <div className="bg-mist border border-ash rounded-cards p-4 text-xs font-mono max-w-[600px] text-left">
                <span className="text-slate block mb-1">Example Repository URL:</span>
                <span className="text-carbon-ink font-semibold text-sm">https://github.com/<span className="text-cobalt-spark font-bold">organization-name</span>/<span className="text-cobalt-spark font-bold">service-repository</span></span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 pt-3 border-t border-ash">
                  <div>
                    <span className="font-apkpraktikal text-[9px] uppercase font-bold text-slate block">GitHub Owner</span>
                    <span className="font-apk-galeria text-carbon-ink font-medium text-sm">organization-name</span>
                  </div>
                  <div>
                    <span className="font-apkpraktikal text-[9px] uppercase font-bold text-slate block">GitHub Repo Name</span>
                    <span className="font-apk-galeria text-carbon-ink font-medium text-sm">service-repository</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex gap-4 md:gap-6 text-left">
            <div className="w-8 h-8 rounded-full bg-mist border border-ash flex items-center justify-center font-apkpraktikal text-xs font-bold text-carbon-ink shrink-0">
              4
            </div>
            <div className="flex-1">
              <h3 className="font-apk-galeria text-base font-semibold text-carbon-ink mb-2">Save Settings in Console</h3>
              <p className="font-apk-galeria text-sm text-iron leading-relaxed">
                Go back to the <strong>Console Dashboard</strong> tab on the left sidebar:
              </p>
              <ul className="list-disc pl-5 font-apk-galeria text-sm text-iron space-y-1.5 leading-relaxed mt-2">
                <li>Create a new project or edit your existing project.</li>
                <li>Input your <strong>GitHub Owner</strong>, <strong>GitHub Repo Name</strong>, and paste your copied <strong>GitHub PAT Token</strong> in the respective fields.</li>
                <li>Click <strong>Save Changes</strong> to persist.</li>
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
            <h4 className="font-apk-galeria m-0 mb-1 text-sm font-semibold text-carbon-ink">Secure Encryption Standards</h4>
            <p className="font-apk-galeria m-0 text-xs text-iron leading-relaxed">
              All repository tokens and access details are fully encrypted on the server before being saved to the database using authenticated symmetric encryption (AES-256-GCM). They are decrypted on-the-fly only when worker nodes process incoming alert incidents.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
