import { useState } from 'react';
import { Eye, ArrowRight, GitBranch, Menu, X, Terminal, Cpu, Database, CheckSquare, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LandingPage({ setView }) {
  const [landingMenuOpen, setLandingMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col relative overflow-x-hidden bg-canvas-white graph-grid selection:bg-lime-glow/30">
      
      {/* Background radial highlights */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
        <div className="absolute top-0 left-1/4 w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,rgba(220,245,143,0.06)_0%,transparent_70%)]"></div>
        <div className="absolute top-[1200px] right-1/4 w-[800px] h-[800px] rounded-full bg-[radial-gradient(circle,rgba(147,73,48,0.04)_0%,transparent_70%)]"></div>
      </div>

      {/* Header Navigation */}
      <header className="flex justify-between items-center px-6 md:px-16 py-5 border-b border-ash bg-canvas-white/85 backdrop-blur-md sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-carbon-ink flex items-center justify-center text-canvas-white">
            <Eye className="w-4.5 h-4.5 text-lime-glow" />
          </div>
          <span className="font-apk-galeria text-lg md:text-xl font-medium tracking-tight text-carbon-ink">
            watcher<span className="text-slate font-light">.agent</span>
          </span>
        </div>
        
        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-10">
          <a href="#pipeline" className="text-steel font-apkpraktikal text-xs uppercase tracking-widest hover:text-carbon-ink transition-colors">
            Pipeline
          </a>
          <a href="#product" className="text-steel font-apkpraktikal text-xs uppercase tracking-widest hover:text-carbon-ink transition-colors">
            Console Demo
          </a>
          <a href="#pricing" className="text-steel font-apkpraktikal text-xs uppercase tracking-widest hover:text-carbon-ink transition-colors">
            Pricing
          </a>
          <a href="https://github.com/AyShakya/WatcherAgent" target="_blank" rel="noopener noreferrer" className="text-steel font-apkpraktikal text-xs uppercase tracking-widest hover:text-carbon-ink transition-colors flex items-center gap-1">
            AyShakya/WatcherAgent ↗
          </a>
        </nav>

        {/* Header CTAs */}
        <div className="hidden md:flex items-center gap-5">
          <button 
            className="text-iron font-apkpraktikal text-xs uppercase tracking-widest px-4 py-2 hover:text-carbon-ink transition-colors duration-200"
            onClick={() => setView('SIGN_IN')}
          >
            Sign In
          </button>
          
          <motion.button 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="bg-lime-glow text-carbon-ink font-apkpraktikal text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-full border border-iron/10 cursor-pointer"
            onClick={() => setView('SIGN_UP')}
          >
            Get Started
          </motion.button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button 
          className="md:hidden bg-transparent border border-ash text-carbon-ink cursor-pointer p-2 rounded-full hover:bg-mist transition-colors"
          onClick={() => setLandingMenuOpen(!landingMenuOpen)}
          title="Toggle Menu"
        >
          {landingMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </header>

      {/* Mobile Overlay Menu */}
      <AnimatePresence>
        {landingMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden fixed inset-x-0 top-[65px] bg-canvas-white border-b border-ash p-6 z-35 flex flex-col gap-4 shadow-sm"
          >
            <a 
              href="#pipeline" 
              className="text-iron font-apkpraktikal text-xs uppercase tracking-widest py-2 hover:text-carbon-ink text-left"
              onClick={() => setLandingMenuOpen(false)}
            >
              Pipeline
            </a>
            <a 
              href="#product" 
              className="text-iron font-apkpraktikal text-xs uppercase tracking-widest py-2 hover:text-carbon-ink text-left"
              onClick={() => setLandingMenuOpen(false)}
            >
              Console Demo
            </a>
            <a 
              href="#pricing" 
              className="text-iron font-apkpraktikal text-xs uppercase tracking-widest py-2 hover:text-carbon-ink text-left"
              onClick={() => setLandingMenuOpen(false)}
            >
              Pricing
            </a>
            <a 
              href="https://github.com/AyShakya/WatcherAgent" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-iron font-apkpraktikal text-xs uppercase tracking-widest py-2 hover:text-carbon-ink text-left"
              onClick={() => setLandingMenuOpen(false)}
            >
              AyShakya/WatcherAgent ↗
            </a>
            <div className="flex flex-col gap-3 mt-2 border-t border-ash pt-4">
              <button 
                className="w-full text-center text-iron font-apkpraktikal text-xs uppercase tracking-widest py-3 border border-ash rounded-full hover:bg-mist transition-colors"
                onClick={() => { setLandingMenuOpen(false); setView('SIGN_IN'); }}
              >
                Sign In
              </button>
              <button 
                className="w-full text-center bg-lime-glow text-carbon-ink font-apkpraktikal text-xs font-bold uppercase tracking-widest py-3 rounded-full hover:opacity-95 transition-opacity"
                onClick={() => { setLandingMenuOpen(false); setView('SIGN_UP'); }}
              >
                Get Started
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section Container with Detective Board Strings & Pinned Patches */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 md:px-12 py-28 md:py-36 max-w-7xl mx-auto z-10 relative w-full">
        
        {/* DETECTIVE BOARD STRINGS (SVG Overlay in background of the hero container) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 hidden xl:block" viewBox="0 0 1200 650" fill="none">
          {/* Red Connecting Strings */}
          <path d="M 130 140 Q 180 320, 160 510" stroke="#ba1a1a" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.65" />
          <path d="M 160 510 Q 550 560, 1060 480" stroke="#ba1a1a" strokeWidth="1.2" opacity="0.65" />
          <path d="M 1060 480 Q 980 280, 1030 110" stroke="#ba1a1a" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.65" />
          <path d="M 1030 110 Q 560 60, 130 140" stroke="#ba1a1a" strokeWidth="1.2" opacity="0.65" />
          
          {/* Crimson Red Pushpins */}
          <circle cx="130" cy="140" r="4.5" fill="#ba1a1a" stroke="#ffffff" strokeWidth="1" />
          <circle cx="160" cy="510" r="4.5" fill="#ba1a1a" stroke="#ffffff" strokeWidth="1" />
          <circle cx="1060" cy="480" r="4.5" fill="#ba1a1a" stroke="#ffffff" strokeWidth="1" />
          <circle cx="1030" cy="110" r="4.5" fill="#ba1a1a" stroke="#ffffff" strokeWidth="1" />
        </svg>

        {/* 1. TOP-LEFT PINNED NOTE: Vector Space Cluster (Note Patch) */}
        <motion.div 
          initial={{ opacity: 0, rotate: -8, y: 10 }}
          animate={{ opacity: 1, rotate: -4, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="absolute top-10 left-[1%] w-52 bg-canvas-white border border-ash rounded-xl p-4 hidden xl:flex flex-col text-left z-20 hover:rotate-[-2deg] transition-transform duration-200 select-none min-w-0"
        >
          <span className="font-apkpraktikal text-[8px] font-bold tracking-widest text-cobalt-spark uppercase mb-2">VECTOR CLUSTERING</span>
          <svg className="w-full h-24 text-slate mb-2" viewBox="0 0 100 80" fill="none" stroke="currentColor" strokeWidth="1.2">
            <line x1="10" y1="70" x2="90" y2="70" />
            <line x1="10" y1="10" x2="10" y2="70" />
            <circle cx="35" cy="30" r="3" fill="currentColor" opacity="0.3" />
            <circle cx="40" cy="25" r="3" fill="currentColor" />
            <circle cx="38" cy="35" r="3" fill="currentColor" opacity="0.3" />
            <circle cx="75" cy="55" r="3" fill="currentColor" opacity="0.3" />
            <circle cx="70" cy="60" r="3" fill="currentColor" />
            <circle cx="78" cy="58" r="3" fill="currentColor" opacity="0.3" />
            <path d="M40 25 C 50 35, 60 50, 70 60" strokeDasharray="3 3" stroke="#934930" />
            <text x="44" y="20" className="font-apkpraktikal text-[6px] fill-current">CrashSignature</text>
            <text x="76" y="70" className="font-apkpraktikal text-[6px] fill-current">Runbook #410</text>
          </svg>
          <p className="font-apk-galeria text-[10px] text-iron leading-normal m-0">
            RAG index clustering matches stack-trace signatures to historical resolutions.
          </p>
        </motion.div>

        {/* 2. BOTTOM-LEFT PINNED NOTE: Basketball Shooter (Graffiti Sketch Patch) */}
        <motion.div 
          initial={{ opacity: 0, rotate: -5, y: 10 }}
          animate={{ opacity: 1, rotate: -2, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="absolute bottom-16 left-[2%] w-48 bg-canvas-white border border-ash rounded-xl p-4 hidden xl:flex flex-col text-left z-20 hover:rotate-[0deg] transition-transform duration-200 select-none min-w-0"
        >
          <span className="font-apkpraktikal text-[8px] font-bold tracking-widest text-cobalt-spark uppercase mb-2">DYNAMIC SCATTER</span>
          <svg className="w-full h-24 text-carbon-ink" viewBox="0 0 100 80" fill="none" stroke="currentColor" strokeWidth="1.2">
            {/* Basket hoop */}
            <path d="M 75 25 H 85 M 85 25 V 40 M 80 25 V 35" strokeWidth="1" />
            <rect x="75" y="10" width="1.5" height="20" fill="currentColor" />
            {/* Player jump outline */}
            <circle cx="30" cy="40" r="5" />
            <path d="M 30 45 L 30 60 L 22 75 M 30 60 L 38 75" />
            <path d="M 30 50 L 50 35 L 60 22" />
            {/* Ball */}
            <circle cx="63" cy="18" r="3.5" fill="var(--color-lime-glow)" stroke="currentColor" strokeWidth="1" />
            <path d="M 60 18 H 66 M 63 15 V 21" stroke="currentColor" strokeWidth="0.6" />
          </svg>
          <p className="font-apk-galeria text-[10px] text-iron leading-normal m-0">
            Loose hand-drawn concept diagrams scattered around the margins.
          </p>
        </motion.div>

        {/* 3. BOTTOM-RIGHT PINNED NOTE: BullMQ Queue Task (Note Patch) */}
        <motion.div 
          initial={{ opacity: 0, rotate: 6, y: 10 }}
          animate={{ opacity: 1, rotate: 3, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="absolute bottom-20 right-[1%] w-56 bg-canvas-white border border-ash rounded-xl p-4 hidden xl:flex flex-col text-left z-20 hover:rotate-[1deg] transition-transform duration-200 select-none min-w-0"
        >
          <span className="font-apkpraktikal text-[8px] font-bold tracking-widest text-cobalt-spark uppercase mb-2">BULLMQ PIPELINE</span>
          <div className="flex flex-col gap-2 font-mono text-[9px] text-iron bg-mist p-2.5 rounded border border-ash/40 mb-2">
            <div className="flex justify-between items-center border-b border-ash/40 pb-1">
              <span>Job Queue: active</span>
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse"></span>
            </div>
            <div className="flex items-center gap-1.5 text-carbon-ink font-semibold">
              <span className="text-cobalt-spark">[Q1]</span> ingest_alert_data
            </div>
            <div className="flex items-center gap-1.5 text-slate opacity-65">
              <span>[Q2]</span> pinecone_query_rag
            </div>
            <div className="flex items-center gap-1.5 text-slate opacity-65">
              <span>[Q3]</span> checkout_sandbox_run
            </div>
          </div>
          <p className="font-apk-galeria text-[10px] text-iron leading-normal m-0">
            BullMQ distributes worker tasks across isolated sandboxes.
          </p>
        </motion.div>

        {/* 4. TOP-RIGHT PINNED NOTE: Overhead Car (Graffiti Sketch Patch) */}
        <motion.div 
          initial={{ opacity: 0, rotate: 5, y: 10 }}
          animate={{ opacity: 1, rotate: 2, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="absolute top-8 right-[2%] w-52 bg-canvas-white border border-ash rounded-xl p-4 hidden xl:flex flex-col text-left z-20 hover:rotate-[0deg] transition-transform duration-200 select-none min-w-0"
        >
          <span className="font-apkpraktikal text-[8px] font-bold tracking-widest text-cobalt-spark uppercase mb-2">OVERHEAD LOGS</span>
          <svg className="w-full h-24 text-carbon-ink mb-2" viewBox="0 0 100 80" fill="none" stroke="currentColor" strokeWidth="1.2">
            <rect x="35" y="20" width="30" height="40" rx="5" />
            <rect x="40" y="32" width="20" height="10" rx="2" fill="var(--color-lime-glow)" stroke="currentColor" strokeWidth="1" />
            <rect x="31" y="25" width="4" height="10" rx="1" fill="currentColor" />
            <rect x="65" y="25" width="4" height="10" rx="1" fill="currentColor" />
            <rect x="31" y="45" width="4" height="10" rx="1" fill="currentColor" />
            <rect x="65" y="45" width="4" height="10" rx="1" fill="currentColor" />
            <path d="M15 5 V75 M85 5 V75" strokeDasharray="3 3" />
          </svg>
          <p className="font-apk-galeria text-[10px] text-iron leading-normal m-0">
            Trace back execution flows using structured telemetry.
          </p>
        </motion.div>

        {/* Eyebrow badge */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 bg-mist border border-ash rounded-full mb-8 sm:mb-10 z-30 max-w-full"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cobalt-spark"></span>
          <span className="font-apkpraktikal text-[10px] text-carbon-ink uppercase tracking-widest font-semibold">v2.4 Autonomous Incident Manager</span>
        </motion.div>
        
        {/* Hero two-tone headline - Clearly readable with no overlapping elements */}
        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-apk-galeria text-4xl md:text-6xl lg:text-7.5xl text-carbon-ink max-w-3xl mx-auto leading-[1.05] tracking-tight mb-6 sm:mb-8 z-30 relative"
        >
          Autonomously Triage, Notify & <br />
          <span className="text-slate italic font-light">Resolve Production Incidents</span>
        </motion.h1>
        
        {/* Hero description */}
        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="font-apk-galeria text-base md:text-lg text-iron max-w-2xl mx-auto mb-10 sm:mb-14 leading-relaxed z-30 relative"
        >
          WatcherAgent monitors application endpoints, requests approval checkouts via Discord channels, and deploys tested code patches automatically. Elevate SRE using agentic workflows.
        </motion.p>
        
        {/* Hero CTA buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 sm:gap-5 mb-10 sm:mb-12 w-full max-w-md mx-auto z-30 relative"
        >
          {/* Lime Glow conversion button - Primary Hero Action */}
          <motion.button 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto bg-lime-glow text-carbon-ink border border-iron/10 px-8 py-4 rounded-full font-apkpraktikal text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer"
            onClick={() => setView('SIGN_UP')}
          >
            Initialize Account <ArrowRight className="w-3.5 h-3.5 text-carbon-ink" />
          </motion.button>
          
          <motion.button 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            className="w-full sm:w-auto bg-transparent border border-steel/30 text-carbon-ink px-8 py-4 rounded-full font-apkpraktikal text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-mist transition-all duration-150 cursor-pointer"
            onClick={() => window.open('https://github.com/AyShakya/WatcherAgent', '_blank')}
          >
            <GitBranch className="w-3.5 h-3.5 text-cobalt-spark" /> View Repository
          </motion.button>
        </motion.div>

      </main>

      {/* COMPATIBLE TELEMETRY & ACTION STACK ribbon (Replaces client logos) */}
      <section className="border-t border-b border-ash bg-canvas-white py-12 w-full z-10 shrink-0 select-none overflow-hidden mb-20 sm:mb-28">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 sm:gap-8 text-left">
          <div className="flex flex-col gap-1 min-w-0 lg:min-w-[240px]">
            <span className="font-apkpraktikal text-[9px] font-bold text-slate uppercase tracking-widest">TELEMETRY & TOOLING STACK</span>
            <h4 className="font-apk-galeria text-lg font-medium text-carbon-ink m-0">Native SaaS Integrations</h4>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 lg:gap-6 text-xs font-apkpraktikal uppercase tracking-widest text-iron">
            <span className="bg-mist border border-ash/50 rounded-full px-4 py-1.5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-danger"></span> Sentry
            </span>
            <span className="text-slate font-light select-none">→</span>
            <span className="bg-mist border border-ash/50 rounded-full px-4 py-1.5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-warning"></span> Datadog
            </span>
            <span className="text-slate font-light select-none">→</span>
            <span className="bg-mist border border-ash/50 rounded-full px-4 py-1.5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cobalt-spark"></span> Pinecone RAG
            </span>
            <span className="text-slate font-light select-none">→</span>
            <span className="bg-mist border border-ash/50 rounded-full px-4 py-1.5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-carbon-ink"></span> Discord HITL
            </span>
            <span className="text-slate font-light select-none">→</span>
            <span className="bg-mist border border-ash/50 rounded-full px-4 py-1.5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-lime-glow"></span> GitHub Actions
            </span>
          </div>
        </div>
      </section>

      {/* PRODUCT INTERFACE SHOWCASE (Mock Window frame) */}
      <section id="product" className="px-8 md:px-16 py-20 md:py-28 bg-transparent text-left max-w-7xl mx-auto z-10 w-full mb-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column Description */}
          <div className="lg:col-span-5 text-left">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-cobalt-spark"></span>
              <span className="font-apkpraktikal text-xs uppercase tracking-widest text-carbon-ink">Product Interface</span>
            </div>
            
            <h2 className="font-apk-galeria text-3xl md:text-5xl text-carbon-ink m-0 leading-tight mb-6">
              Unified Incident <br />
              <span className="text-slate italic font-light">Control Tower</span>
            </h2>
            
            <p className="font-apk-galeria text-sm md:text-base text-iron leading-relaxed mb-8">
              Review exceptions normalized from raw alerts, examine sandbox build statuses, audit agent recommendations, and manage repository credentials in a single flat-matte pane.
            </p>

            <ul className="flex flex-col gap-3.5 p-0 m-0 list-none">
              {[
                'Full BullMQ queue process monitoring.',
                'Pinecone memory loop postmortem recall.',
                'One-click sandbox deployment to repository.',
              ].map(item => (
                <li key={item} className="flex items-start gap-2.5 text-xs font-apk-galeria text-iron">
                  <span className="text-cobalt-spark mt-0.5">✦</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column Showcase - Mock Window Frame */}
          <div className="lg:col-span-7 bg-canvas-white border border-ash rounded-xl p-5 w-full">
            
            {/* Browser/Window frame */}
            <div className="bg-mist border border-ash/80 rounded-cards overflow-hidden flex flex-col w-full">
              {/* Traffic light header strip */}
              <div className="px-4 py-3 bg-mist border-b border-ash flex items-center justify-between shrink-0">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate/30"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-slate/30"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-slate/30"></span>
                </div>
                <span className="font-apkpraktikal text-[9px] text-slate uppercase tracking-widest">watcher-agent-worker-01</span>
                <span className="w-2.5 h-2.5"></span>
              </div>
              
              {/* Simulated terminal logs inside window */}
              <div className="p-5 font-mono text-[11px] text-iron bg-canvas-white flex flex-col gap-2.5 overflow-x-auto select-none min-h-[220px]">
                <div className="flex items-center gap-2 text-slate">
                  <span>[14:26:01]</span>
                  <span className="text-cobalt-spark">📥 Ingested payload:</span>
                  <span>billing-api / P1 alert event</span>
                </div>
                <div className="flex items-center gap-2 text-slate">
                  <span>[14:26:02]</span>
                  <span className="text-cobalt-spark">🔍 Pinecone Vector Search:</span>
                  <span>Querying embeddings for signature...</span>
                </div>
                <div className="flex items-center gap-2 text-success">
                  <span>[14:26:03]</span>
                  <span>🎯 Match found:</span>
                  <span>Runbook #410 'MongoNetworkError' (98.4% match)</span>
                </div>
                <div className="flex items-center gap-2 text-slate">
                  <span>[14:26:04]</span>
                  <span className="text-cobalt-spark">💬 Discord dispatch:</span>
                  <span>Sent interactive card in thread #alerts-billing</span>
                </div>
                <div className="flex items-center gap-2 text-slate">
                  <span>[14:26:05]</span>
                  <span>⏳ Awaiting approval from SRE team...</span>
                </div>
                <div className="flex items-center gap-2 text-success border-t border-ash/40 pt-2 mt-2">
                  <span>[14:26:22]</span>
                  <span>⚡ Callback received:</span>
                  <span>Action APPROVED. Initializing checkout sandbox...</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 5-NODE REMEDIATION PIPELINE */}
      <section id="pipeline" className="border-t border-ash bg-canvas-white py-20 md:py-28 z-10 w-full mb-28">
        <div className="max-w-[1120px] mx-auto px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-4 text-left">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-cobalt-spark"></span>
                <span className="font-apkpraktikal text-xs uppercase tracking-widest text-carbon-ink">Pipeline Architecture</span>
              </div>
              <h2 className="font-apk-galeria text-3xl md:text-5xl text-carbon-ink m-0 leading-tight">
                The 5-Node <span className="text-slate italic font-light">Remediation Engine</span>
              </h2>
            </div>
            <p className="font-apk-galeria text-sm text-iron max-w-sm md:text-right m-0">
              Five continuous pipeline nodes coordinating exception streams to tested production pull requests.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-left">
            
            {/* Node 1 */}
            <div className="md:col-span-4 bg-canvas-white border border-ash rounded-xl p-8 hover:border-cobalt-spark/30 transition-colors duration-300 flex flex-col justify-between h-[230px]">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="font-apkpraktikal text-[11px] text-cobalt-spark font-bold tracking-widest">NODE 01</span>
                  <Terminal className="w-4 h-4 text-slate" />
                </div>
                <h4 className="font-apk-galeria text-xl font-medium text-carbon-ink mb-3">Intelligent Triage</h4>
                <p className="font-apk-galeria text-sm text-iron leading-relaxed">
                  LLM categorizes alerts from Sentry, Datadog or Prometheus. Filters noise and structures raw exception logs.
                </p>
              </div>
            </div>
            
            {/* Node 2 */}
            <div className="md:col-span-8 bg-ice-blue border border-ash/40 rounded-xl p-8 hover:border-cobalt-spark/30 transition-colors duration-300 flex flex-col justify-between h-[230px]">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="font-apkpraktikal text-[11px] text-cobalt-spark font-bold tracking-widest">NODE 02</span>
                  <Database className="w-4 h-4 text-cobalt-spark" />
                </div>
                <h4 className="font-apk-galeria text-xl font-medium text-carbon-ink mb-3">Runbook RAG Recall</h4>
                <p className="font-apk-galeria text-sm text-iron leading-relaxed max-w-xl">
                  Retrieves historical resolution context using Pinecone database vector indexes, matching past solutions to new crash signatures.
                </p>
              </div>
              <div className="h-[3px] bg-mist w-full mt-4 rounded-full overflow-hidden">
                <div className="h-full bg-cobalt-spark w-2/3"></div>
              </div>
            </div>
            
            {/* Node 3 */}
            <div className="md:col-span-6 lg:col-span-5 bg-canvas-white border border-ash rounded-xl p-8 hover:border-cobalt-spark/30 transition-colors duration-300 flex flex-col justify-between h-[250px]">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="font-apkpraktikal text-[11px] text-cobalt-spark font-bold tracking-widest">NODE 03</span>
                  <CheckSquare className="w-4 h-4 text-slate" />
                </div>
                <h4 className="font-apk-galeria text-xl font-medium text-carbon-ink mb-3">HITL Discord Cards</h4>
                <p className="font-apk-galeria text-sm text-iron leading-relaxed mb-6">
                  Safety-first Human-in-the-Loop checkpoints. Pings Discord with one-click quick actions to authorize or audit code fix drafts.
                </p>
              </div>
              <div className="flex gap-2">
                <span className="px-4 py-1.5 rounded-full font-apkpraktikal text-[9px] uppercase tracking-widest bg-carbon-ink text-canvas-white font-medium">Approve Fix</span>
                <span className="px-4 py-1.5 rounded-full font-apkpraktikal text-[9px] uppercase tracking-widest border border-ash text-iron font-medium">Edit Context</span>
              </div>
            </div>
            
            {/* Node 4 */}
            <div className="md:col-span-6 lg:col-span-4 bg-canvas-white border border-ash rounded-xl p-8 hover:border-cobalt-spark/30 transition-colors duration-300 flex flex-col justify-between h-[250px]">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="font-apkpraktikal text-[11px] text-cobalt-spark font-bold tracking-widest">NODE 04</span>
                  <Cpu className="w-4 h-4 text-slate" />
                </div>
                <h4 className="font-apk-galeria text-xl font-medium text-carbon-ink mb-3">Fixer Sandbox</h4>
                <p className="font-apk-galeria text-sm text-iron leading-relaxed">
                  Spawns isolated workspace checkouts, refactors imports, applies patches, validates test suites, and drafts a GitHub Pull Request.
                </p>
              </div>
            </div>
            
            {/* Node 5 */}
            <div className="md:col-span-12 lg:col-span-3 bg-mist border border-ash rounded-xl p-8 hover:border-cobalt-spark/30 transition-colors duration-300 flex flex-col justify-between h-[250px]">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="font-apkpraktikal text-[11px] text-cobalt-spark font-bold tracking-widest">NODE 05</span>
                  <Lightbulb className="w-4 h-4 text-cobalt-spark" />
                </div>
                <h4 className="font-apk-galeria text-xl font-medium text-carbon-ink mb-3">Memory Loop</h4>
                <p className="font-apk-galeria text-sm text-iron leading-relaxed">
                  Generates markdown postmortems and writes back solutions into Pinecone vectors, training the agent core.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SAAS PRICE & DEPLOYMENT OPTIONS SECTION */}
      <section id="pricing" className="px-8 md:px-16 py-20 md:py-28 bg-transparent text-left max-w-7xl mx-auto z-10 w-full mb-28">
        <div className="flex flex-col items-center text-center mb-16">
          <div className="flex items-center gap-1.5 mb-2 justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-cobalt-spark"></span>
            <span className="font-apkpraktikal text-[9px] font-bold uppercase text-iron tracking-widest">SaaS DEPLOYMENTS</span>
          </div>
          <h2 className="font-apk-galeria text-3xl md:text-5xl text-carbon-ink m-0 leading-tight mb-4">
            Flexible Plans for <span className="text-slate italic font-light">Every Scale</span>
          </h2>
          <p className="font-apk-galeria text-sm text-iron max-w-lg leading-relaxed">
            Deploy on our secure shared cloud or host isolated worker runtimes inside your own VPC network.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-6">
          
          {/* Plan 1 */}
          <div className="bg-canvas-white border border-ash rounded-xl p-8 flex flex-col justify-between h-full transform hover:scale-[1.01] hover:rotate-[0deg] transition-all duration-200 rotate-[-1deg] select-none">
            <div>
              <span className="font-apkpraktikal text-[9px] font-bold text-slate uppercase tracking-widest block mb-4">COMMUNITY EDITION</span>
              <h3 className="font-apk-galeria text-2xl font-semibold text-carbon-ink m-0 mb-2">Self-Hosted Core</h3>
              <p className="font-apk-galeria text-xs text-iron leading-relaxed mb-6">
                Host your own local Sqlite pipeline worker, configure 1 workspace project, and manual approval triggers.
              </p>
              <div className="font-apk-galeria text-3xl font-medium text-carbon-ink mb-6">$0<span className="text-xs text-slate font-light"> / forever</span></div>
            </div>
            
            <button 
              type="button" 
              onClick={() => setView('SIGN_UP')}
              className="w-full bg-transparent border border-ash text-carbon-ink font-apkpraktikal text-xs font-bold uppercase tracking-widest py-3 rounded-full hover:bg-mist cursor-pointer"
            >
              Get Free Core
            </button>
          </div>

          {/* Plan 2: SaaS Featured Cloud */}
          <div className="bg-ice-blue border border-ash/40 rounded-xl p-8 flex flex-col justify-between h-full transform hover:scale-[1.01] hover:rotate-[0deg] transition-all duration-200 rotate-[1.5deg] select-none">
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="font-apkpraktikal text-[9px] font-bold text-cobalt-spark uppercase tracking-widest block">FEATURED PLATFORM</span>
                <span className="bg-lime-glow text-carbon-ink font-apkpraktikal text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">POPULAR</span>
              </div>
              <h3 className="font-apk-galeria text-2xl font-semibold text-carbon-ink m-0 mb-2">SaaS Cloud</h3>
              <p className="font-apk-galeria text-xs text-iron leading-relaxed mb-6">
                Hosted BullMQ cloud worker queues, multi-project environments, direct Pinecone indexing, and unlimited Discord approvals.
              </p>
              <div className="font-apk-galeria text-3xl font-medium text-carbon-ink mb-6">$79<span className="text-xs text-slate font-light"> / month</span></div>
            </div>
            
            <button 
              type="button" 
              onClick={() => setView('SIGN_UP')}
              className="w-full bg-carbon-ink text-canvas-white border border-none font-apkpraktikal text-xs font-bold uppercase tracking-widest py-3 rounded-full hover:opacity-95 cursor-pointer"
            >
              Start 14-Day Trial
            </button>
          </div>

          {/* Plan 3 */}
          <div className="bg-canvas-white border border-ash rounded-xl p-8 flex flex-col justify-between h-full transform hover:scale-[1.01] hover:rotate-[0deg] transition-all duration-200 rotate-[-1.5deg] select-none">
            <div>
              <span className="font-apkpraktikal text-[9px] font-bold text-slate uppercase tracking-widest block mb-4">CUSTOM SOLUTION</span>
              <h3 className="font-apk-galeria text-2xl font-semibold text-carbon-ink m-0 mb-2">Enterprise</h3>
              <p className="font-apk-galeria text-xs text-iron leading-relaxed mb-6">
                Deploy inside your private VPC, custom LLM model routing, federated SSO authorization, and dedicated SRE support.
              </p>
              <div className="font-apk-galeria text-3xl font-medium text-carbon-ink mb-6">Custom<span className="text-xs text-slate font-light"> / annual</span></div>
            </div>
            
            <button 
              type="button" 
              onClick={() => window.open('https://github.com/AyShakya/WatcherAgent', '_blank')}
              className="w-full bg-transparent border border-ash text-carbon-ink font-apkpraktikal text-xs font-bold uppercase tracking-widest py-3 rounded-full hover:bg-mist cursor-pointer"
            >
              Contact Sales
            </button>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-ash bg-canvas-white z-10 py-16 text-left w-full mt-auto shrink-0 select-none">
        <div className="max-w-[1280px] mx-auto px-8 grid grid-cols-1 md:grid-cols-12 gap-10">
          
          {/* Logo & copyright */}
          <div className="md:col-span-5 flex flex-col gap-4 text-left">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-carbon-ink flex items-center justify-center text-canvas-white">
                <Eye className="w-4.5 h-4.5 text-lime-glow" />
              </div>
              <span className="font-apk-galeria text-lg md:text-xl font-medium tracking-tight text-carbon-ink">
                watcher<span className="text-slate font-light">.agent</span>
              </span>
            </div>
            <p className="font-apk-galeria text-xs text-iron max-w-sm leading-relaxed m-0">
              Autonomous incident remediation pipeline. Integrates telemetry hooks to codebases, Dispatching human-in-the-loop approvals before patching.
            </p>
            <span className="font-apkpraktikal text-[9px] text-slate uppercase tracking-widest mt-4">
              © {new Date().getFullYear()} WATCHER AGENT CORP. ALL RIGHTS RESERVED.
            </span>
          </div>

          {/* Links col 1 */}
          <div className="md:col-span-3 flex flex-col gap-3 text-left">
            <span className="font-apkpraktikal text-[9px] font-bold text-carbon-ink uppercase tracking-widest mb-1 block">Architecture</span>
            <a href="#pipeline" className="font-apk-galeria text-xs text-iron hover:text-cobalt-spark transition-colors no-underline font-normal"> Remediator Pipeline</a>
            <a href="#product" className="font-apk-galeria text-xs text-iron hover:text-cobalt-spark transition-colors no-underline font-normal"> Console Showcase</a>
            <a href="https://github.com/AyShakya/WatcherAgent" target="_blank" rel="noopener noreferrer" className="font-apk-galeria text-xs text-iron hover:text-cobalt-spark transition-colors no-underline font-normal"> AyShakya/WatcherAgent</a>
          </div>

          {/* Links col 2 */}
          <div className="md:col-span-4 flex flex-col gap-3 text-left">
            <span className="font-apkpraktikal text-[9px] font-bold text-carbon-ink uppercase tracking-widest mb-1 block">Platform & Security</span>
            <a href="#pricing" className="font-apk-galeria text-xs text-iron hover:text-cobalt-spark transition-colors no-underline font-normal"> SaaS Cloud Pricing</a>
            <span className="font-apk-galeria text-xs text-iron leading-relaxed max-w-xs">
              All credentials symetrically encrypted on-disk using authenticated AES-256-GCM decryptions.
            </span>
          </div>

        </div>
      </footer>

    </div>
  );
}
