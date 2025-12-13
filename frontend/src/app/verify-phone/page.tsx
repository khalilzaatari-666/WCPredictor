'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Phone,
  Loader2,
  CheckCircle,
  XCircle,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

function VerifyPhoneContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    const phoneParam = searchParams.get('phone');
    const usernameParam = searchParams.get('username');

    if (phoneParam) setPhone(phoneParam);
    if (usernameParam) setUsername(usernameParam);

    // Start countdown timer
    const timer = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [searchParams]);

  const handleOtpChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }

    // Auto-submit when all digits are entered
    if (index === 5 && value && newOtp.every(digit => digit !== '')) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);

    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split('').concat(Array(6).fill('')).slice(0, 6);
    setOtp(newOtp);

    // Focus last filled input or first empty
    const lastIndex = Math.min(pastedData.length, 5);
    inputRefs[lastIndex].current?.focus();

    // Auto-submit if pasted complete OTP
    if (pastedData.length === 6) {
      handleVerify(pastedData);
    }
  };

  const handleVerify = async (otpCode?: string) => {
    setLoading(true);
    setError('');

    const code = otpCode || otp.join('');

    if (code.length !== 6) {
      setError('Please enter the complete 6-digit code');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/phone/verify', {
        phoneNumber: phone,
        code,
      });

      if (response.data.success) {
        setSuccess(true);

        // Store token if registration was completed
        if (response.data.data.token) {
          const { user, token } = response.data.data;
          localStorage.setItem('authToken', token);
          setAuth(user, token);
          setTimeout(() => {
            router.push('/dashboard');
          }, 1500);
        } else {
          // If just verification, redirect to login
          setTimeout(() => {
            router.push('/login');
          }, 1500);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid or expired code. Please try again.');
      setOtp(['', '', '', '', '', '']);
      inputRefs[0].current?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    setError('');

    try {
      // If coming from registration, resend with phone registration
      if (username) {
        await api.post('/auth/phone/resend-otp', {
          phoneNumber: phone,
        });
      } else {
        // If coming from login, resend login OTP
        await api.post('/auth/phone/login', {
          phoneNumber: phone,
        });
      }

      setResendTimer(60);
      const timer = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to resend code');
    } finally {
      setResendLoading(false);
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
        <Link href={username ? '/register' : '/login'}>
          <motion.button
            whileHover={{ x: -5 }}
            className="flex items-center space-x-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
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
              backgroundColor: success
                ? 'rgba(var(--wc-accent) / 0.2)'
                : 'rgba(var(--wc-primary) / 0.2)',
            }}
          >
            {success ? (
              <CheckCircle className="w-10 h-10 text-wc-accent" />
            ) : (
              <Phone className="w-10 h-10 text-wc-primary" />
            )}
          </motion.div>

          {/* Title */}
          <h1 className="text-2xl font-bold mb-2">
            {success ? 'Phone Verified!' : 'Enter Verification Code'}
          </h1>

          {/* Phone Number */}
          <p className="text-muted-foreground mb-6">
            {success
              ? 'Your phone number has been verified successfully'
              : `We've sent a 6-digit code to ${phone}`}
          </p>

          {!success && (
            <>
              {/* OTP Input */}
              <div className="flex justify-center gap-3 mb-4" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                  <motion.input
                    key={index}
                    ref={inputRefs[index]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    whileFocus={{ scale: 1.1 }}
                    className="w-12 h-14 text-center text-2xl font-bold glass border-2 border-white/10 focus:border-wc-primary rounded-xl transition-all outline-none"
                  />
                ))}
              </div>

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

              {/* Verify Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleVerify()}
                disabled={loading || otp.some(digit => !digit)}
                className="btn-primary w-full flex items-center justify-center space-x-2 mb-6"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Verify Code</span>
                )}
              </motion.button>

              {/* Resend Code */}
              <div className="text-sm">
                <p className="text-muted-foreground mb-2">Didn't receive the code?</p>
                {resendTimer > 0 ? (
                  <p className="text-muted-foreground">
                    Resend in <span className="text-wc-primary font-medium">{resendTimer}s</span>
                  </p>
                ) : (
                  <button
                    onClick={handleResend}
                    disabled={resendLoading}
                    className="text-wc-primary hover:underline font-medium"
                  >
                    {resendLoading ? 'Sending...' : 'Resend Code'}
                  </button>
                )}
              </div>
            </>
          )}

          {/* Success Message */}
          {success && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-sm text-muted-foreground mt-4"
            >
              Redirecting...
            </motion.p>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default function VerifyPhonePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-wc-primary animate-spin" />
      </div>
    }>
      <VerifyPhoneContent />
    </Suspense>
  );
}
