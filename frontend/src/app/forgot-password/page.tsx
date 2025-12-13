'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Mail,
  Loader2,
  CheckCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';

type PageState = 'request' | 'sent' | 'reset' | 'success';

function ForgotPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<PageState>('request');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/forgot-password', {
        email,
      });

      if (response.data.success) {
        setState('sent');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    try {
      const token = searchParams.get('token');

      const response = await api.post('/auth/reset-password', {
        token,
        newPassword,
      });

      if (response.data.success) {
        setState('success');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to reset password. The link may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  // Check if we have a reset token in the URL
  const resetToken = searchParams.get('token');
  if (resetToken && state === 'request') {
    setState('reset');
  }

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

        {/* Forgot Password Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card"
        >
          {/* Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.6 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
            style={{
              backgroundColor:
                state === 'sent' || state === 'success'
                  ? 'rgba(var(--wc-accent) / 0.2)'
                  : 'rgba(var(--wc-primary) / 0.2)',
            }}
          >
            {state === 'sent' || state === 'success' ? (
              <CheckCircle className="w-10 h-10 text-wc-accent" />
            ) : state === 'reset' ? (
              <Lock className="w-10 h-10 text-wc-primary" />
            ) : (
              <Mail className="w-10 h-10 text-wc-primary" />
            )}
          </motion.div>

          {/* Title */}
          <h1 className="text-2xl font-bold mb-2 text-center">
            {state === 'request' && 'Forgot Password?'}
            {state === 'sent' && 'Check Your Email'}
            {state === 'reset' && 'Reset Your Password'}
            {state === 'success' && 'Password Reset!'}
          </h1>

          {/* Description */}
          <p className="text-muted-foreground mb-6 text-center">
            {state === 'request' &&
              "No worries! Enter your email and we'll send you reset instructions."}
            {state === 'sent' &&
              `We've sent a password reset link to ${email}. Check your inbox and follow the instructions.`}
            {state === 'reset' &&
              'Enter your new password below. Make sure it\'s at least 8 characters long.'}
            {state === 'success' &&
              'Your password has been successfully reset. You can now log in with your new password.'}
          </p>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Request Reset Form */}
          {state === 'request' && (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="input-field"
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
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
                    <span>Send Reset Link</span>
                  </>
                )}
              </motion.button>
            </form>
          )}

          {/* Email Sent State */}
          {state === 'sent' && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg glass text-sm">
                <p className="font-medium mb-2">Didn't receive the email?</p>
                <ul className="text-muted-foreground space-y-1 text-xs">
                  <li>• Check your spam/junk folder</li>
                  <li>• Make sure you entered the correct email</li>
                  <li>• Wait a few minutes and check again</li>
                </ul>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setState('request')}
                className="w-full py-3 px-4 rounded-xl glass hover:bg-white/10 transition-all duration-300 border border-white/10 font-medium"
              >
                Try Another Email
              </motion.button>
            </div>
          )}

          {/* Reset Password Form */}
          {state === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    className="input-field pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={8}
                    className="input-field pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-lg glass text-xs text-muted-foreground">
                <p className="font-medium mb-1">Password Requirements:</p>
                <ul className="space-y-1">
                  <li className={newPassword.length >= 8 ? 'text-wc-accent' : ''}>
                    • At least 8 characters
                  </li>
                  <li className={newPassword !== confirmPassword || !confirmPassword ? '' : 'text-wc-accent'}>
                    • Passwords match
                  </li>
                </ul>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Resetting...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    <span>Reset Password</span>
                  </>
                )}
              </motion.button>
            </form>
          )}

          {/* Success State */}
          {state === 'success' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <p className="text-sm text-muted-foreground mb-4">
                Redirecting to login page...
              </p>
              <Link href="/login">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-primary w-full"
                >
                  Go to Login Now
                </motion.button>
              </Link>
            </motion.div>
          )}

          {/* Remember Password Link */}
          {(state === 'request' || state === 'sent') && (
            <p className="text-center text-sm text-muted-foreground mt-6">
              Remember your password?{' '}
              <Link href="/login" className="text-wc-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-wc-primary animate-spin" />
      </div>
    }>
      <ForgotPasswordContent />
    </Suspense>
  );
}
