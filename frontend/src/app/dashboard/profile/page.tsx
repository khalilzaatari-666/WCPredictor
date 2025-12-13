'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  Wallet,
  Save,
  Camera,
  Shield,
  Bell,
  Palette,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

export default function ProfilePage() {
  const { user, setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    walletAddress: user?.walletAddress || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Check if adding new email (requires verification)
      const isAddingEmail = !user?.email && formData.email && formData.email.trim();

      // Check if adding new phone (requires verification)
      const isAddingPhone = !user?.phoneNumber && formData.phoneNumber && formData.phoneNumber.trim();

      // If adding email, send verification email first
      if (isAddingEmail) {
        await api.post('/auth/profile/add-email', { email: formData.email.trim() });
        setSuccess('Verification email sent! Please check your inbox and verify your email.');
        setTimeout(() => setSuccess(''), 5000);
        setLoading(false);
        return;
      }

      // If adding phone, send OTP first
      if (isAddingPhone) {
        await api.post('/auth/profile/add-phone', { phoneNumber: formData.phoneNumber.trim() });
        // Redirect to OTP verification page
        window.location.href = `/verify-phone?phone=${encodeURIComponent(formData.phoneNumber.trim())}&returnTo=/dashboard/profile`;
        return;
      }

      // Filter out empty fields to avoid validation errors
      const updates: any = {};
      if (formData.username && formData.username.trim()) {
        updates.username = formData.username.trim();
      }
      if (formData.walletAddress && formData.walletAddress.trim()) {
        updates.walletAddress = formData.walletAddress.trim();
      }

      // Only update if there are actual changes
      if (Object.keys(updates).length === 0) {
        setError('No changes to save');
        setLoading(false);
        return;
      }

      const response = await api.put('/auth/profile', updates);
      if (response.data.success) {
        setAuth(response.data.data.user, localStorage.getItem('authToken') || '');
        setSuccess('Profile updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err: any) {
      console.error('Profile update error:', err);
      console.error('Response data:', err.response?.data);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || 'Failed to update profile';
      setError(errorMsg);
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold flex items-center gap-2">
          <User className="w-10 h-10 text-green-500" />
          Profile Settings
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your account information and preferences
        </p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-500"
        >
          {success}
        </motion.div>
      )}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500"
        >
          {error}
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Picture */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card text-center"
        >
          <div className="relative inline-block mb-4">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-wc-primary to-wc-accent flex items-center justify-center text-white text-4xl font-bold">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <button className="absolute bottom-0 right-0 p-2 rounded-full bg-wc-primary text-white hover:bg-wc-primary/80 transition-colors">
              <Camera className="w-5 h-5" />
            </button>
          </div>
          <h2 className="text-2xl font-bold mb-1">{user?.username}</h2>
        </motion.div>

        {/* Profile Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 glass-card"
        >
          <h2 className="text-2xl font-bold mb-6">Account Information</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email {!user?.email && <span className="text-xs text-muted-foreground">(Optional - cannot be changed once set)</span>}
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder='user@example.com'
                className="input-field"
                disabled={!!user?.email}
              />
              {user?.email && (
                <p className="text-xs text-muted-foreground mt-1">
                  Email is locked and cannot be changed
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number {!user?.phoneNumber && <span className="text-xs text-muted-foreground">(Optional - cannot be changed once set)</span>}
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
                placeholder="+1234567890"
                className="input-field"
                disabled={!!user?.phoneNumber}
              />
              {user?.phoneNumber && (
                <p className="text-xs text-muted-foreground mt-1">
                  Phone number is locked and cannot be changed
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Wallet Address {!user?.walletAddress && <span className="text-xs text-muted-foreground">(Optional - cannot be changed once set)</span>}
              </label>
              <input
                type="text"
                value={formData.walletAddress}
                onChange={(e) =>
                  setFormData({ ...formData, walletAddress: e.target.value })
                }
                placeholder="0x..."
                className="input-field"
                disabled={!!user?.walletAddress}
              />
              {user?.walletAddress && (
                <p className="text-xs text-muted-foreground mt-1">
                  Wallet address is locked and cannot be changed
                </p>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save Changes</span>
                </>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>

      {/* Additional Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Security */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card"
        >
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Shield className="w-6 h-6 text-wc-primary" />
            Security
          </h3>
          <div className="space-y-3">
            <button className="w-full p-3 rounded-lg glass hover:bg-white/5 transition-all text-left">
              <div className="font-medium">Change Password</div>
              <div className="text-xs text-muted-foreground">
                Update your account password
              </div>
            </button>
            <button className="w-full p-3 rounded-lg glass hover:bg-white/5 transition-all text-left">
              <div className="font-medium">Two-Factor Authentication</div>
              <div className="text-xs text-muted-foreground">
                Enable 2FA for extra security
              </div>
            </button>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card"
        >
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Bell className="w-6 h-6 text-wc-accent" />
            Notifications
          </h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-lg glass hover:bg-white/5 transition-all cursor-pointer">
              <div>
                <div className="font-medium">Email Notifications</div>
                <div className="text-xs text-muted-foreground">
                  Receive updates via email
                </div>
              </div>
              <input type="checkbox" className="rounded" defaultChecked />
            </label>
            <label className="flex items-center justify-between p-3 rounded-lg glass hover:bg-white/5 transition-all cursor-pointer">
              <div>
                <div className="font-medium">Match Reminders</div>
                <div className="text-xs text-muted-foreground">
                  Get notified before matches
                </div>
              </div>
              <input type="checkbox" className="rounded" defaultChecked />
            </label>
          </div>
        </motion.div>
      </div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card border-2 border-red-500/30"
      >
        <h3 className="text-xl font-bold mb-4 text-red-500">Danger Zone</h3>
        <div className="space-y-3">
          <button className="w-full p-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-all text-left text-red-500 border border-red-500/30">
            <div className="font-medium">Delete Account</div>
            <div className="text-xs">
              Permanently delete your account and all data
            </div>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
