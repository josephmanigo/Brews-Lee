import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { EyeOff, Eye, ArrowRight, ArrowLeft, Leaf, Sparkles, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';

const REMEMBER_KEY = 'brewslee_remembered_email';

export const AuthPage = ({ mode }: { mode: 'login' | 'signup' }) => {
  const { addToast, user, isLoadingAuth } = useAppContext();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [signupSent, setSignupSent] = useState(false);
  const [resending, setResending] = useState(false);

  // Remember me
  const [rememberMe, setRememberMe] = useState(false);

  // Forgot password
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  // Load remembered email on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(REMEMBER_KEY);
      if (saved) {
        setEmail(saved);
        setRememberMe(true);
      }
    } catch (e) {}
  }, []);

  // Redirect to dashboard if already signed in
  useEffect(() => {
    if (!isLoadingAuth && user) {
      setLocation('/dashboard');
    }
  }, [user, isLoadingAuth, setLocation]);

  useEffect(() => {
    if (mode === 'login') {
      setSignupSent(false);
      setShowForgotPassword(false);
      setForgotSent(false);
    }
  }, [mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'signup') {
        const generatedVoucher = Math.random().toString(36).substring(2, 10).toUpperCase();
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { 
            data: { full_name: name, voucher_code: generatedVoucher, voucher_used: false },
            emailRedirectTo: window.location.origin + '/auth/callback?type=signup'
          },
        });
        if (error) throw error;

        if (data.session) {
          addToast('Welcome to Brews Lee!');
        } else {
          setSignupSent(true);
          setLoading(false);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (error.message.toLowerCase().includes('not confirmed') || error.message.toLowerCase().includes('email')) {
            addToast('Please confirm your email first — check your inbox.', 'error');
          } else {
            addToast('Wrong email or password.', 'error');
          }
          setLoading(false);
          return;
        }

        // Save or clear remembered email
        try {
          if (rememberMe) {
            localStorage.setItem(REMEMBER_KEY, email);
          } else {
            localStorage.removeItem(REMEMBER_KEY);
          }
        } catch (e) {}

        addToast('Welcome back!');

        // Verify the session is active before navigating
        const { data: { session: activeSession } } = await supabase.auth.getSession();
        if (!activeSession) {
          addToast('Session failed to initialize. Please try again.', 'error');
          setLoading(false);
          return;
        }

        // Session confirmed — give AppContext a moment to process, then navigate.
        // Dashboard's 2s grace period provides additional safety for user data.
        await new Promise(resolve => setTimeout(resolve, 500));
        setLocation('/dashboard');
        setLoading(false);
      }
    } catch (err: any) {
      addToast(err.message || 'Something went wrong', 'error');
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      addToast('Please enter your email address.', 'error');
      return;
    }
    setForgotLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: window.location.origin + '/auth/callback?next=/update-password',
      });
      if (error) throw error;
      setForgotSent(true);
    } catch (err: any) {
      addToast(err.message || 'Failed to send reset email', 'error');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    setResending(true);
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) addToast(error.message, 'error');
    else addToast('Confirmation email resent — check your inbox.');
    setResending(false);
  };

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/auth/callback' },
    });
    if (error) addToast(error.message, 'error');
  };

  return (
    <div className="min-h-screen bg-beige-50 flex items-center justify-center p-6 lg:p-12 pt-24 z-10 relative">
      <div className="max-w-[1000px] w-full bg-white rounded-xl overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[650px]">

        {/* ── Left Image Panel ── */}
        <div className="w-full md:w-1/2 relative min-h-[400px] order-1 bg-[#0d1b14] overflow-hidden">
          <img
            src="/Auth page.png"
            alt="Matcha preparation"
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-60"
          />
          {/* Floating leaves decoration */}
          <div className="absolute top-10 right-10 w-24 h-24 rounded-full bg-matcha-700/10 blur-2xl" />
          <div className="absolute bottom-20 left-8 w-32 h-32 rounded-full bg-[#c1f23e]/5 blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d1b14] via-transparent to-[#0d1b14]/40" />
          <div className="absolute inset-0 p-12 flex flex-col justify-end">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="w-8 h-8 mb-6"
            >
              <Leaf className="w-8 h-8 text-[#c1f23e]" strokeWidth={1.5} />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="font-serif text-[42px] text-white mb-4 leading-tight tracking-tight"
            >
              Find your<br />center.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="font-sans text-white/70 text-sm font-light leading-relaxed"
            >
              Step into a world of mindful brewing<br />and quiet luxury.
            </motion.p>
          </div>
        </div>

        {/* ── Right Form Panel ── */}
        <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col justify-center order-2 bg-white">

          <AnimatePresence mode="wait">
            {signupSent ? (
              /* ── Signup Success Screen ── */
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="py-2"
              >
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center mb-4"
                >
                  <p className="font-sans font-bold uppercase tracking-[0.22em] text-[10px] text-matcha-700">
                    Account created
                  </p>
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="font-serif text-[38px] text-ink mb-4 leading-tight tracking-tight"
                >
                  You're in the<br />
                  <span className="italic text-matcha-800">inner circle.</span>
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  className="font-sans text-sm text-ink/50 mb-8 leading-relaxed"
                >
                  We sent a confirmation link to{' '}
                  <span className="text-ink font-medium">{email}</span>.<br />
                  Check your inbox and click the link to activate your account.
                </motion.p>

                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  style={{ transformOrigin: 'left' }}
                  className="mb-8 h-px bg-matcha-100"
                />

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="space-y-3"
                >
                  <button
                    onClick={() => setLocation('/login')}
                    className="w-full py-4 flex items-center justify-center gap-3 font-sans font-bold tracking-[0.18em] uppercase text-[11px] transition-all hover:opacity-90 cursor-pointer rounded"
                    style={{ background: '#0e1a12', color: '#c1f23e' }}
                  >
                    SIGN IN TO YOUR ACCOUNT
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleResendConfirmation}
                    disabled={resending}
                    className="w-full py-3 font-sans text-ink/40 hover:text-ink/70 transition-colors disabled:opacity-50 text-xs tracking-wide"
                  >
                    {resending ? 'Sending…' : 'Didn\'t receive it? Resend confirmation'}
                  </button>
                </motion.div>
              </motion.div>

            ) : showForgotPassword ? (
              /* ── Forgot Password Panel ── */
              <motion.div
                key="forgot"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <button
                  onClick={() => { setShowForgotPassword(false); setForgotSent(false); }}
                  className="inline-flex items-center gap-2 text-ink/40 hover:text-ink transition-colors font-sans text-xs font-bold tracking-[0.12em] uppercase mb-6 group"
                >
                  <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                  Back to Sign In
                </button>

                <Link href="/" className="font-serif text-2xl font-bold tracking-tight text-ink block mb-10">
                  Brews Lee
                </Link>

                <AnimatePresence mode="wait">
                  {forgotSent ? (
                    /* ── Reset Email Sent Confirmation ── */
                    <motion.div
                      key="forgot-sent"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.4 }}
                    >
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 }}
                        className="flex items-center mb-4"
                      >
                        <p className="font-sans font-bold uppercase tracking-[0.22em] text-[10px] text-matcha-700">
                          Email sent
                        </p>
                      </motion.div>

                      <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="font-serif text-3xl md:text-[34px] text-ink mb-3 tracking-tight"
                      >
                        Check your inbox
                      </motion.h1>

                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="font-sans text-sm text-ink/50 mb-8 leading-relaxed"
                      >
                        We sent a password reset link to{' '}
                        <span className="text-ink font-medium">{forgotEmail}</span>.<br />
                        Click the link in the email to create a new password.
                      </motion.p>

                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 0.35, duration: 0.5 }}
                        style={{ transformOrigin: 'left' }}
                        className="mb-8 h-px bg-matcha-100"
                      />

                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="space-y-3"
                      >
                        <button
                          onClick={() => { setShowForgotPassword(false); setForgotSent(false); }}
                          className="w-full py-4 flex items-center justify-center gap-3 font-sans font-bold tracking-[0.18em] uppercase text-[11px] transition-all hover:opacity-90 cursor-pointer rounded"
                          style={{ background: '#0e1a12', color: '#c1f23e' }}
                        >
                          BACK TO SIGN IN
                          <ArrowRight className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => { setForgotSent(false); }}
                          className="w-full py-3 font-sans text-ink/40 hover:text-ink/70 transition-colors text-xs tracking-wide"
                        >
                          Didn't receive it? Try again
                        </button>
                      </motion.div>
                    </motion.div>
                  ) : (
                    /* ── Reset Password Form ── */
                    <motion.div
                      key="forgot-form"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h1 className="font-serif text-3xl md:text-[34px] text-ink mb-2 tracking-tight">
                        Reset Password
                      </h1>
                      <p className="font-sans text-sm text-ink/50 mb-8">
                        Enter your email and we'll send you a link to reset your password.
                      </p>

                      <form onSubmit={handleForgotPassword} className="space-y-6">
                        <div>
                          <input
                            required
                            placeholder="Email address"
                            value={forgotEmail}
                            onChange={e => setForgotEmail(e.target.value)}
                            type="email"
                            className="w-full border-b border-matcha-200 bg-transparent py-3 focus:outline-none focus:border-ink transition-colors font-sans text-sm placeholder:text-ink/40"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={forgotLoading}
                          className="w-full py-4 bg-[#06150b] text-white rounded font-sans text-[11px] font-bold tracking-[0.15em] uppercase hover:bg-black transition-colors flex items-center justify-center gap-3 disabled:opacity-60"
                        >
                          {forgotLoading ? (
                            <span className="animate-pulse">Sending…</span>
                          ) : (
                            <>SEND RESET LINK<Mail className="w-4 h-4" /></>
                          )}
                        </button>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

            ) : (
              /* ── Auth Form ── */
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {/* Header */}
                <div className="mb-8">
                  <Link href="/" className="inline-flex items-center gap-2 text-ink/40 hover:text-ink transition-colors font-sans text-xs font-bold tracking-[0.12em] uppercase mb-6 group">
                    <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                    Back
                  </Link>
                  <Link href="/" className="font-serif text-2xl font-bold tracking-tight text-ink block mb-10">
                    Brews Lee
                  </Link>

                  <div className="flex gap-6 border-b border-matcha-100 mb-10">
                    <Link href="/login" className={`pb-3 text-xs font-bold tracking-[0.1em] uppercase transition-colors ${mode === 'login' ? 'text-ink border-b-2 border-ink' : 'text-ink/40 hover:text-ink/70'}`}>
                      SIGN IN
                    </Link>
                    <Link href="/signup" className={`pb-3 text-xs font-bold tracking-[0.1em] uppercase transition-colors ${mode === 'signup' ? 'text-ink border-b-2 border-ink' : 'text-ink/40 hover:text-ink/70'}`}>
                      SIGN UP
                    </Link>
                  </div>

                  <h1 className="font-serif text-3xl md:text-[34px] text-ink mb-2 tracking-tight">
                    {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                  </h1>
                  <p className="font-sans text-sm text-ink/50">
                    {mode === 'login' ? 'Please enter your details to sign in.' : 'Join us for a mindful brewing experience.'}
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {mode === 'signup' && (
                    <div className="relative">
                      <input
                        required placeholder="Full Name" value={name}
                        onChange={e => setName(e.target.value)} type="text"
                        className="w-full border-b border-matcha-200 bg-transparent py-3 focus:outline-none focus:border-ink transition-colors font-sans text-sm placeholder:text-ink/40"
                      />
                    </div>
                  )}
                  <div>
                    <input
                      required placeholder="Email address" value={email}
                      onChange={e => setEmail(e.target.value)} type="email"
                      className="w-full border-b border-matcha-200 bg-transparent py-3 focus:outline-none focus:border-ink transition-colors font-sans text-sm placeholder:text-ink/40"
                    />
                  </div>
                  <div className="relative">
                    <input
                      required placeholder="Password" value={password}
                      onChange={e => setPassword(e.target.value)}
                      type={showPassword ? 'text' : 'password'}
                      className="w-full border-b border-matcha-200 bg-transparent py-3 pr-10 focus:outline-none focus:border-ink transition-colors font-sans text-sm placeholder:text-ink/40"
                    />
                    {password.length > 0 && (
                      <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-0 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink">
                        {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    )}
                  </div>

                  {mode === 'login' && (
                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={e => {
                            setRememberMe(e.target.checked);
                            if (!e.target.checked) {
                              try { localStorage.removeItem(REMEMBER_KEY); } catch (e) {}
                            }
                          }}
                          className="w-4 h-4 rounded border-matcha-200 text-[#0d1b14] focus:ring-[#0d1b14]"
                        />
                        <span className="font-sans text-sm text-ink/70 group-hover:text-ink transition-colors">Remember me</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => { setShowForgotPassword(true); setForgotEmail(email); }}
                        className="font-sans text-xs font-bold text-ink/60 hover:text-ink tracking-wide transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}

                  <button
                    type="submit" disabled={loading}
                    className="w-full py-4 bg-[#06150b] text-white rounded font-sans text-[11px] font-bold tracking-[0.15em] uppercase hover:bg-black transition-colors mt-6 flex items-center justify-center gap-3 disabled:opacity-60"
                  >
                    {loading ? (
                      <span className="animate-pulse">{mode === 'login' ? 'Signing in…' : 'Creating account…'}</span>
                    ) : (
                      <>{mode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}<ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </form>

                {/* Google */}
                <div className="mt-8 relative hidden sm:block">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-matcha-100" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-4 bg-white text-ink/40 font-bold uppercase tracking-widest font-sans text-[10px]">Or continue with</span>
                  </div>
                </div>
                <div className="mt-4 hidden sm:block">
                  <button
                    type="button" onClick={handleGoogleSignIn}
                    className="w-full py-3 border border-matcha-200 text-ink rounded font-sans text-xs font-bold tracking-widest hover:bg-matcha-50 transition-colors flex items-center justify-center gap-3"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
