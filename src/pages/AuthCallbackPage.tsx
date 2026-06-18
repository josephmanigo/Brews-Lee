import { useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';

/**
 * AuthCallbackPage
 *
 * Supabase redirects here after a successful Google (or any OAuth) login.
 * It handles both the PKCE flow (?code=xxx) and the legacy implicit flow
 * (#access_token=xxx). After the session is established it waits for
 * onAuthStateChange to fire before sending the user to /dashboard, which
 * prevents the race condition where DashboardPage redirects back to /login
 * because the user object hasn't been set yet.
 */
export const AuthCallbackPage = () => {
  const [, setLocation] = useLocation();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');

      const waitForSession = () =>
        new Promise<void>((resolve, reject) => {
          // Check if session already exists first
          supabase.auth.getSession().then(({ data: { session } }) => {
            if (session?.user) {
              resolve();
              return;
            }
          });

          const timeout = setTimeout(() => {
            reject(new Error('Session timeout'));
          }, 15000);

          const { data } = supabase.auth.onAuthStateChange((event, session) => {
            if (
              (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') &&
              session?.user
            ) {
              clearTimeout(timeout);
              data.subscription.unsubscribe();
              resolve();
            }
          });
        });

      try {
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
        } else {
          // Implicit flow — check hash
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            const hash = window.location.hash;
            if (!hash || !hash.includes('access_token')) {
              console.warn('[BrewsLee] Auth callback: no code or token found');
              setLocation('/login');
              return;
            }
          }
        }

        // Wait for session to be fully established by AppContext listener
        await waitForSession();

        // Check if there's a next parameter or recovery type
        const next = params.get('next');
        const hash = window.location.hash;
        if (next === '/update-password' || hash.includes('type=recovery')) {
          setLocation('/update-password');
          return;
        }

        // For ALL flows (signup confirmation, Google, etc.) — go to dashboard.
        // The user is already authenticated after confirming their email,
        // no need to sign them out and force a re-login.
        setLocation('/dashboard');
      } catch (err: any) {
        console.error('[BrewsLee] OAuth callback error:', err.message);
        setLocation('/login');
      }
    };

    handleCallback();
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-beige-50" />
  );
};
