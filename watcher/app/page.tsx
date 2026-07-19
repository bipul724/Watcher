import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Eye, Github, Play, CheckCircle2, Shield, Zap, Search, Server } from "lucide-react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  return (
    <div className="min-h-screen bg-white text-[#0b1c30] font-sans selection:bg-[#4b41e1]/20">
      {/* Navigation */}
      <nav className="border-b border-[#e5eeff] bg-white relative z-50">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-4 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-[#4b41e1]" />
              <span className="text-xl font-bold tracking-tight">Watcher</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <a href="#solutions" className="text-sm font-medium text-[#45464d] hover:text-[#0b1c30] transition-colors">Solutions</a>
              <a href="#documentation" className="text-sm font-medium text-[#45464d] hover:text-[#0b1c30] transition-colors">Documentation</a>
              <Link href="/pricing" className="text-sm font-medium text-[#45464d] hover:text-[#0b1c30] transition-colors">Pricing</Link>
              <a href="#enterprise" className="text-sm font-medium text-[#45464d] hover:text-[#0b1c30] transition-colors">Enterprise</a>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {session ? (
              <Link href="/dashboard">
                <Button className="bg-[#0b1c30] hover:bg-[#131b2e] text-white text-sm font-medium h-9 px-4 rounded-md">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <Link href="/sign-in">
                <Button className="bg-[#0b1c30] hover:bg-[#131b2e] text-white text-sm font-medium h-9 px-4 rounded-md">
                  Get Started
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6 lg:px-12 text-center max-w-[1440px] mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#eff4ff] text-[#4b41e1] rounded-full border border-[#dce9ff] mb-8">
          <div className="w-2 h-2 rounded-full bg-[#4b41e1]"></div>
          <span className="text-[10px] font-bold tracking-widest uppercase">Watcher V2.0</span>
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-[72px] font-bold mb-6 tracking-tight leading-[1.1]">
          Automated Engineering<br />for Modern Teams
        </h1>

        <p className="text-lg text-[#45464d] max-w-2xl mx-auto mb-10 leading-relaxed">
          Watcher monitors your repositories 24/7, detects technical debt and vulnerabilities, and raises precision Pull Requests before your team even notices the issue.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <Link href="/sign-in">
            <Button className="bg-[#0b1c30] hover:bg-[#131b2e] text-white h-12 px-8 text-base font-medium rounded-md flex items-center gap-2">
              Get Started <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Button className="bg-[#0b1c30] hover:bg-[#131b2e] text-white h-12 px-8 text-base font-medium rounded-md flex items-center gap-2">
            <Play className="w-4 h-4" />
            Watch Demo
          </Button>
        </div>

        {/* Hero Image Mockup */}
        <div className="relative mx-auto max-w-5xl rounded-xl border border-[#e5eeff] bg-[#0b1c30] shadow-[0px_20px_40px_rgba(11,28,48,0.1)] overflow-hidden">
          <div className="h-10 bg-[#131b2e] border-b border-[#213145] flex items-center px-4 gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ef4444]"></div>
            <div className="w-3 h-3 rounded-full bg-[#f59e0b]"></div>
            <div className="w-3 h-3 rounded-full bg-[#10b981]"></div>
          </div>
          <div className="p-8 pb-0 aspect-[16/9] flex flex-col">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">Powerful Features</h2>
              <p className="text-[#7c839b]">Everything you need for automated code quality and security</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#131b2e] border border-[#213145] rounded-lg p-6">
                <div className="w-10 h-10 rounded bg-[#213145] flex items-center justify-center mb-4"><Search className="w-5 h-5 text-[#4b41e1]" /></div>
                <h3 className="text-white font-bold mb-2">24/7 Monitoring</h3>
                <div className="h-2 bg-[#213145] rounded mb-2 w-3/4"></div>
                <div className="h-2 bg-[#213145] rounded w-1/2"></div>
              </div>
              <div className="bg-[#131b2e] border border-[#213145] rounded-lg p-6">
                <div className="w-10 h-10 rounded bg-[#213145] flex items-center justify-center mb-4"><Shield className="w-5 h-5 text-[#10b981]" /></div>
                <h3 className="text-white font-bold mb-2">Security First</h3>
                <div className="h-2 bg-[#213145] rounded mb-2 w-5/6"></div>
                <div className="h-2 bg-[#213145] rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 lg:px-12 bg-[#f8f9ff]">
        <div className="max-w-[1440px] mx-auto text-center mb-16">
          <h2 className="text-[32px] md:text-[40px] font-bold mb-4 tracking-tight">Engineered for Reliability</h2>
          <p className="text-[#45464d] text-lg max-w-2xl mx-auto">
            From real-time monitoring to automated remediation, Watcher handles the repetitive parts of engineering.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-[1440px] mx-auto">
          <div className="bg-white p-8 rounded-xl border border-[#e5eeff] shadow-[0px_4px_20px_rgba(11,28,48,0.02)]">
            <div className="w-12 h-12 bg-[#eff4ff] rounded-lg flex items-center justify-center mb-6">
              <Search className="w-6 h-6 text-[#4b41e1]" />
            </div>
            <h3 className="text-xl font-bold mb-3">Continuous Monitoring</h3>
            <p className="text-[#45464d] mb-6">
              24/7 surveillance across all repositories. Watcher identifies patterns that lead to production failures before they occur.
            </p>
            <ul className="space-y-3 text-sm font-medium text-[#0b1c30]">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#4b41e1]" /> Real-time alerting</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#4b41e1]" /> Pattern recognition</li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-xl border border-[#e5eeff] shadow-[0px_4px_20px_rgba(11,28,48,0.02)]">
            <div className="w-12 h-12 bg-[#eff4ff] rounded-lg flex items-center justify-center mb-6">
              <Zap className="w-6 h-6 text-[#4b41e1]" />
            </div>
            <h3 className="text-xl font-bold mb-3">Automated Remediation</h3>
            <p className="text-[#45464d] mb-6">
              When a bug is found, Watcher doesn't just alert—it fixes. Automated PRs with detailed explanations for every change.
            </p>
            <ul className="space-y-3 text-sm font-medium text-[#0b1c30]">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#4b41e1]" /> Smart bug detection</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#4b41e1]" /> Auto-generated PRs</li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-xl border border-[#e5eeff] shadow-[0px_4px_20px_rgba(11,28,48,0.02)]">
            <div className="w-12 h-12 bg-[#eff4ff] rounded-lg flex items-center justify-center mb-6">
              <Shield className="w-6 h-6 text-[#4b41e1]" />
            </div>
            <h3 className="text-xl font-bold mb-3">Enterprise Security</h3>
            <p className="text-[#45464d] mb-6">
              Stay ahead of CVEs and structural vulnerabilities. Built-in guard ensures your system design remains resilient.
            </p>
            <ul className="space-y-3 text-sm font-medium text-[#0b1c30]">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#4b41e1]" /> Vulnerability patching</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#4b41e1]" /> Architecture enforcement</li>
            </ul>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-6 lg:px-12 max-w-[1440px] mx-auto">
        <h2 className="text-[32px] md:text-[40px] font-bold mb-16 tracking-tight">How Watcher Works</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded bg-[#0b1c30] text-white flex items-center justify-center font-bold shrink-0">1</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Watch</h3>
                <p className="text-[#45464d]">Connect your GitHub organization. Watcher instantly indexes your code and understands your architecture.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded bg-[#0b1c30] text-white flex items-center justify-center font-bold shrink-0">2</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Detect</h3>
                <p className="text-[#45464d]">Using semantic analysis, Watcher identifies security flaws, performance bottlenecks, and logical errors.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded bg-[#0b1c30] text-white flex items-center justify-center font-bold shrink-0">3</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Fix</h3>
                <p className="text-[#45464d]">Watcher develops a solution, tests it in a virtual sandbox, and creates a polished Pull Request.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded bg-[#0b1c30] text-white flex items-center justify-center font-bold shrink-0">4</div>
              <div>
                <h3 className="text-xl font-bold mb-2">Review</h3>
                <p className="text-[#45464d]">Your team reviews the PR. Approve to merge, or provide feedback for Watcher to refine the fix.</p>
              </div>
            </div>
          </div>
          
          <div className="bg-[#0b1c30] rounded-xl p-8 aspect-square flex items-center justify-center border border-[#213145] shadow-2xl">
            {/* Minimal mockup illustration */}
            <div className="w-full max-w-sm bg-[#131b2e] rounded-lg border border-[#213145] p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <div className="h-4 w-24 bg-[#213145] rounded"></div>
                <div className="px-2 py-1 rounded bg-[#4b41e1]/20 text-[#4b41e1] text-[10px] font-bold">PR CREATED</div>
              </div>
              <div className="space-y-4">
                <div className="h-2 w-full bg-[#213145] rounded"></div>
                <div className="h-2 w-5/6 bg-[#213145] rounded"></div>
                <div className="h-2 w-4/6 bg-[#213145] rounded"></div>
                <div className="mt-6 flex justify-end gap-2">
                  <div className="h-8 w-20 bg-[#213145] rounded"></div>
                  <div className="h-8 w-20 bg-[#10b981] rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Deep GitHub Integration */}
      <section className="bg-[#0b1c30] text-white py-24 px-6 lg:px-12">
        <div className="max-w-[1440px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-[32px] md:text-[40px] font-bold mb-4 tracking-tight">Deep GitHub Integration</h2>
            <p className="text-[#7c839b] text-lg max-w-2xl mx-auto">
              Works natively with your existing tools. No complex configuration required.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block bg-[#131b2e] border border-[#213145] rounded-md px-3 py-1.5 mb-6 font-mono text-sm text-[#bec6e0]">
                $ npx install @watcher-ai/cli
              </div>
              <h3 className="text-2xl font-bold mb-4">Local Environment Support</h3>
              <p className="text-[#bec6e0] mb-8 leading-relaxed">
                Run Watcher locally to audit code before pushing. Fully compatible with GitHub Actions, GitLab CI, and custom local environments.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#131b2e] border border-[#213145] rounded-lg p-4 flex items-center gap-3">
                  <Github className="w-5 h-5 text-white" />
                  <span className="font-semibold text-sm">CI/CD Ready</span>
                </div>
                <div className="bg-[#131b2e] border border-[#213145] rounded-lg p-4 flex items-center gap-3">
                  <Server className="w-5 h-5 text-[#4b41e1]" />
                  <span className="font-semibold text-sm">SOC2 Compliant</span>
                </div>
              </div>
            </div>
            
            <div className="bg-[#131b2e] rounded-xl p-8 border border-[#213145] shadow-2xl relative overflow-hidden text-center aspect-video flex flex-col justify-center">
              <h3 className="text-4xl font-bold mb-2 text-[#4b41e1]">Never Miss a Bug</h3>
              <h3 className="text-4xl font-bold text-white mb-6">In Your Repos</h3>
              <p className="text-[#7c839b] max-w-md mx-auto mb-8 text-sm">Watcher is actively monitoring over 10K repositories and resolving issues before they impact production.</p>
              <div className="flex justify-center gap-8">
                <div>
                  <div className="text-xl font-bold text-white">10K+</div>
                  <div className="text-[10px] text-[#7c839b] font-bold tracking-widest uppercase">Repos</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-white">1M+</div>
                  <div className="text-[10px] text-[#7c839b] font-bold tracking-widest uppercase">Fixes</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-white">24/7</div>
                  <div className="text-[10px] text-[#7c839b] font-bold tracking-widest uppercase">Active</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 lg:px-12 bg-[#f8f9ff]">
        <div className="max-w-[1440px] mx-auto text-center">
          <h2 className="text-[32px] md:text-[40px] font-bold mb-6 tracking-tight">Ready to automate your code quality?</h2>
          <p className="text-[#45464d] text-lg max-w-2xl mx-auto mb-10">
            Join over 500 engineering teams who have automated their maintenance lifecycle with Watcher.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/sign-in">
              <Button className="bg-[#000000] hover:bg-[#1a1c1c] text-white h-12 px-8 text-base font-medium rounded-md">
                Start Free Trial
              </Button>
            </Link>
            <Button variant="outline" className="border-[#c6c6cd] text-[#0b1c30] hover:bg-white h-12 px-8 text-base font-medium rounded-md bg-white">
              Talk to Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#e5eeff] py-12 px-6 lg:px-12 bg-white">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4 text-[#4b41e1]" />
              <span className="font-bold tracking-tight">Watcher</span>
            </Link>
            <p className="text-xs text-[#76777d]">© 2026 WATCHER. AI ENGINEERED FOR PRECISION.</p>
          </div>
          
          <div className="flex gap-6 text-[10px] tracking-widest font-bold uppercase text-[#76777d]">
            <a href="#" className="hover:text-[#0b1c30]">Terms of Service</a>
            <a href="#" className="hover:text-[#0b1c30]">Privacy Policy</a>
            <a href="#" className="hover:text-[#0b1c30]">Security</a>
            <a href="#" className="hover:text-[#0b1c30]">System Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
}