import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Zap, 
  Mail, 
  Lock, 
  User, 
  Briefcase, 
  ArrowRight, 
  Globe, 
  Tag, 
  FileText,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function SignUp() {
  const navigate = useNavigate();
  const [role, setRole] = useState<'buyer' | 'vendor'>('buyer');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate signup
    setTimeout(() => {
      setIsLoading(false);
      navigate('/profile');
    }, 2000);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-xl space-y-8">
        {/* Logo & Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-accent/10 border border-accent/20 mb-4">
            <Zap className="text-accent fill-accent" size={24} />
            <span className="text-2xl font-black tracking-tighter uppercase">TaskSats</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight">Create your account</h1>
          <p className="text-gray-400">Join the future of work on the Bitcoin Lightning Network</p>
        </div>

        <div className="glass p-8 md:p-10 rounded-[2.5rem] border-white/5 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[100px] rounded-full -mr-32 -mt-32" />
          
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            {/* Role Selection */}
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-gray-500 ml-1">I want to...</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole('buyer')}
                  className={cn(
                    "flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300",
                    role === 'buyer' 
                      ? "bg-accent/10 border-accent text-accent shadow-[0_0_20px_rgba(255,184,0,0.1)]" 
                      : "bg-white/5 border-white/5 text-gray-500 hover:border-white/10"
                  )}
                >
                  <User size={24} />
                  <span className="text-sm font-bold">Buy Services</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('vendor')}
                  className={cn(
                    "flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300",
                    role === 'vendor' 
                      ? "bg-accent/10 border-accent text-accent shadow-[0_0_20px_rgba(255,184,0,0.1)]" 
                      : "bg-white/5 border-white/5 text-gray-500 hover:border-white/10"
                  )}
                >
                  <Briefcase size={24} />
                  <span className="text-sm font-bold">Sell Services</span>
                </button>
              </div>
            </div>

            {/* Common Fields */}
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

            {/* Vendor Specific Fields */}
            <AnimatePresence mode="wait">
              {role === 'vendor' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden pt-2"
                >
                  <div className="h-px bg-white/5 my-2" />
                  <div className="relative group">
                    <FileText className="absolute left-4 top-4 text-gray-500 group-focus-within:text-accent transition-colors" size={18} />
                    <textarea
                      required
                      placeholder="Agent/Service Description"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                    />
                  </div>
                  <div className="relative group">
                    <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-accent transition-colors" size={18} />
                    <input
                      required
                      type="text"
                      placeholder="Categories (e.g. Code, Design, Writing)"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                    />
                  </div>
                  <div className="relative group">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-accent transition-colors" size={18} />
                    <input
                      type="url"
                      placeholder="Demo URL (Portfolio, GitHub, etc.)"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full py-5 text-lg flex items-center justify-center gap-3 shadow-2xl shadow-accent/20 hover:shadow-accent/40 transition-all active:scale-[0.98]"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-white"></div>
              ) : (
                <>Create Account <ArrowRight size={20} /></>
              )}
            </button>

            <div className="text-center space-y-4">
              <p className="text-sm text-gray-500">
                Already have an account?{' '}
                <Link to="/login" className="text-accent font-bold hover:underline">Log in</Link>
              </p>
              <div className="flex items-center gap-2 justify-center text-[10px] text-gray-600 uppercase tracking-widest font-bold">
                <ShieldCheck size={12} className="text-accent" />
                Secure non-custodial platform
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
