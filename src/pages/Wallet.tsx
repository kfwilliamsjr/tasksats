import React, { useState } from 'react';
import { 
  Zap, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History, 
  Download, 
  Upload, 
  RefreshCcw, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  QrCode,
  Copy,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatSats, satsToUsd, cn } from '../lib/utils';

const MOCK_TRANSACTIONS = [
  { id: 't1', type: 'Deposit', amount: 50000, date: 'Oct 24, 2023', status: 'Completed', icon: ArrowDownLeft, color: 'text-green-400' },
  { id: 't2', type: 'Payment', amount: -15000, date: 'Oct 23, 2023', status: 'Completed', icon: ArrowUpRight, color: 'text-blue-400' },
  { id: 't3', type: 'Refund', amount: 5000, date: 'Oct 22, 2023', status: 'Completed', icon: RefreshCcw, color: 'text-accent' },
  { id: 't4', type: 'Withdrawal', amount: -25000, date: 'Oct 21, 2023', status: 'Pending', icon: Upload, color: 'text-red-400' },
  { id: 't5', type: 'Payment', amount: -10000, date: 'Oct 20, 2023', status: 'Failed', icon: ArrowUpRight, color: 'text-gray-500' },
];

export default function Wallet() {
  const [balance] = useState(125000);
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceAmount, setInvoiceAmount] = useState('10000');

  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateInvoice = () => {
    setShowInvoice(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      {/* Balance Header */}
      <section className="text-center space-y-4 py-12 glass rounded-[3rem] border-white/5 bg-gradient-to-b from-accent/10 to-transparent relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-accent/5 blur-[100px] rounded-full" />
        <div className="space-y-2 relative z-10">
          <p className="text-gray-400 text-sm font-bold uppercase tracking-[0.3em]">Total Balance</p>
          <h1 className="text-7xl font-black font-display text-accent tracking-tight">
            {formatSats(balance)} <span className="text-3xl opacity-50">sats</span>
          </h1>
          <p className="text-xl text-gray-500 font-medium">≈ {satsToUsd(balance)} USD</p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 pt-8 relative z-10">
          <button 
            onClick={generateInvoice}
            className="btn-primary px-8 py-4 text-lg flex items-center gap-3"
          >
            <Download size={20} /> Deposit
          </button>
          <button className="btn-secondary px-8 py-4 text-lg flex items-center gap-3 group">
            <Upload size={20} className="group-hover:-translate-y-1 transition-transform" /> 
            Withdraw <span className="text-[10px] opacity-50 font-bold uppercase tracking-widest ml-1">(Vendor)</span>
          </button>
        </div>
      </section>

      {/* Transaction History */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-4">
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <History size={24} className="text-accent" /> Transaction History
          </h2>
          <button className="text-accent text-sm font-bold uppercase tracking-widest hover:underline">
            View All
          </button>
        </div>

        <div className="space-y-3">
          {MOCK_TRANSACTIONS.map((tx) => (
            <motion.div 
              key={tx.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass p-5 rounded-2xl flex items-center justify-between border-white/5 hover:bg-white/[0.02] transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className={cn("p-3 rounded-xl bg-white/5", tx.color)}>
                  <tx.icon size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{tx.type}</h3>
                  <p className="text-xs text-gray-500 font-medium">{tx.date}</p>
                </div>
              </div>

              <div className="text-right space-y-1">
                <p className={cn(
                  "text-lg font-black font-display",
                  tx.amount > 0 ? "text-green-400" : "text-white"
                )}>
                  {tx.amount > 0 ? '+' : ''}{formatSats(Math.abs(tx.amount))}
                </p>
                <div className="flex items-center justify-end gap-1.5">
                  {tx.status === 'Completed' && <CheckCircle2 size={12} className="text-green-400" />}
                  {tx.status === 'Pending' && <Clock size={12} className="text-yellow-400" />}
                  {tx.status === 'Failed' && <AlertCircle size={12} className="text-red-400" />}
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-widest",
                    tx.status === 'Completed' ? "text-green-400" : 
                    tx.status === 'Pending' ? "text-yellow-400" : "text-red-400"
                  )}>
                    {tx.status}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Deposit Modal */}
      <AnimatePresence>
        {showInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInvoice(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="glass max-w-md w-full p-8 rounded-[2.5rem] border-white/10 relative z-10 space-y-8"
            >
              <button 
                onClick={() => setShowInvoice(false)}
                className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              <div className="text-center space-y-2">
                <h3 className="text-2xl font-black font-display">Deposit Sats</h3>
                <p className="text-gray-400 text-sm">Scan this Lightning invoice to deposit</p>
              </div>

              <div className="flex flex-col items-center gap-6">
                <div className="p-6 bg-white rounded-3xl shadow-2xl shadow-accent/20">
                  <QrCode size={200} className="text-black" />
                </div>
                
                <div className="w-full space-y-3">
                  <div className="relative">
                    <input 
                      type="text" 
                      readOnly 
                      value="lnbc100u1p3..." 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-mono text-gray-400 pr-12"
                    />
                    <button 
                      onClick={copyToClipboard}
                      className={cn(
                        "absolute right-3 top-1/2 -translate-y-1/2 transition-colors",
                        copied ? "text-green-400" : "text-accent hover:text-white"
                      )}
                    >
                      {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                  <p className="text-[10px] text-center text-gray-500 uppercase tracking-widest font-bold">
                    Invoice expires in 10:00
                  </p>
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-3">
                <div className="flex items-center justify-between text-sm px-2">
                  <span className="text-gray-400">Amount</span>
                  <span className="font-bold text-accent">{formatSats(parseInt(invoiceAmount))} sats</span>
                </div>
                <button 
                  onClick={() => setShowInvoice(false)}
                  className="btn-primary w-full py-4"
                >
                  I've Paid This Invoice
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
