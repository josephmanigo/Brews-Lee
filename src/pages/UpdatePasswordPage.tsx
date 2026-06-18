import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'motion/react';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAppContext } from '../context/AppContext';

export const UpdatePasswordPage = () => {
  const { user, addToast, isLoadingAuth } = useAppContext();
  const [, setLocation] = useLocation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fallback to avoid accessing null
  const name = user?.name || user?.user_metadata?.full_name || 'User';
  const email = user?.email || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      addToast('Passwords do not match.', 'error');
      return;
    }
    if (password.length < 6) {
      addToast('Password must be at least 6 characters.', 'error');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      addToast('Password updated successfully!');
      
      // Sign out the user and redirect to login
      await supabase.auth.signOut();
      setLocation('/signup');
    } catch (err: any) {
      addToast(err.message || 'Failed to update password', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (isLoadingAuth) {
    return <div className="min-h-screen bg-beige-50" />;
  }

  return (
    <div className="min-h-screen bg-beige-50 flex items-center justify-center p-6 lg:p-12 pt-24 z-10 relative">
      <div className="max-w-[1000px] w-full bg-white rounded-xl overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[650px]">
        {/* Left Image Panel */}
        <div className="w-full md:w-1/2 relative min-h-[400px] order-1 bg-[#0d1b14] overflow-hidden">
          <img
            src="/Auth page.png"
            alt="Matcha preparation"
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60"
          />
          <div className="absolute top-10 right-10 w-24 h-24 rounded-full bg-matcha-700/10 blur-2xl" />
          <div className="absolute bottom-20 left-8 w-32 h-32 rounded-full bg-[#c1f23e]/5 blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d1b14] via-transparent to-[#0d1b14]/40" />
          <div className="absolute inset-0 p-12 flex flex-col justify-end">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="mb-6 flex items-center"
            >
              <div className="h-px w-8 bg-[#c1f23e] mr-4 opacity-70" />
              <span className="font-sans text-[10px] font-bold tracking-[0.25em] uppercase text-[#c1f23e]">Security</span>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="font-serif text-[42px] text-white mb-4 leading-tight tracking-tight"
            >
              Secure your<br />account.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="font-sans text-white/70 text-sm font-light leading-relaxed"
            >
              Create a new password to continue<br />your mindful journey.
            </motion.p>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col justify-center order-2 bg-white">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-10">
              <h1 className="font-serif text-3xl md:text-[34px] text-ink mb-2 tracking-tight">
                Update Password
              </h1>
              <p className="font-sans text-sm text-ink/50">
                Welcome back, {name}.
              </p>
              <p className="font-sans text-sm text-ink/50 font-medium mt-1">
                {email}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <input
                  required placeholder="New Password" value={password}
                  onChange={e => setPassword(e.target.value)}
                  type={showPassword ? 'text' : 'password'}
                  className="w-full border-b border-matcha-200 bg-transparent py-3 pr-14 focus:outline-none focus:border-ink transition-colors font-sans text-sm placeholder:text-ink/40"
                />
                {password.length > 0 && (
                  <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-0 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink transition-colors">
                    {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                )}
              </div>

              <div className="relative">
                <input
                  required placeholder="Confirm New Password" value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="w-full border-b border-matcha-200 bg-transparent py-3 pr-14 focus:outline-none focus:border-ink transition-colors font-sans text-sm placeholder:text-ink/40"
                />
                {confirmPassword.length > 0 && (
                  <button type="button" onClick={() => setShowConfirmPassword(v => !v)} className="absolute right-0 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink transition-colors">
                    {showConfirmPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                )}
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full py-4 bg-[#06150b] text-white rounded font-sans text-[11px] font-bold tracking-[0.15em] uppercase hover:bg-black transition-colors mt-6 flex items-center justify-center disabled:opacity-60"
              >
                {loading ? (
                  <span className="animate-pulse">Updating…</span>
                ) : (
                  <span>UPDATE PASSWORD</span>
                )}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
