import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, Loader2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SignIn({
  setView,
  authEmail,
  authPassword,
  authError,
  setAuthError,
  authLoading,
  handleAuthSubmit
}) {
  const [email, setEmail] = useState(authEmail || '');
  const [password, setPassword] = useState(authPassword || '');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    handleAuthSubmit(e, 'SIGN_IN', email, password);
  };

  const renderError = (errorText) => {
    if (!errorText) return null;
    
    const blocks = errorText.split('\n\n').filter(Boolean);
    
    return (
      <div className="flex flex-col gap-3 mb-6">
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
    <div className="min-h-[100dvh] flex items-center justify-center p-4 sm:p-6 bg-canvas-white graph-grid relative select-none overflow-hidden">
      
      {/* Back button */}
      <button 
        onClick={() => { setAuthError(''); setView('LANDING'); }}
        className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-2 bg-transparent border border-ash text-iron font-apkpraktikal text-xs uppercase tracking-widest px-4 py-2 rounded-full cursor-pointer hover:bg-mist transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        className="w-full max-w-[440px] bg-canvas-white border border-ash rounded-xl p-6 sm:p-8 md:p-10 z-10 text-left min-w-0"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-mist flex items-center justify-center text-carbon-ink mx-auto mb-4 border border-ash">
            <Eye className="w-5 h-5 text-cobalt-spark" />
          </div>
          
          {/* Eyebrow */}
          <div className="flex items-center justify-center gap-1.5 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cobalt-spark"></span>
            <span className="font-apkpraktikal text-[10px] uppercase tracking-widest text-carbon-ink font-medium">AUTHENTICATION GATE</span>
          </div>

          <h2 className="font-apk-galeria text-2xl md:text-3xl text-carbon-ink font-medium mb-2">Welcome Back</h2>
          <p className="font-apk-galeria text-sm text-iron">Access your local Watcher incident control tower.</p>
        </div>
        
        {renderError(authError)}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2 text-left">
            <label className="font-apkpraktikal text-[10px] font-bold text-iron uppercase tracking-widest flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate" /> Email Address
            </label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="name@company.com" 
              required 
              className="bg-mist border border-ash rounded-lg px-4 py-3 text-sm text-carbon-ink outline-none font-sans transition-all duration-200 focus:ring-1 focus:ring-cobalt-spark focus:border-cobalt-spark w-full"
            />
          </div>
          <div className="flex flex-col gap-2 text-left">
            <label className="font-apkpraktikal text-[10px] font-bold text-iron uppercase tracking-widest flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate" /> Password
            </label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••" 
                required 
                className="bg-mist border border-ash rounded-lg pl-4 pr-10 py-3 text-sm text-carbon-ink outline-none font-sans transition-all duration-200 focus:ring-1 focus:ring-cobalt-spark focus:border-cobalt-spark w-full"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none text-slate hover:text-carbon-ink cursor-pointer flex items-center justify-center p-1 outline-none transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          
          {/* Carbon Ink Primary CTA */}
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit" 
            className="bg-carbon-ink text-canvas-white border-none rounded-full py-3.5 font-apkpraktikal text-xs font-bold uppercase tracking-widest cursor-pointer mt-2.5 flex items-center justify-center gap-2" 
            disabled={authLoading}
          >
            {authLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-lime-glow" />
                <span>Signing In...</span>
              </>
            ) : 'Access Dashboard'}
          </motion.button>
        </form>
        
        <div className="mt-6 text-center font-apk-galeria text-sm text-iron">
          Don't have an account?{' '}
          <span 
            className="text-cobalt-spark font-medium cursor-pointer hover:underline" 
            onClick={() => { setView('SIGN_UP'); setAuthError(''); }}
          >
            Sign Up
          </span>
        </div>
      </motion.div>
    </div>
  );
}
