import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  Clock, 
  FileText, 
  Download, 
  MessageSquare, 
  Star, 
  AlertTriangle, 
  Send, 
  Paperclip,
  ArrowLeft,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { formatSats, satsToUsd, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

const STATUSES = ['Funded', 'In Progress', 'Submitted', 'Review', 'Complete'];
const CURRENT_STATUS_INDEX = 3; // Review

const MOCK_MESSAGES = [
  { id: 'm1', sender: 'Buyer', text: "Hi! I've funded the task. Please let me know if you need any more details.", time: 'Oct 24, 10:00 AM' },
  { id: 'm2', sender: 'Vendor', text: "Got it! Starting on the script now. I'll have a draft for you by tomorrow.", time: 'Oct 24, 11:30 AM' },
  { id: 'm3', sender: 'Vendor', text: "I've finished the script and documentation. Please review the deliverables below.", time: 'Oct 25, 02:15 PM', isSystem: true },
];

export default function TaskThread() {
  const { id } = useParams();
  const [rating, setRating] = useState(0);
  const [isAccepted, setIsAccepted] = useState(false);
  const [message, setMessage] = useState('');

  const handleAccept = () => {
    setIsAccepted(true);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Header & Status Bar */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Link to="/wallet" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={16} />
            <span>Back to Wallet</span>
          </Link>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20">
            <ShieldCheck size={14} className="text-accent" />
            <span className="text-[10px] font-bold text-accent uppercase tracking-widest">Escrow Protected</span>
          </div>
        </div>

        <div className="glass p-8 rounded-[2.5rem] border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-[100px] rounded-full" />
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
            {STATUSES.map((status, i) => (
              <div key={status} className="flex-1 w-full flex flex-col items-center gap-3 group">
                <div className="flex items-center w-full">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 border-2 shadow-lg",
                    i <= CURRENT_STATUS_INDEX 
                      ? "bg-accent border-accent text-black scale-110 shadow-accent/20" 
                      : "bg-white/5 border-white/10 text-gray-500"
                  )}>
                    {i < CURRENT_STATUS_INDEX ? <CheckCircle2 size={20} /> : <span className="text-sm font-black">{i + 1}</span>}
                  </div>
                  {i < STATUSES.length - 1 && (
                    <div className={cn(
                      "flex-1 h-1 mx-2 rounded-full transition-all duration-1000",
                      i < CURRENT_STATUS_INDEX ? "bg-accent" : "bg-white/5"
                    )} />
                  )}
                </div>
                <span className={cn(
                  "text-[10px] font-black uppercase tracking-[0.2em]",
                  i <= CURRENT_STATUS_INDEX ? "text-accent" : "text-gray-500"
                )}>
                  {status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Main Chat & Deliverables */}
        <div className="lg:col-span-2 space-y-8">
          {/* Deliverable Section */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-8 rounded-[2.5rem] border-accent/30 border-2 space-y-6 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-black font-black text-[10px] uppercase tracking-widest animate-pulse">
                Action Required
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-black flex items-center gap-3">
                <FileText size={24} className="text-accent" /> Deliverable
              </h2>
              <p className="text-gray-400 text-sm">The vendor has submitted the final work for your review.</p>
            </div>

            <div className="bg-black/40 rounded-2xl p-6 border border-white/5 font-mono text-sm text-gray-300 overflow-x-auto">
              <pre className="whitespace-pre-wrap">
                {`# Automation Script v1.0
import os
import requests

def main():
    print("Running task automation...")
    # ... code logic here ...

if __name__ == "__main__":
    main()`}
              </pre>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent/10 rounded-lg text-accent">
                    <FileText size={18} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold">script.py</p>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">12 KB • Python Source</p>
                  </div>
                </div>
                <Download size={18} className="text-gray-500 group-hover:text-accent transition-colors" />
              </button>
              <button className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent/10 rounded-lg text-accent">
                    <FileText size={18} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold">documentation.pdf</p>
                    <p className="text-[10px] text-gray-600 uppercase font-bold tracking-widest">1.2 MB • PDF Document</p>
                  </div>
                </div>
                <Download size={18} className="text-gray-500 group-hover:text-accent transition-colors" />
              </button>
            </div>
          </motion.section>

          {/* Action Buttons */}
          {!isAccepted ? (
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={handleAccept}
                className="btn-primary py-5 text-lg flex items-center justify-center gap-3 shadow-2xl shadow-accent/20"
              >
                <CheckCircle2 size={22} /> Accept & Release Payment
              </button>
              <button className="btn-secondary py-5 text-lg flex items-center justify-center gap-3 border-2 border-white/10 hover:border-white/20">
                <MessageSquare size={22} /> Request Revision
              </button>
              <button className="md:col-span-2 border-2 border-red-500/20 hover:border-red-500/40 text-red-400 py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all">
                <AlertTriangle size={18} /> Open Dispute
              </button>
            </section>
          ) : (
            <motion.section 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass p-10 rounded-[2.5rem] text-center space-y-6 border-green-500/20 bg-green-500/5"
            >
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto text-green-400">
                <CheckCircle2 size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black">Order Completed!</h3>
                <p className="text-gray-400">Payment has been released to the vendor. Please leave a rating.</p>
              </div>
              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star 
                    key={s} 
                    size={40} 
                    className={cn(
                      "cursor-pointer transition-all hover:scale-110", 
                      s <= rating ? "fill-accent text-accent drop-shadow-[0_0_10px_rgba(255,184,0,0.5)]" : "text-gray-700 hover:text-accent/50"
                    )}
                    onClick={() => setRating(s)}
                  />
                ))}
              </div>
            </motion.section>
          )}

          {/* Chat Thread */}
          <section className="glass rounded-[2.5rem] border-white/5 flex flex-col h-[500px]">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-black flex items-center gap-2 uppercase tracking-widest text-xs">
                <MessageSquare size={16} className="text-accent" /> Conversation
              </h3>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Vendor: CodeWizard</span>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
              {MOCK_MESSAGES.map((msg) => (
                <div 
                  key={msg.id} 
                  className={cn(
                    "flex flex-col max-w-[80%]",
                    msg.sender === 'Buyer' ? "ml-auto items-end" : "items-start"
                  )}
                >
                  <div className={cn(
                    "p-4 rounded-2xl text-sm",
                    msg.sender === 'Buyer' 
                      ? "bg-accent text-black font-medium rounded-tr-none" 
                      : msg.isSystem 
                        ? "bg-white/5 border border-accent/20 text-accent font-bold w-full text-center italic"
                        : "bg-white/5 border border-white/10 text-gray-300 rounded-tl-none"
                  )}>
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-gray-500 mt-1 font-bold uppercase tracking-widest">{msg.time}</span>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-white/5">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Type a message..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-24 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button className="p-2 text-gray-500 hover:text-white transition-colors">
                    <Paperclip size={20} />
                  </button>
                  <button className="p-2 bg-accent rounded-xl text-black hover:bg-accent/80 transition-colors">
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-6 sticky top-24">
          <section className="glass p-8 rounded-[2.5rem] border-white/5 space-y-6">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-gray-500">
              <Zap size={14} className="text-accent fill-accent" /> Order Summary
            </div>
            
            <div className="space-y-4">
              <div className="space-y-1">
                <h3 className="font-black text-lg">Custom Python Automation Script</h3>
                <p className="text-xs text-gray-500">Service ID: #TS-8291-X</p>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Base Price</span>
                  <span className="font-bold">{formatSats(50000)} sats</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Rush Delivery</span>
                  <span className="font-bold text-accent">+{formatSats(10000)} sats</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Platform Fee</span>
                  <span className="font-bold">+{formatSats(3000)} sats</span>
                </div>
                <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total Funded</p>
                    <p className="text-2xl font-black text-accent">{formatSats(63000)} sats</p>
                  </div>
                  <p className="text-xs font-bold text-gray-500 mb-1">≈ {satsToUsd(63000)}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="glass p-8 rounded-[2.5rem] border-white/5 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center font-black text-black text-xl">CW</div>
              <div>
                <p className="font-black text-lg">CodeWizard</p>
                <div className="flex items-center gap-1 text-accent">
                  <Star size={12} className="fill-accent" />
                  <span className="text-xs font-bold">4.9 (128 reviews)</span>
                </div>
              </div>
            </div>
            <button className="btn-secondary w-full py-3 text-sm font-bold">View Profile</button>
          </section>
        </div>
      </div>
    </div>
  );
}
