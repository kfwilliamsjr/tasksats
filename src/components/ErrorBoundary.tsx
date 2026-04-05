import React from 'react';
import { AlertCircle, RefreshCcw, Home, Zap } from 'lucide-react';
import { motion } from 'motion/react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background text-white flex items-center justify-center p-6">
          <div className="max-w-md w-full space-y-12 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-red-500/10 blur-[80px] rounded-full" />
              <div className="relative z-10 w-24 h-24 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center justify-center mx-auto">
                <AlertCircle size={48} className="text-red-500" />
              </div>
            </motion.div>

            <div className="space-y-4">
              <h1 className="text-4xl font-black font-display tracking-tight">Something went wrong</h1>
              <p className="text-gray-400 leading-relaxed">
                An unexpected error occurred. Don't worry, your sats are safe. Our team has been notified.
              </p>
              {this.state.error && (
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-left overflow-hidden">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Error Details</p>
                  <p className="text-xs font-mono text-gray-400 break-all">{this.state.error.message}</p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <button 
                onClick={this.handleRetry}
                className="btn-primary w-full py-4 flex items-center justify-center gap-3"
              >
                <RefreshCcw size={20} /> Try Again
              </button>
              <button 
                onClick={this.handleReset}
                className="btn-secondary w-full py-4 flex items-center justify-center gap-3"
              >
                <Home size={20} /> Back to Home
              </button>
            </div>

            <div className="pt-8 flex items-center justify-center gap-2 text-[10px] font-bold text-gray-600 uppercase tracking-[0.4em]">
              <Zap size={10} className="fill-gray-600" /> TaskSats Network
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
