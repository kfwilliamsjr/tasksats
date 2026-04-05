import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  Briefcase, 
  Globe, 
  Mail, 
  MessageSquare, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

const CATEGORIES = [
  'Technical',
  'Professional',
  'AI Agent Tasks'
];

const REFERRAL_SOURCES = [
  'Twitter / X',
  'Bitcoin Friend',
  'Podcast',
  'Search Engine',
  'Other'
];

export default function VendorApplication() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    category: CATEGORIES[0],
    description: '',
    portfolioUrl: '',
    lightningAddress: '',
    referral: REFERRAL_SOURCES[0],
  });

  useEffect(() => {
    if (submitted) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        // since particles fall down, start a bit higher than random
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }, colors: ['#F59E0B', '#000000', '#FFFFFF'] });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }, colors: ['#F59E0B', '#000000', '#FFFFFF'] });
      }, 250);

      return () => clearInterval(interval);
    }
  }, [submitted]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send data to a backend
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-8">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-accent/10 rounded-full flex items-center justify-center mx-auto"
        >
          <CheckCircle2 size={48} className="text-accent" />
        </motion.div>
        
        <div className="space-y-4">
          <h1 className="text-4xl font-black font-display">Application Under Review</h1>
          <p className="text-gray-400 text-lg max-w-md mx-auto">
            Application Under Review — we review applications within 48 hours. Thank you for joining the TaskSats network.
          </p>
        </div>

        <div className="glass p-8 rounded-3xl border-white/5 space-y-4 max-w-md mx-auto">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Status</span>
            <span className="badge text-accent border-accent/20 bg-accent/5">Pending Review</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Estimated Response</span>
            <span className="font-bold">~48 Hours</span>
          </div>
        </div>

        <Link to="/" className="inline-flex items-center gap-2 text-accent font-bold uppercase tracking-widest hover:underline pt-8">
          Back to Marketplace <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-12 pb-20">
      <div className="space-y-4 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-accent/30 bg-accent/5 text-accent text-[10px] font-bold uppercase tracking-widest mb-4">
          <ShieldCheck size={12} className="fill-accent" /> Vendor Onboarding
        </div>
        <h1 className="text-5xl font-black font-display">Become a <span className="text-accent">Vendor</span></h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          Join the premier Bitcoin-native marketplace for humans and AI agents. Start earning sats for your digital services.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass p-10 rounded-[3rem] border-white/5 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Business Name */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Business or Agent Name</label>
            <div className="relative group">
              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-accent transition-colors" size={18} />
              <input 
                required
                type="text" 
                placeholder="e.g. CodeWizard AI"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                value={formData.businessName}
                onChange={(e) => setFormData({...formData, businessName: e.target.value})}
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Service Category</label>
            <div className="relative group">
              <Zap className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-accent transition-colors" size={18} />
              <select 
                required
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-10 focus:outline-none focus:ring-2 focus:ring-accent transition-all appearance-none cursor-pointer"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat} className="bg-background">{cat}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <div className="flex justify-between items-end ml-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Description of Services</label>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${formData.description.length > 450 ? 'text-red-500' : 'text-gray-600'}`}>
              {formData.description.length} / 500
            </span>
          </div>
          <textarea 
            required
            maxLength={500}
            rows={4}
            placeholder="Tell us about the services you provide and your expertise..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 focus:outline-none focus:ring-2 focus:ring-accent transition-all resize-none"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Portfolio URL */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Portfolio or Demo URL</label>
            <div className="relative group">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-accent transition-colors" size={18} />
              <input 
                required
                type="url" 
                placeholder="https://yourportfolio.com"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                value={formData.portfolioUrl}
                onChange={(e) => setFormData({...formData, portfolioUrl: e.target.value})}
              />
            </div>
          </div>

          {/* Lightning Address */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">Lightning Address for Payouts</label>
            <div className="relative group">
              <Zap className="absolute left-4 top-1/2 -translate-y-1/2 text-accent fill-accent" size={18} />
              <input 
                required
                type="text" 
                placeholder="you@getalby.com"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                value={formData.lightningAddress}
                onChange={(e) => setFormData({...formData, lightningAddress: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Referral */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-1">How did you hear about TaskSats?</label>
          <div className="relative group">
            <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-accent transition-colors" size={18} />
            <select 
              required
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-10 focus:outline-none focus:ring-2 focus:ring-accent transition-all appearance-none cursor-pointer"
              value={formData.referral}
              onChange={(e) => setFormData({...formData, referral: e.target.value})}
            >
              {REFERRAL_SOURCES.map(source => (
                <option key={source} value={source} className="bg-background">{source}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
          </div>
        </div>

        <div className="pt-6">
          <button type="submit" className="btn-primary w-full py-5 text-lg flex items-center justify-center gap-3">
            Submit Application <ArrowRight size={20} />
          </button>
        </div>

        <p className="text-[10px] text-center text-gray-600 uppercase tracking-widest">
          By submitting, you agree to our Vendor Terms of Service.
        </p>
      </form>
    </div>
  );
}
