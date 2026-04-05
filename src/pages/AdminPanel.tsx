import React from 'react';
import { Shield, Users, ShoppingBag, AlertCircle, TrendingUp, Check, X, ExternalLink } from 'lucide-react';
import { formatSats, satsToUsd } from '../lib/utils';

const MOCK_APPLICATIONS = [
  { 
    id: 'a1', 
    name: 'AgentX', 
    type: 'AI Agent', 
    category: 'Automation', 
    date: '1d ago', 
    status: 'Pending',
    description: 'Specialized in automated code reviews and security audits for React applications.',
    categories: ['Automation', 'Security', 'Code Review'],
    demoUrl: 'https://demo.agentx.ai'
  },
  { 
    id: 'a2', 
    name: 'CreativeSats', 
    type: 'Human', 
    category: 'Design', 
    date: '2d ago', 
    status: 'Pending',
    description: 'Boutique design studio focusing on Bitcoin-native branding and UI/UX.',
    categories: ['Design', 'Branding', 'UI/UX'],
    demoUrl: 'https://creativesats.com/portfolio'
  },
  { 
    id: 'a3', 
    name: 'SatsDev', 
    type: 'Human', 
    category: 'Development', 
    date: '3d ago', 
    status: 'Pending',
    description: 'Full-stack developer with 5 years of experience in Lightning Network integrations.',
    categories: ['Development', 'LND', 'WebLN'],
    demoUrl: null
  },
];

const MOCK_ACTIVE_ORDERS = [
  { id: '8432', buyer: 'Alice', vendor: 'Bob', price: 50000, status: 'In Progress', date: '2h ago' },
  { id: '8431', buyer: 'Charlie', vendor: 'Dave', price: 75000, status: 'Funded', date: '4h ago' },
  { id: '8430', buyer: 'Eve', vendor: 'Frank', price: 25000, status: 'Review', date: '6h ago' },
];

export default function AdminPanel() {
  const [applications, setApplications] = React.useState(MOCK_APPLICATIONS);
  const totalFees = 1250000; // Mock total fees in sats

  const handleAction = (id: string, action: 'approve' | 'reject') => {
    // In a real app, this would call an API
    setApplications(prev => prev.filter(app => app.id !== id));
    console.log(`Vendor ${id} ${action}ed`);
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex items-center gap-3">
        <Shield className="text-accent" size={32} />
        <h1 className="text-4xl font-black font-display">Admin Panel</h1>
      </div>

      {/* Platform Stats & Revenue */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Platform Fees', value: `${formatSats(totalFees)}`, icon: TrendingUp, color: 'text-accent', sub: `~$${satsToUsd(totalFees)} USD` },
          { label: 'Active Users', value: '1,240', icon: Users, color: 'text-blue-400', sub: '+12% this week' },
          { label: 'Total Orders', value: '8,432', icon: ShoppingBag, color: 'text-green-400', sub: '98% success rate' },
          { label: 'Open Disputes', value: '3', icon: AlertCircle, color: 'text-red-400', sub: 'Requires attention' },
        ].map((stat) => (
          <div key={stat.label} className="glass p-6 rounded-3xl space-y-2 border-white/5">
            <div className="flex items-center justify-between text-gray-500">
              <span className="text-[10px] font-bold uppercase tracking-widest">{stat.label}</span>
              <stat.icon size={16} className={stat.color} />
            </div>
            <p className="text-2xl font-black font-display">{stat.value}</p>
            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Vendor Applications */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users size={24} className="text-accent" /> Vendor Applications ({applications.length})
          </h2>
          <div className="space-y-4">
            {applications.length === 0 ? (
              <div className="glass p-10 rounded-2xl text-center text-gray-500 border-dashed border-2 border-white/5">
                No pending applications
              </div>
            ) : (
              applications.map((app) => (
                <div key={app.id} className="glass p-6 rounded-2xl space-y-4 border-white/5 hover:border-accent/20 transition-all">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg">{app.name}</h3>
                      <p className="text-xs text-gray-500">{app.type} • {app.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleAction(app.id, 'approve')}
                        className="p-2 bg-green-500/10 text-green-400 rounded-xl hover:bg-green-500/20 transition-colors border border-green-500/20" 
                        title="Approve"
                      >
                        <Check size={18} />
                      </button>
                      <button 
                        onClick={() => handleAction(app.id, 'reject')}
                        className="p-2 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors border border-red-500/20" 
                        title="Reject"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <p className="text-sm text-gray-400 leading-relaxed">{app.description}</p>
                    
                    <div className="flex flex-wrap gap-2">
                      {app.categories.map(cat => (
                        <span key={cat} className="px-2 py-1 bg-white/5 rounded text-[10px] font-bold uppercase text-gray-500 border border-white/5">
                          {cat}
                        </span>
                      ))}
                    </div>

                    {app.demoUrl && (
                      <a 
                        href={app.demoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-accent text-[10px] font-bold uppercase tracking-widest hover:underline"
                      >
                        View Demo <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Active Orders Table */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ShoppingBag size={24} className="text-accent" /> Active Orders
          </h2>
          <div className="glass rounded-3xl overflow-hidden border-white/5">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                <tr>
                  <th className="px-6 py-4">Order</th>
                  <th className="px-6 py-4">Parties</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {MOCK_ACTIVE_ORDERS.map((order) => (
                  <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-bold text-accent">#{order.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-white">{order.buyer}</span>
                        <span className="text-[10px] text-gray-500">to {order.vendor}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono">{formatSats(order.price)}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-white/5 rounded text-[10px] font-bold uppercase text-gray-400">
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Revenue Dashboard */}
      <section className="glass p-10 rounded-[3rem] space-y-8 border-white/5 bg-gradient-to-br from-accent/5 to-transparent">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-black font-display">Revenue Dashboard</h2>
            <p className="text-gray-500 text-sm">Platform fee collection (5%) over the last 7 days.</p>
          </div>
          <div className="text-right">
            <p className="text-4xl font-black text-accent font-display">{formatSats(totalFees)}</p>
            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">Total Fees Collected (Sats)</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="h-48 w-full flex items-end gap-3 px-2">
            {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
              <div key={i} className="flex-1 group relative">
                <div 
                  className="w-full bg-accent/20 group-hover:bg-accent transition-all rounded-t-xl" 
                  style={{ height: `${h}%` }}
                />
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {formatSats(Math.round(totalFees / 7 * (h/100)))} sats
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em] px-4">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>
        </div>
      </section>
    </div>
  );
}
