'use client';

export const dynamic = 'force-dynamic';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Mail,
  Loader2,
  CheckCircle,
  XCircle,
  Trophy,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'pending'>('pending');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const token = searchParams.get('token');

    if (emailParam) {
      setEmail(emailParam);
    }

    // If token is provided in URL, auto-verify
    if (token) {
      handleVerify(token);
    }
  }, [searchParams]);

  const handleVerify = async (token: string) => {
    setStatus('verifying');
    setMessage('Verifying your email...');

    try {
      const response = await api.post('/auth/email/verify', {
        token,
      });

      if (response.data.success) {
        setStatus('success');
        setMessage('Email verified successfully!');

        // Store token and redirect to dashboard
        if (response.data.data.token) {
          const { user, token } = response.data.data;
          localStorage.setItem('authToken', token);
          setAuth(user, token);
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        } else {
          setTimeout(() => {
            router.push('/login');
          }, 2000);
        }
      }
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Email verification failed. The link may be invalid or expired.');
    }
  };

  const handleResendEmail = async () => {
    if (!email) {
      setMessage('Please provide your email address');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/email/resend-verification', {
        email,
      });

      if (response.data.success) {
        setMessage('Verification email sent! Please check your inbox.');
      }
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to resend verification email');
    } finally {
      setLoading(false);
    }
  };

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
        {/* Back Button */}
        <Link href="/login">
          <motion.button
            whileHover={{ x: -5 }}
            className="flex items-center space-x-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Login</span>
          </motion.button>
        </Link>

        {/* Verification Card */}
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
                status === 'verifying' || status === 'pending'
                  ? 'rgba(var(--wc-primary) / 0.2)'
                  : status === 'success'
                  ? 'rgba(var(--wc-accent) / 0.2)'
                  : 'rgba(239, 68, 68, 0.2)',
            }}
          >
            {(status === 'verifying' || status === 'pending') && (
              <Mail className="w-10 h-10 text-wc-primary" />
            )}
            {status === 'success' && (
              <CheckCircle className="w-10 h-10 text-wc-accent" />
            )}
            {status === 'error' && (
              <XCircle className="w-10 h-10 text-red-500" />
            )}
          </motion.div>

          {/* Title */}
          <h1 className="text-2xl font-bold mb-2">
            {status === 'verifying' && 'Verifying Email...'}
            {status === 'success' && 'Email Verified!'}
            {status === 'error' && 'Verification Failed'}
            {status === 'pending' && 'Verify Your Email'}
          </h1>

          {/* Message */}
          <p className="text-muted-foreground mb-6">
            {message ||
              `We've sent a verification link to ${email || 'your email'}. Please check your inbox and click the link to verify your account.`}
          </p>

          {/* Loading Animation */}
          {status === 'verifying' && (
            <div className="flex items-center justify-center space-x-2 mb-6">
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

          {/* Resend Email Button */}
          {(status === 'pending' || status === 'error') && (
            <div className="space-y-4">
              {status === 'pending' && (
                <div>
                  <label className="block text-sm font-medium mb-2 text-left">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="input-field"
                  />
                </div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleResendEmail}
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    <span>Resend Verification Email</span>
                  </>
                )}
              </motion.button>
            </div>
          )}

          {/* Success Redirect Notice */}
          {status === 'success' && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-muted-foreground mt-4"
            >
              Redirecting to dashboard...
            </motion.p>
          )}

          {/* Help Text */}
          <div className="mt-6 p-4 rounded-lg glass text-sm text-left">
            <p className="font-medium mb-2">Didn't receive the email?</p>
            <ul className="text-muted-foreground space-y-1 text-xs">
              <li>• Check your spam/junk folder</li>
              <li>• Make sure you entered the correct email</li>
              <li>• Wait a few minutes and try resending</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-wc-primary animate-spin" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
