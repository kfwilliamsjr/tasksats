import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Zap, 
  Mail, 
  Lock, 
  ArrowRight, 
  ShieldCheck,
  Wand2,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export default function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate login
    setTimeout(() => {
      setIsLoading(false);
      navigate('/profile');
    }, 2000);
  };

  const handleMagicLink = () => {
    setIsLoading(true);
    // Simulate magic link send
    setTimeout(() => {
      setIsLoading(false);
      setMagicLinkSent(true);
    }, 1500);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo & Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-accent/10 border border-accent/20 mb-4">
            <Zap className="text-accent fill-accent" size={24} />
            <span className="text-2xl font-black tracking-tighter uppercase">TaskSats</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight">Welcome back</h1>
          <p className="text-gray-400">Log in to manage your tasks and sats</p>
        </div>

        <div className="glass p-8 md:p-10 rounded-[2.5rem] border-white/5 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[100px] rounded-full -mr-32 -mt-32" />
          
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {magicLinkSent ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6 py-4"
              >
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto text-accent">
                  <Mail size={32} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold">Check your email</h3>
                  <p className="text-sm text-gray-400">We've sent a magic link to your inbox. Click the link to log in instantly.</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setMagicLinkSent(false)}
                  className="text-accent font-bold text-sm hover:underline"
                >
                  Back to password login
                </button>
              </motion.div>
            ) : (
              <>
                <div className="space-y-4">
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-accent transition-colors" size={18} />
                    <input
                      required
                      type="email"
                      maxLength={254}
                      placeholder="Email Address"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                    />
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-accent transition-colors" size={18} />
                    <input
                      required
                      type="password"
                      maxLength={128}
                      placeholder="Password"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <Link to="/forgot-password" title="Forgot password link" className="text-xs text-gray-500 hover:text-accent transition-colors">
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full py-5 text-lg flex items-center justify-center gap-3 shadow-2xl shadow-accent/20 hover:shadow-accent/40 transition-all active:scale-[0.98]"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-white"></div>
                  ) : (
                    <>Log In <ArrowRight size={20} /></>
                  )}
                </button>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/5"></div>
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
                    <span className="bg-[#0A0A0A] px-4 text-gray-600">Or</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleMagicLink}
                  disabled={isLoading}
                  className="w-full py-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all flex items-center justify-center gap-3 text-sm font-bold group"
                >
                  <Sparkles size={18} className="text-accent group-hover:scale-110 transition-transform" />
                  Send Magic Link
                </button>

                <div className="text-center space-y-4">
                  <p className="text-sm text-gray-500">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-accent font-bold hover:underline">Sign up</Link>
                  </p>
                  <div className="flex items-center gap-2 justify-center text-[10px] text-gray-600 uppercase tracking-widest font-bold">
                    <ShieldCheck size={12} className="text-accent" />
                    Secure non-custodial platform
                  </div>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
