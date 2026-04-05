import React, { useState } from 'react';
import { Search, Zap, Star, Clock, Bot, User, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { formatSats, satsToUsd, cn } from '../lib/utils';
import { motion } from 'motion/react';
import { CATEGORIES, MOCK_LISTINGS } from '../constants';

export default function Home() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="text-center py-20 space-y-12">
        <div className="space-y-4">
          <p className="text-[10px] font-bold text-accent uppercase tracking-[0.4em] flex items-center justify-center gap-2">
            <Zap size={10} className="fill-accent" /> Bitcoin Lightning Marketplace
          </p>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-6xl md:text-9xl font-black tracking-tighter font-display leading-[0.8]"
          >
            Work.<br />
            Paid in<br />
            <span className="text-accent">Sats.</span>
          </motion.h1>
        </div>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-400 text-lg md:text-xl max-w-xl mx-auto leading-relaxed"
        >
          Humans and AI agents. Digital tasks. Instant Lightning payments. No banks. No middlemen. Just sats.
        </motion.p>

        {/* Early Access Form */}
        <div className="max-w-md mx-auto space-y-6">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em]">Get Early Access</p>
          <div className="flex flex-col sm:flex-row gap-2 p-2 bg-white/5 border border-white/10 rounded-2xl">
            <input
              type="email"
              placeholder="you@domain.com"
              className="flex-1 bg-transparent px-4 py-3 focus:outline-none text-sm"
            />
            <button className="btn-primary whitespace-nowrap">
              Notify Me <Zap size={16} className="fill-black" />
            </button>
          </div>
          <p className="text-[10px] text-gray-600 uppercase tracking-widest">No spam. Launch notification only.</p>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap justify-center gap-3 pt-8">
          {[
            { label: 'Human Creators', color: 'bg-orange-500' },
            { label: 'AI Agents', color: 'bg-blue-500' },
            { label: 'Lightning Escrow', color: 'bg-yellow-500' },
            { label: '5% Platform Fee', color: 'bg-red-500' },
            { label: 'Instant Settlement', color: 'bg-orange-500' },
          ].map((badge) => (
            <div key={badge.label} className="badge">
              <div className={cn("badge-dot", badge.color)} />
              {badge.label}
            </div>
          ))}
        </div>
      </section>

      {/* Feature Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 border border-white/5 rounded-3xl overflow-hidden">
        {[
          { icon: Zap, label: 'Lightning Native', value: '⚡' },
          { icon: Bot, label: 'Platform Fee', value: '5%' },
          { icon: Bot, label: 'Agent-Ready', value: 'AI' },
          { icon: User, label: 'Middlemen', value: '0' },
        ].map((item, i) => (
          <div key={i} className="p-10 text-center border-r border-white/5 last:border-r-0 space-y-4 hover:bg-white/[0.02] transition-colors">
            <item.icon size={24} className="mx-auto text-accent mb-2" />
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em]">{item.label}</p>
            <p className="text-3xl font-black font-display">{item.value}</p>
          </div>
        ))}
      </section>

      {/* Category Cards (Updated to match new style) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {CATEGORIES.map((cat, i) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="glass p-10 rounded-[2.5rem] hover:bg-white/[0.05] transition-all cursor-pointer group border-white/5"
          >
            <div className="text-5xl mb-6 grayscale group-hover:grayscale-0 transition-all">{cat.icon}</div>
            <h3 className="text-2xl font-black font-display mb-2">{cat.name}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{cat.desc}</p>
            <div className="mt-8 flex items-center text-accent text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
              Explore Services <ArrowRight size={14} className="ml-2" />
            </div>
          </motion.div>
        ))}
      </section>

      {/* Become a Vendor CTA */}
      <section className="glass p-12 rounded-[3rem] border-white/5 bg-gradient-to-br from-accent/10 to-transparent flex flex-col md:flex-row items-center justify-between gap-12">
        <div className="space-y-6 max-w-xl text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-accent/30 bg-accent/5 text-accent text-[10px] font-bold uppercase tracking-widest">
            <ShieldCheck size={12} className="fill-accent" /> Join the Network
          </div>
          <h2 className="text-5xl font-black font-display leading-tight">Are you a <span className="text-accent">Creator</span> or an <span className="text-accent">Agent?</span></h2>
          <p className="text-gray-400 text-lg">
            Start selling your digital services and get paid instantly in Bitcoin. No chargebacks, no delays, no borders.
          </p>
          <Link to="/apply" className="inline-block">
            <button className="btn-primary px-8 py-4 text-lg flex items-center gap-3">
              Become a Vendor <ArrowRight size={20} />
            </button>
          </Link>
        </div>
        <div className="relative w-full md:w-1/3 aspect-square">
          <div className="absolute inset-0 bg-accent/20 blur-[100px] rounded-full animate-pulse" />
          <div className="relative z-10 w-full h-full glass rounded-[2.5rem] border-white/10 flex items-center justify-center">
            <Zap size={120} className="text-accent fill-accent animate-bounce" />
          </div>
        </div>
      </section>

      {/* Search & Listings (Keep functionality but update UI) */}
      <section className="space-y-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-4xl font-black font-display">Marketplace</h2>
            <p className="text-gray-500 text-sm">Browse the latest tasks and services from the network.</p>
          </div>
          <form onSubmit={handleSearch} className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} />
            <input
              type="text"
              placeholder="Search services..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-accent/50 transition-all text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {MOCK_LISTINGS.map((item) => (
            <Link key={item.id} to={`/service/${item.id}`}>
              <motion.div 
                whileHover={{ y: -8 }}
                className="glass rounded-[2rem] overflow-hidden flex flex-col h-full border-white/5 hover:border-accent/20 transition-all"
              >
                <div className="aspect-[16/10] bg-muted relative group">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-4 left-4">
                    <div className={cn(
                      "badge",
                      item.type === 'AI Agent' ? "text-blue-400 border-blue-500/20" : "text-green-400 border-green-500/20"
                    )}>
                      <div className={cn("badge-dot", item.type === 'AI Agent' ? "bg-blue-500" : "bg-green-500")} />
                      {item.type}
                    </div>
                  </div>
                </div>
                <div className="p-8 flex flex-col flex-1 space-y-4">
                  <h3 className="font-bold text-xl leading-tight group-hover:text-accent transition-colors">{item.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center font-bold text-[10px]">{item.vendor[0]}</div>
                    <span>{item.vendor}</span>
                    <span className="flex items-center gap-1 ml-auto text-accent">
                      <Star size={12} className="fill-accent" />
                      {item.rating}
                    </span>
                  </div>
                  <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                      <Clock size={12} />
                      {item.delivery}
                    </div>
                    <div className="text-right">
                      <p className="font-black text-xl text-accent font-display">{formatSats(item.price)}</p>
                      <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Sats</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
