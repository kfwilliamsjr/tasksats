import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Upload, Link as LinkIcon, Zap, Info, ShieldCheck } from 'lucide-react';
import { formatSats, satsToUsd } from '../lib/utils';
import { motion } from 'motion/react';

export default function OrderForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [rush, setRush] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const basePrice = 50000;
  const rushFee = rush ? basePrice * 0.2 : 0;
  const platformFee = Math.round((basePrice + rushFee) * 0.05);
  const totalPrice = basePrice + rushFee + platformFee;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate payment and submission
    setTimeout(() => {
      navigate('/task/new-order-id');
    }, 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-10">
      <Link to={`/service/${id}`} className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
        <ArrowLeft size={16} />
        <span>Back to service</span>
      </Link>

      <div className="space-y-2">
        <h1 className="text-4xl font-black">Submit Your Order</h1>
        <p className="text-gray-400">Ordering: <span className="text-white font-bold">Custom Python Automation Script</span></p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="space-y-4">
          <label className="block font-bold text-lg">Task Description</label>
          <textarea
            required
            placeholder="Describe exactly what you need done..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl p-6 min-h-[200px] focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </section>

        <section className="space-y-4">
          <label className="block font-bold text-lg">Attachments</label>
          <div className="border-2 border-dashed border-white/10 rounded-2xl p-10 text-center hover:border-accent/50 transition-all cursor-pointer group bg-white/[0.02]">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/10 transition-colors">
              <Upload className="text-gray-500 group-hover:text-accent transition-colors" size={24} />
            </div>
            <p className="text-gray-400 font-medium">Drag and drop files here, or click to browse</p>
            <p className="text-[10px] text-gray-600 mt-2 uppercase tracking-widest font-bold">Max 50MB per file • PNG, JPG, PDF, ZIP</p>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="space-y-4">
            <label className="block font-bold text-lg">Reference URL</label>
            <div className="relative group">
              <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-accent transition-colors" size={18} />
              <input
                type="url"
                placeholder="https://..."
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
              />
            </div>
          </section>

          <section className="space-y-4">
            <label className="block font-bold text-lg">Special Instructions</label>
            <input
              type="text"
              placeholder="Any specific preferences?"
              className="w-full bg-white/5 border border-white/10 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
            />
          </section>
        </div>

        <section 
          className={cn(
            "glass p-6 rounded-2xl flex items-center justify-between cursor-pointer transition-all border-2",
            rush ? "border-accent/30 bg-accent/5" : "border-white/5"
          )}
          onClick={() => setRush(!rush)}
        >
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-12 h-6 rounded-full relative transition-colors",
              rush ? "bg-accent" : "bg-white/10"
            )}>
              <div className={cn(
                "absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm",
                rush ? "left-7" : "left-1"
              )} />
            </div>
            <div>
              <p className="font-bold">Rush Delivery</p>
              <p className="text-xs text-gray-500">Get it 50% faster for an extra 20%</p>
            </div>
          </div>
          <span className="font-bold text-accent">+{formatSats(basePrice * 0.2)} sats</span>
        </section>

        {/* Summary Card */}
        <div className="glass p-8 rounded-[2.5rem] space-y-6 border-accent/20 border-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 blur-3xl rounded-full -mr-16 -mt-16" />
          
          <h3 className="text-xl font-bold flex items-center gap-2 relative z-10">
            <Zap size={20} className="text-accent fill-accent" /> Order Summary
          </h3>
          
          <div className="space-y-4 relative z-10">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Task Price</span>
                <span className="font-medium">{formatSats(basePrice)} sats</span>
              </div>
              {rush && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Rush Fee (20%)</span>
                  <span className="font-medium text-accent">+{formatSats(rushFee)} sats</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Platform Fee (5%)</span>
                <span className="font-medium">+{formatSats(platformFee)} sats</span>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 flex justify-between items-end">
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Amount</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-5xl font-black text-accent tracking-tighter">{formatSats(totalPrice)}</p>
                  <p className="text-xl font-bold text-accent/50">sats</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-white">≈ {satsToUsd(totalPrice)}</p>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">USD Equivalent</p>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="btn-primary w-full py-5 text-xl flex items-center justify-center gap-3 shadow-2xl shadow-accent/20 hover:shadow-accent/40 transition-all active:scale-[0.98]"
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-white"></div>
            ) : (
              <>Pay & Submit <Zap size={20} className="fill-white" /></>
            )}
          </button>

          <div className="flex items-center gap-2 justify-center text-[10px] text-gray-500 uppercase tracking-widest font-bold">
            <ShieldCheck size={12} className="text-green-400" />
            Funds held in secure escrow until delivery
          </div>
        </div>
      </form>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
