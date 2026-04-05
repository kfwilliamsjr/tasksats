import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Home, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center space-y-8">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <div className="absolute inset-0 bg-accent/20 blur-[80px] rounded-full animate-pulse" />
        <div className="relative z-10 w-24 h-24 bg-accent rounded-3xl flex items-center justify-center shadow-2xl shadow-accent/20">
          <Zap size={48} className="text-black fill-black" />
        </div>
      </motion.div>

      <div className="space-y-4 relative z-10">
        <h1 className="text-8xl font-black font-display tracking-tighter">404</h1>
        <h2 className="text-2xl font-bold text-white">Page not found</h2>
        <p className="text-gray-500 max-w-md mx-auto">
          The page you are looking for doesn't exist or has been moved to another dimension.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-8">
        <Link to="/">
          <button className="btn-primary px-8 py-4 flex items-center gap-2">
            <Home size={18} />
            Back to Home
          </button>
        </Link>
        <button 
          onClick={() => window.history.back()}
          className="btn-secondary px-8 py-4 flex items-center gap-2"
        >
          <ArrowLeft size={18} />
          Go Back
        </button>
      </div>

      <div className="pt-12 text-[10px] font-bold text-gray-600 uppercase tracking-[0.4em]">
        TaskSats Network • Error Code: 0x404
      </div>
    </div>
  );
}
