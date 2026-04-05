import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import Home from './pages/Home';
import ServiceListing from './pages/ServiceListing';
import OrderForm from './pages/OrderForm';
import TaskThread from './pages/TaskThread';
import Wallet from './pages/Wallet';
import Profile from './pages/Profile';
import VendorDashboard from './pages/VendorDashboard';
import AdminPanel from './pages/AdminPanel';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import SearchPage from './pages/Search';
import VendorApplication from './pages/VendorApplication';
import NotFound from './pages/NotFound';
import ErrorBoundary from './components/ErrorBoundary';

import { isSupabaseConfigured } from './lib/supabase';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-accent"></div>
    </div>;
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/service/:id" element={<ServiceListing />} />
        <Route path="/order/:id" element={<OrderForm />} />
        <Route path="/task/:id" element={<TaskThread />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/apply" element={<VendorApplication />} />
        <Route path="/dashboard" element={user ? <VendorDashboard /> : <Navigate to="/login" />} />
        <Route path="/admin" element={user ? <AdminPanel /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/auth" element={<Navigate to="/login" />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ErrorBoundary>
  );
}
