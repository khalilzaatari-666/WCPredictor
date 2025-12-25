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
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

export default function ProfilePage() {
  const { user, setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await api.delete('/auth/account');
      // Clear auth state
      setAuth(null, '');
      localStorage.removeItem('authToken');
      // Redirect to home page
      window.location.href = '/';
    } catch (err: any) {
      console.error('Delete account error:', err);
      setError(err.response?.data?.message || 'Failed to delete account');
      setShowDeleteConfirm(false);
      setTimeout(() => setError(''), 5000);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      setTimeout(() => setError(''), 5000);
      return;
    }

    // Validate password length
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      setTimeout(() => setError(''), 5000);
      return;
    }

    setPasswordLoading(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      setSuccess('Password changed successfully!');
      setShowChangePassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      console.error('Change password error:', err);
      setError(err.response?.data?.message || 'Failed to change password');
      setTimeout(() => setError(''), 5000);
    } finally {
      setPasswordLoading(false);
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

      {/* Security */}
      {user?.authProvider === 'email' && (
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
            <button
              onClick={() => setShowChangePassword(true)}
              className="w-full p-3 rounded-lg glass hover:bg-white/5 transition-all text-left"
            >
              <div className="font-medium">Change Password</div>
              <div className="text-xs text-muted-foreground">
                Update your account password
              </div>
            </button>
          </div>
        </motion.div>
      )}

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card border-2 border-red-500/30"
      >
        <h3 className="text-xl font-bold mb-4 text-red-500">Danger Zone</h3>
        <div className="space-y-3">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full p-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-all text-left text-red-500 border border-red-500/30"
          >
            <div className="font-medium">Delete Account</div>
            <div className="text-xs">
              Permanently delete your account and all data
            </div>
          </button>
        </div>
      </motion.div>

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card max-w-md w-full"
          >
            <h3 className="text-2xl font-bold mb-4">Change Password</h3>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="input-field"
                  required
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-field"
                  required
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field"
                  required
                  placeholder="Confirm new password"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowChangePassword(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  disabled={passwordLoading}
                  className="flex-1 py-3 px-4 rounded-xl glass hover:bg-white/5 transition-all font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="flex-1 py-3 px-4 rounded-xl bg-wc-primary hover:bg-wc-primary/80 transition-all font-medium text-white flex items-center justify-center gap-2"
                >
                  {passwordLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Changing...</span>
                    </>
                  ) : (
                    <span>Change Password</span>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card max-w-md w-full border-2 border-red-500/30"
          >
            <h3 className="text-2xl font-bold text-red-500 mb-4">Delete Account?</h3>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete your account? This action cannot be undone.
              All your predictions, achievements, and data will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteLoading}
                className="flex-1 py-3 px-4 rounded-xl glass hover:bg-white/5 transition-all font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
                className="flex-1 py-3 px-4 rounded-xl bg-red-500 hover:bg-red-600 transition-all font-medium text-white flex items-center justify-center gap-2"
              >
                {deleteLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Account</span>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
