import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../services/authContext';
import { NoireLogo } from './NoireLogo';
import { SoundService } from '../services/sound';
import { GoogleSignInButton } from './GoogleSignInButton';

interface ModalAuthProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const ModalAuth: React.FC<ModalAuthProps> = ({ onClose, onSuccess }) => {
  const {
    currentUser,
    userProfile,
    hasGmailAccess,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signInAsGuest,
    logout,
    authError,
    clearError,
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsSubmitting(true);
    try {
      SoundService.playTap();
      if (mode === 'signin') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password, displayName);
      }
      onSuccess?.();
      onClose();
    } catch {
      // Error handled in auth context
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setIsSubmitting(true);
    try {
      SoundService.playTap();
      await signInWithGoogle();
      onSuccess?.();
      onClose();
    } catch {
      // Handled
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuest = async () => {
    setIsSubmitting(true);
    try {
      SoundService.playTap();
      await signInAsGuest();
      onSuccess?.();
      onClose();
    } catch {
      // Handled
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    SoundService.playTap();
    await logout();
  };

  // If user is already authenticated, show account profile view with logout option
  if (currentUser) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <div className="w-full max-w-sm rounded-[32px] glass-panel border border-[rgba(244,233,229,0.2)] p-6 shadow-2xl text-center">
          <div className="flex justify-end mb-2">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full glass-control flex items-center justify-center text-[#F4E9E5] hover:border-[#D8A6AC] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="w-16 h-16 rounded-full mx-auto mb-3 p-1 border-2 border-[#D8A6AC] bg-[#28171B] overflow-hidden flex items-center justify-center">
            {userProfile?.photoURL ? (
              <img
                src={userProfile.photoURL}
                alt="Avatar"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <UserIcon className="w-8 h-8 text-[#D8A6AC]" />
            )}
          </div>

          <h3 className="font-serif text-2xl text-[#F4E9E5] mb-1">
            {userProfile?.displayName || 'Fragrance Connoisseur'}
          </h3>
          <p className="text-xs text-[#C8B7B9] font-sans mb-4">
            {userProfile?.isAnonymous
              ? 'Guest Explorer Account'
              : userProfile?.email || 'Authenticated Member'}
          </p>

          <div className="p-3.5 rounded-2xl bg-[#1A0D10] border border-[rgba(244,233,229,0.1)] text-left text-xs mb-4 space-y-2">
            <div className="flex items-center gap-2 text-[#D8A6AC] font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>Wardrobe Cloud Sync Active</span>
            </div>
            <p className="text-[11px] text-[#C8B7B9] leading-relaxed">
              Your bottles, notes, and wear history are securely saved and synced with your account.
            </p>
            <div className="pt-2 border-t border-[rgba(244,233,229,0.08)] flex items-center justify-between">
              <span className="text-[11px] text-[#C8B7B9]">Gmail Integration</span>
              <span className={`text-[11px] font-medium ${hasGmailAccess ? 'text-[#F4E9E5]' : 'text-[#D8A6AC]'}`}>
                {hasGmailAccess ? 'Connected' : 'Authorization needed'}
              </span>
            </div>
          </div>

          {!hasGmailAccess && (
            <div className="mb-4">
              <GoogleSignInButton
                onClick={handleGoogle}
                disabled={isSubmitting}
                label="Connect Gmail with Google"
              />
            </div>
          )}

          <div className="flex flex-col gap-2.5">
            <button
              onClick={handleLogout}
              className="w-full py-3 rounded-full text-xs font-sans font-semibold text-red-300 bg-red-950/30 hover:bg-red-950/60 border border-red-900/40 transition-all cursor-pointer"
            >
              Sign Out
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-full glass-control text-xs font-sans text-[#F4E9E5] hover:bg-white/10 cursor-pointer"
            >
              Return to Wardrobe
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-sm rounded-[32px] glass-panel border border-[rgba(244,233,229,0.2)] p-6 sm:p-7 shadow-2xl my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full glass-control flex items-center justify-center text-[#F4E9E5] hover:border-[#D8A6AC] cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <NoireLogo size="sm" showWordmark={false} className="mb-2" />
          <h3 className="font-serif text-2xl text-[#F4E9E5]">
            {mode === 'signin' ? 'Sign in to Noiré' : 'Create Account'}
          </h3>
          <p className="text-xs text-[#C8B7B9] font-sans mt-0.5">
            Preserve and synchronize your private fragrance wardrobe
          </p>
        </div>

        {/* Error Alert */}
        {authError && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-xs text-red-200 flex items-center justify-between">
            <span className="truncate pr-2">{authError}</span>
            <button onClick={clearError} className="text-red-300 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tab Switcher: Sign In vs Sign Up */}
        <div className="glass-control p-1 rounded-full flex mb-5 text-xs font-sans">
          <button
            onClick={() => {
              setMode('signin');
              clearError();
            }}
            className={`flex-1 py-1.5 rounded-full transition-all cursor-pointer font-medium ${
              mode === 'signin'
                ? 'bg-[#F4E9E5] text-[#10090B] font-semibold shadow-sm'
                : 'text-[#C8B7B9] hover:text-[#F4E9E5]'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setMode('signup');
              clearError();
            }}
            className={`flex-1 py-1.5 rounded-full transition-all cursor-pointer font-medium ${
              mode === 'signup'
                ? 'bg-[#F4E9E5] text-[#10090B] font-semibold shadow-sm'
                : 'text-[#C8B7B9] hover:text-[#F4E9E5]'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Official Google OAuth Sign-In Button */}
        <div className="mb-4">
          <GoogleSignInButton onClick={handleGoogle} disabled={isSubmitting} />
        </div>

        <div className="relative flex items-center justify-center my-4">
          <div className="w-full border-t border-[rgba(244,233,229,0.12)]" />
          <span className="absolute bg-[#1B0E12] px-2 text-[10px] text-[#C8B7B9] uppercase tracking-widest font-sans">
            or with email
          </span>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3 text-xs font-sans">
          {mode === 'signup' && (
            <div>
              <label className="block text-[11px] text-[#C8B7B9] mb-1">Your Name</label>
              <div className="relative flex items-center">
                <UserIcon className="absolute left-3.5 w-3.5 h-3.5 text-[#C8B7B9]" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Christian"
                  className="w-full bg-[#180C0F] border border-[rgba(244,233,229,0.18)] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#F4E9E5] focus:outline-none focus:border-[#D8A6AC]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] text-[#C8B7B9] mb-1">Email Address</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 w-3.5 h-3.5 text-[#C8B7B9]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-[#180C0F] border border-[rgba(244,233,229,0.18)] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#F4E9E5] focus:outline-none focus:border-[#D8A6AC]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] text-[#C8B7B9] mb-1">Password</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 w-3.5 h-3.5 text-[#C8B7B9]" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#180C0F] border border-[rgba(244,233,229,0.18)] rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-[#F4E9E5] focus:outline-none focus:border-[#D8A6AC]"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3.5 px-4 rounded-full bg-[#F4E9E5] text-[#10090B] font-sans font-semibold text-xs transition-all hover:bg-white active:scale-98 shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>{mode === 'signin' ? 'Sign In' : 'Create My Account'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Guest Explorer Option */}
        <div className="mt-4 pt-3 border-t border-[rgba(244,233,229,0.1)] text-center">
          <button
            type="button"
            onClick={handleGuest}
            disabled={isSubmitting}
            className="text-xs text-[#C8B7B9] hover:text-[#D8A6AC] transition-colors cursor-pointer"
          >
            Or continue as Guest Explorer
          </button>
        </div>
      </div>
    </div>
  );
};
