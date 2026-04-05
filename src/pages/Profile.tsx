import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Calendar, 
  Shield, 
  Wallet, 
  Star, 
  CheckCircle, 
  Clock, 
  Settings, 
  Bell, 
  LogOut, 
  Zap, 
  ChevronRight,
  Briefcase,
  ArrowUpRight
} from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate, Link } from 'react-router-dom';
import { formatSats, satsToUsd, cn } from '../lib/utils';
import { useAuth } from '../hooks/useAuth';

const MOCK_USER = {
  name: 'Keith W.',
  email: 'keith@tasksats.com',
  bio: 'Full-stack developer and Lightning enthusiast. Building the future of work on Bitcoin.',
  role: 'Vendor', // Can be 'Buyer', 'Vendor', 'Admin'
  memberSince: 'Jan 2024',
  balance: 125000,
  tasksCompleted: 47,
  rating: 4.8,
  activeListings: 3,
  totalEarned: 500000,
  lightningAddress: 'keith@getalby.com',
};

const ORDER_HISTORY = [
  { id: 'o1', title: 'React Component Library', status: 'Complete', date: '2 days ago', amount: 75000, vendor: 'Alice Dev' },
  { id: 'o2', title: 'SEO Prompt Suite', status: 'In Progress', date: '5 hours ago', amount: 25000, vendor: 'Bob Writer' },
  { id: 'o3', title: 'Data Analysis Report', status: 'Funded', date: '1 day ago', amount: 45000, vendor: 'Charlie Data' },
];

export default function Profile() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: MOCK_USER.name,
    email: MOCK_USER.email,
    bio: MOCK_USER.bio,
    lightningAddress: MOCK_USER.lightningAddress,
  });
  const [notifications, setNotifications] = useState(true);
  const initials = profileData.name.split(' ').map(n => n[0]).join('');

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const handleSave = () => {
    setIsEditing(false);
    // In a real app, this would call an API
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row items-center gap-8 p-8 glass rounded-[3rem] border-white/5 bg-gradient-to-br from-accent/10 to-transparent relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Zap size={120} className="text-accent" />
        </div>

        <div className="w-32 h-32 rounded-full bg-accent flex items-center justify-center text-4xl font-black text-black shadow-2xl shadow-accent/20 relative z-10">
          {initials}
        </div>
        
        <div className="text-center md:text-left space-y-4 flex-1 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-col md:flex-row items-center gap-3">
              {isEditing ? (
                <input 
                  type="text" 
                  value={profileData.name} 
                  onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  className="text-3xl font-black font-display bg-white/5 border border-white/10 rounded-xl px-4 py-1 focus:outline-none focus:ring-2 focus:ring-accent"
                />
              ) : (
                <h1 className="text-4xl font-black font-display">{profileData.name}</h1>
              )}
              <div className={cn(
                "badge px-4 py-1 flex items-center gap-2",
                MOCK_USER.role === 'Admin' ? "text-purple-400 border-purple-500/20 bg-purple-500/5" :
                MOCK_USER.role === 'Vendor' ? "text-accent border-accent/20 bg-accent/5" :
                "text-blue-400 border-blue-500/20 bg-blue-500/5"
              )}>
                <Shield size={12} className={cn(
                  "fill-current",
                  MOCK_USER.role === 'Admin' ? "text-purple-400" :
                  MOCK_USER.role === 'Vendor' ? "text-accent" :
                  "text-blue-400"
                )} />
                {MOCK_USER.role}
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-4 text-sm">
              {isEditing ? (
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1">
                  <Mail size={14} className="text-gray-500" />
                  <input 
                    type="email" 
                    value={profileData.email} 
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    className="bg-transparent focus:outline-none"
                  />
                </div>
              ) : (
                <p className="text-gray-400 flex items-center gap-2">
                  <Mail size={14} /> {profileData.email}
                </p>
              )}
              <p className="text-gray-500 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                <Calendar size={12} /> Member since {MOCK_USER.memberSince}
              </p>
            </div>

            <div className="pt-2">
              {isEditing ? (
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent min-h-[80px]"
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="text-sm text-gray-400 leading-relaxed max-w-xl">
                  {profileData.bio}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center md:justify-start gap-3">
            {isEditing ? (
              <button onClick={handleSave} className="btn-primary py-2 px-6 text-xs">Save Changes</button>
            ) : (
              <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold hover:bg-white/10 transition-all">
                <Settings size={14} /> Edit Profile
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {/* Main Content Area */}
          {MOCK_USER.role === 'Buyer' ? (
            <section className="space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Clock size={24} className="text-accent" /> Order History
              </h2>
              <div className="space-y-4">
                {ORDER_HISTORY.map((order) => (
                  <div key={order.id} className="glass p-6 rounded-2xl flex items-center justify-between border-white/5 hover:bg-white/[0.02] transition-all cursor-pointer group">
                    <div className="space-y-1">
                      <h3 className="font-bold group-hover:text-accent transition-colors">{order.title}</h3>
                      <div className="flex items-center gap-2">
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{order.date}</p>
                        <span className="text-[10px] text-gray-600">•</span>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Vendor: {order.vendor}</p>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <p className="font-bold text-sm">{formatSats(order.amount)} sats</p>
                      <span className={cn(
                        "px-2 py-1 rounded text-[10px] font-bold uppercase",
                        order.status === 'Complete' ? "bg-green-500/10 text-green-400" : 
                        order.status === 'In Progress' ? "bg-blue-500/10 text-blue-400" : 
                        "bg-yellow-500/10 text-yellow-400"
                      )}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : (
            <section className="space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Briefcase size={24} className="text-accent" /> Vendor Dashboard
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="glass p-6 rounded-2xl border-white/5 space-y-2">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total Earnings</p>
                  <p className="text-3xl font-black text-accent">{formatSats(MOCK_USER.totalEarned)} sats</p>
                  <p className="text-xs text-gray-500">≈ {satsToUsd(MOCK_USER.totalEarned)} USD</p>
                </div>
                <div className="glass p-6 rounded-2xl border-white/5 space-y-2">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Average Rating</p>
                  <div className="flex items-center gap-2">
                    <p className="text-3xl font-black">{MOCK_USER.rating}</p>
                    <div className="flex text-accent">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={16} className={cn(i < Math.floor(MOCK_USER.rating) ? "fill-accent" : "opacity-20")} />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">From {MOCK_USER.tasksCompleted} tasks</p>
                </div>
              </div>

              {/* Lightning Address Section */}
              <div className="glass p-8 rounded-3xl border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Zap size={18} className="text-accent fill-accent" /> Lightning Address
                  </h3>
                  {!isEditing && (
                    <button onClick={() => setIsEditing(true)} className="text-accent text-[10px] font-bold uppercase tracking-widest hover:underline">
                      Update
                    </button>
                  )}
                </div>
                {isEditing ? (
                  <div className="relative group">
                    <Zap className="absolute left-4 top-1/2 -translate-y-1/2 text-accent" size={18} />
                    <input 
                      type="text" 
                      value={profileData.lightningAddress} 
                      onChange={(e) => setProfileData({...profileData, lightningAddress: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-accent transition-all"
                      placeholder="yourname@getalby.com"
                    />
                  </div>
                ) : (
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between">
                    <code className="text-accent font-mono">{profileData.lightningAddress}</code>
                    <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-500 hover:text-white">
                      <ArrowUpRight size={16} />
                    </button>
                  </div>
                )}
                <p className="text-[10px] text-gray-500 leading-relaxed uppercase tracking-widest font-bold">
                  This address is used to receive instant payments for completed tasks.
                </p>
              </div>
            </section>
          )}
        </div>

        <div className="space-y-8">
          {/* Wallet Summary (Small) */}
          <section className="glass p-8 rounded-3xl space-y-6 border-white/5 bg-accent/5">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Wallet size={18} className="text-accent" /> Balance
            </h2>
            <div className="space-y-1">
              <p className="text-2xl font-black text-accent">{formatSats(MOCK_USER.balance)} sats</p>
              <p className="text-xs text-gray-500">≈ {satsToUsd(MOCK_USER.balance)} USD</p>
            </div>
            <button className="w-full py-3 bg-accent text-black rounded-xl text-xs font-black uppercase tracking-widest hover:bg-accent/90 transition-colors">
              Withdraw
            </button>
          </section>

          {/* Preferences */}
          <section className="glass p-8 rounded-3xl space-y-6 border-white/5">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Bell size={18} className="text-accent" /> Preferences
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold">Notifications</p>
                  <p className="text-[10px] text-gray-500">Email & Push</p>
                </div>
                <button 
                  onClick={() => setNotifications(!notifications)}
                  className={cn(
                    "w-10 h-5 rounded-full transition-colors relative",
                    notifications ? "bg-accent" : "bg-white/10"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-3 h-3 rounded-full bg-white transition-all",
                    notifications ? "left-6" : "left-1"
                  )} />
                </button>
              </div>
              
              {MOCK_USER.role === 'Buyer' && (
                <Link to="/apply" className="block">
                  <button className="w-full py-3 bg-accent/10 text-accent rounded-xl text-xs font-bold hover:bg-accent/20 transition-colors border border-accent/20">
                    Become a Vendor
                  </button>
                </Link>
              )}
            </div>
          </section>

          {/* Sign Out */}
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-4 text-red-400 hover:text-red-300 transition-colors text-sm font-bold uppercase tracking-widest border border-red-500/10 rounded-2xl hover:bg-red-500/5"
          >
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
