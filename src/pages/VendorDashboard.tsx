import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Pause, Play, Inbox, TrendingUp, Wallet, Zap, ExternalLink, Clock } from 'lucide-react';
import { formatSats, satsToUsd } from '../lib/utils';
import { motion } from 'motion/react';

const MOCK_LISTINGS = [
  { id: '1', title: 'Custom Python Automation Script', price: 50000, status: 'active', orders: 12 },
  { id: '2', title: 'Data Cleaning Service', price: 20000, status: 'paused', orders: 5 },
];

const MOCK_ORDERS = [
  { id: 'o1', service: 'Custom React Component Library', buyer: 'BitStacker', price: 75000, status: 'Funded', date: '2h ago' },
  { id: 'o2', service: 'Sales Data Visualization Dashboard', buyer: 'SatsLover', price: 45000, status: 'In Progress', date: '5h ago' },
  { id: 'o3', service: 'Zapier Workflow Automation', buyer: 'LightningUser', price: 40000, status: 'Completed', date: '1d ago' },
];

export default function VendorDashboard() {
  const [showNewListing, setShowNewListing] = useState(false);
  const [lightningAddress, setLightningAddress] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const validateLightningAddress = (address: string) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!address) {
      setError('');
      return true;
    }
    if (!regex.test(address)) {
      setError('Invalid lightning address format (e.g., name@domain.com)');
      return false;
    }
    setError('');
    return true;
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLightningAddress(value);
    validateLightningAddress(value);
    setSuccess(false);
  };

  const handleSave = () => {
    if (validateLightningAddress(lightningAddress)) {
      // Logic to save settings would go here
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-4xl font-black">Vendor Dashboard</h1>
        <button 
          onClick={() => setShowNewListing(true)}
          className="btn-primary flex items-center justify-center gap-2"
        >
          <Plus size={20} /> Create New Listing
        </button>
      </div>

      {/* Earnings Summary */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <TrendingUp size={20} className="text-accent" /> Earnings Summary
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass p-6 rounded-3xl space-y-2">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-bold uppercase tracking-widest">Available Earnings</span>
              <Wallet size={16} />
            </div>
            <p className="text-3xl font-black text-accent">{formatSats(125000)} sats</p>
            <p className="text-xs text-gray-500">~{satsToUsd(125000)} USD</p>
            <button className="w-full mt-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold transition-colors">
              Withdraw
            </button>
          </div>
          <div className="glass p-6 rounded-3xl space-y-2">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-bold uppercase tracking-widest">Pending Escrow</span>
              <Clock size={16} />
            </div>
            <p className="text-3xl font-black text-white">{formatSats(45000)} sats</p>
            <p className="text-xs text-gray-500">~{satsToUsd(45000)} USD</p>
          </div>
          <div className="glass p-6 rounded-3xl space-y-2">
            <div className="flex items-center justify-between text-gray-400">
              <span className="text-xs font-bold uppercase tracking-widest">Total Earned</span>
              <TrendingUp size={16} />
            </div>
            <p className="text-3xl font-black text-green-400">{formatSats(1250000)} sats</p>
            <p className="text-xs text-gray-500">~{satsToUsd(1250000)} USD</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* My Listings */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap size={24} className="text-accent" /> My Listings
          </h2>
          <div className="space-y-4">
            {MOCK_LISTINGS.map((listing) => (
              <div key={listing.id} className="glass p-6 rounded-2xl flex items-center justify-between group">
                <div className="space-y-1">
                  <h3 className="font-bold">{listing.title}</h3>
                  <p className="text-xs text-gray-500">{formatSats(listing.price)} sats • {listing.orders} orders</p>
                  <span className={cn(
                    "inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                    listing.status === 'active' ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"
                  )}>
                    {listing.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white">
                    <Edit2 size={18} />
                  </button>
                  <button className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white">
                    {listing.status === 'active' ? <Pause size={18} /> : <Play size={18} />}
                  </button>
                  <button className="p-2 hover:bg-red-500/20 rounded-lg text-red-400">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Order Inbox */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Inbox size={24} className="text-accent" /> Order Inbox
          </h2>
          <div className="space-y-4">
            {MOCK_ORDERS.map((order) => (
              <div key={order.id} className="glass p-6 rounded-2xl space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-sm">{order.service}</h3>
                    <p className="text-xs text-gray-400">Buyer: {order.buyer} • {order.date}</p>
                  </div>
                  <span className={cn(
                    "px-2 py-1 rounded text-[10px] font-bold uppercase",
                    order.status === 'Funded' ? "bg-accent/20 text-accent" : 
                    order.status === 'In Progress' ? "bg-blue-500/20 text-blue-400" : 
                    "bg-green-500/20 text-green-400"
                  )}>
                    {order.status}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <span className="font-bold">{formatSats(order.price)} sats</span>
                  <button className="text-accent text-xs font-bold flex items-center gap-1 hover:underline">
                    View Task <ExternalLink size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Payout Settings */}
      <section className="glass p-8 rounded-3xl space-y-6">
        <h2 className="text-xl font-bold">Payout Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm text-gray-400 font-bold uppercase tracking-widest">Lightning Address</label>
            <input 
              type="text" 
              placeholder="user@getalby.com"
              value={lightningAddress}
              onChange={handleAddressChange}
              className={cn(
                "w-full bg-white/5 border rounded-xl p-4 focus:outline-none focus:ring-2",
                error ? "border-red-500 focus:ring-red-500/50" : "border-white/10 focus:ring-accent/50"
              )}
            />
            {error && <p className="text-red-500 text-xs font-bold">{error}</p>}
          </div>
          <div className="flex items-end">
            <button 
              onClick={handleSave}
              className={cn(
                "btn-secondary w-full transition-all",
                success && "bg-green-500 hover:bg-green-600 text-white border-green-500"
              )}
            >
              {success ? 'Settings Saved!' : 'Save Settings'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
