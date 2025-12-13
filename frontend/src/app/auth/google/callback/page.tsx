'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, Trophy, CheckCircle, XCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Completing Google sign in...');

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        // Get token or error from URL (backend redirect)
        const token = searchParams.get('token');
        const error = searchParams.get('error');

        if (error) {
          setStatus('error');
          setMessage(`Authentication failed: ${error}`);
          setTimeout(() => router.push('/login'), 3000);
          return;
        }

        if (!token) {
          setStatus('error');
          setMessage('No authentication token received');
          setTimeout(() => router.push('/login'), 3000);
          return;
        }

        // Store auth token in localStorage
        localStorage.setItem('authToken', token);

        // Fetch user profile with the token
        try {
          const response = await api.get('/auth/profile', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.data.success) {
            // Update auth store with user data and token
            setAuth(response.data.data.user, token);
          }
        } catch (profileError) {
          console.error('Failed to fetch user profile:', profileError);
          // Still proceed with login even if profile fetch fails
        }

        setStatus('success');
        setMessage('Successfully signed in with Google!');

        // Redirect to dashboard after short delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } catch (err: any) {
        console.error('Google callback error:', err);
        setStatus('error');
        setMessage('Failed to complete Google sign in. Please try again.');
        setTimeout(() => router.push('/login'), 3000);
      }
    };

    handleGoogleCallback();
  }, [searchParams, router, setAuth]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 stadium-pattern opacity-30" />

      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 90, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="absolute top-20 right-20 text-9xl opacity-5"
      >
        ⚽
      </motion.div>

      <div className="w-full max-w-md relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card text-center"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.6 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
            style={{
              backgroundColor:
                status === 'loading'
                  ? 'rgba(var(--wc-primary) / 0.2)'
                  : status === 'success'
                  ? 'rgba(var(--wc-accent) / 0.2)'
                  : 'rgba(239, 68, 68, 0.2)',
            }}
          >
            {status === 'loading' && (
              <Loader2 className="w-10 h-10 text-wc-primary animate-spin" />
            )}
            {status === 'success' && (
              <CheckCircle className="w-10 h-10 text-wc-accent" />
            )}
            {status === 'error' && (
              <XCircle className="w-10 h-10 text-red-500" />
            )}
          </motion.div>

          {/* Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold mb-2">
              {status === 'loading' && 'Authenticating...'}
              {status === 'success' && 'Success!'}
              {status === 'error' && 'Oops!'}
            </h2>
            <p className="text-muted-foreground">{message}</p>
          </motion.div>

          {/* Loading Dots */}
          {status === 'loading' && (
            <div className="flex items-center justify-center space-x-2 mt-6">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                className="w-2 h-2 bg-wc-primary rounded-full"
              />
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                className="w-2 h-2 bg-wc-primary rounded-full"
              />
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                className="w-2 h-2 bg-wc-primary rounded-full"
              />
            </div>
          )}

          {/* Redirect Notice */}
          {status !== 'loading' && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-muted-foreground mt-6"
            >
              Redirecting you in a moment...
            </motion.p>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-wc-primary animate-spin" />
      </div>
    }>
      <GoogleCallbackContent />
    </Suspense>
  );
}
