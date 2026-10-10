import React, { useState } from 'react';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import NeoNovaLogo from '../common/NeoNovaLogo';
import { saveActiveSubscriptionPlan } from '../../lib/billing';

export interface AuthenticatedUser {
  id: string;
  username: string;
  email: string;
  isEmailVerified: boolean;
  grade: string;
  studentName: string;
  studentAvatar: string;
  planTier: 'starter' | 'plus' | 'pro';
  billingCycle?: 'monthly' | 'yearly';
  subscriptionExpires?: string;
  subscriptionStatus?: 'active' | 'expired' | 'none';
  studyXP: number;
  createdAt: string;
}

interface NeoNovaAuthScreenProps {
  onAuthSuccess: (user: AuthenticatedUser, token: string) => void;
}

type AuthMode = 'login' | 'register' | 'forgot_password' | 'reset_password';

export default function NeoNovaAuthScreen({ onAuthSuccess }: NeoNovaAuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // Forgot / Reset password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Loading & error feedback
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Please wait...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const clearFeedback = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleSwitchMode = (newMode: AuthMode) => {
    clearFeedback();
    setMode(newMode);
  };

  const isEmailValid = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  // ==========================================
  // 1. REAL LOGIN HANDLER
  // ==========================================
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();

    const email = loginEmail.trim();
    const password = loginPassword;

    if (!email) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (!isEmailValid(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);
    setLoadingText('Signing in...');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: email,
          password
        })
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setErrorMessage(data?.error || 'Incorrect email or password.');
        return;
      }

      if (!data?.user || !data?.token) {
        setErrorMessage('Unable to connect right now. Please try again.');
        return;
      }

      // Persist session
      localStorage.setItem('neonova_auth_token', data.token);
      localStorage.setItem('neonova_auth_user', JSON.stringify(data.user));
      localStorage.setItem('neonova_installed_profile', JSON.stringify(data.user));

      if (data.user.planTier === 'plus' || data.user.planTier === 'pro') {
        saveActiveSubscriptionPlan(
          data.user.planTier,
          data.user.billingCycle || 'monthly',
          data.user.studentName || data.user.username
        );
      }

      onAuthSuccess(data.user, data.token);
    } catch {
      setErrorMessage('Unable to connect right now. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // 2. REAL SIGNUP HANDLER
  // ==========================================
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();

    const username = regUsername.trim();
    const email = regEmail.trim();
    const password = regPassword;
    const confirmPassword = regConfirmPassword;

    if (!username || username.length < 3) {
      setErrorMessage('Username must be at least 3 characters long.');
      return;
    }

    if (!email || !isEmailValid(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setLoadingText('Creating your account...');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          email,
          password,
          confirmPassword,
          grade: 'Grade 8',
          studentName: username,
          studentAvatar: 'Student',
          planTier: 'starter',
          billingCycle: 'monthly'
        })
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        if (res.status === 409 || data?.error?.toLowerCase().includes('already exists')) {
          setErrorMessage('An account with this email already exists.');
        } else {
          setErrorMessage(data?.error || 'Account creation failed. Please check your details.');
        }
        return;
      }

      if (data?.user && data?.token) {
        localStorage.setItem('neonova_auth_token', data.token);
        localStorage.setItem('neonova_auth_user', JSON.stringify(data.user));
        localStorage.setItem('neonova_installed_profile', JSON.stringify(data.user));

        onAuthSuccess(data.user, data.token);
        return;
      }

      setSuccessMessage('Account created successfully. Please sign in.');
      setMode('login');
      setLoginEmail(email);
    } catch {
      setErrorMessage('Unable to connect right now. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // 3. FORGOT PASSWORD HANDLER
  // ==========================================
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();

    if (!forgotEmail.trim() || !isEmailValid(forgotEmail)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setLoadingText('Sending reset code...');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim() })
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setErrorMessage(data?.error || 'Account not found with that email.');
        return;
      }

      if (data?.demoCode) {
        setDemoCode(data.demoCode);
      }
      setSuccessMessage('Reset code sent. Please check your email or use the code below.');
      setMode('reset_password');
    } catch {
      setErrorMessage('Unable to connect right now. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // 4. RESET PASSWORD HANDLER
  // ==========================================
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();

    if (!resetCode.trim()) {
      setErrorMessage('Please enter the reset code.');
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setLoadingText('Updating password...');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail.trim(),
          code: resetCode.trim(),
          newPassword
        })
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setErrorMessage(data?.error || 'Invalid reset code.');
        return;
      }

      setSuccessMessage('Password reset successfully. Please log in with your new password.');
      setMode('login');
      setLoginEmail(forgotEmail.trim());
      setLoginPassword('');
    } catch {
      setErrorMessage('Unable to connect right now. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans antialiased">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Creative NeoNova Logo & Welcome Header */}
        <div className="inline-flex items-center justify-center mb-3">
          <NeoNovaLogo size={44} variant="badge" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          {mode === 'login' && 'Welcome back'}
          {mode === 'register' && 'Create your account'}
          {mode === 'forgot_password' && 'Reset your password'}
          {mode === 'reset_password' && 'Enter reset code'}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {mode === 'login' && 'Sign in to continue learning with NeoNova'}
          {mode === 'register' && 'Start learning smarter with NeoNova'}
          {mode === 'forgot_password' && 'Enter your registered email address'}
          {mode === 'reset_password' && 'Enter the 6-digit verification code'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 border border-slate-200 rounded-lg sm:px-10">
          
          {/* Messages */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mb-5 p-3 rounded-md bg-green-50 border border-green-200 text-green-700 text-sm">
              {successMessage}
            </div>
          )}

          {/* 1. LOGIN */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label 
                  htmlFor="login-email" 
                  className="block text-sm font-medium text-slate-700"
                >
                  Email address
                </label>
                <div className="mt-1.5">
                  <input
                    id="login-email"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="name@example.com"
                    className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label 
                    htmlFor="login-password" 
                    className="block text-sm font-medium text-slate-700"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('forgot_password')}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="mt-1.5 relative">
                  <input
                    id="login-password"
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    placeholder="Enter password"
                    className="block w-full rounded-md border border-slate-300 pl-3 pr-10 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                    aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                  >
                    {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 cursor-pointer"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      <span>{loadingText}</span>
                    </span>
                  ) : (
                    'Log in'
                  )}
                </button>
              </div>

              <div className="mt-6 border-t border-slate-200 pt-5 text-center text-sm text-slate-600">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleSwitchMode('register')}
                  className="font-medium text-blue-600 hover:text-blue-700 ml-1"
                >
                  Create an account
                </button>
              </div>
            </form>
          )}

          {/* 2. SIGN UP */}
          {mode === 'register' && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label 
                  htmlFor="reg-username" 
                  className="block text-sm font-medium text-slate-700"
                >
                  Username
                </label>
                <div className="mt-1.5">
                  <input
                    id="reg-username"
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    required
                    autoComplete="username"
                    placeholder="alexsmith"
                    className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label 
                  htmlFor="reg-email" 
                  className="block text-sm font-medium text-slate-700"
                >
                  Email address
                </label>
                <div className="mt-1.5">
                  <input
                    id="reg-email"
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="name@example.com"
                    className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label 
                  htmlFor="reg-password" 
                  className="block text-sm font-medium text-slate-700"
                >
                  Password
                </label>
                <div className="mt-1.5 relative">
                  <input
                    id="reg-password"
                    type={showRegPassword ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    className="block w-full rounded-md border border-slate-300 pl-3 pr-10 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegPassword(!showRegPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                  >
                    {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label 
                  htmlFor="reg-confirm-password" 
                  className="block text-sm font-medium text-slate-700"
                >
                  Confirm password
                </label>
                <div className="mt-1.5 relative">
                  <input
                    id="reg-confirm-password"
                    type={showRegConfirmPassword ? 'text' : 'password'}
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    placeholder="Re-enter password"
                    className="block w-full rounded-md border border-slate-300 pl-3 pr-10 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                  >
                    {showRegConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 cursor-pointer"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      <span>{loadingText}</span>
                    </span>
                  ) : (
                    'Create account'
                  )}
                </button>
              </div>

              <div className="mt-6 border-t border-slate-200 pt-5 text-center text-sm text-slate-600">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => handleSwitchMode('login')}
                  className="font-medium text-blue-600 hover:text-blue-700 ml-1"
                >
                  Log in
                </button>
              </div>
            </form>
          )}

          {/* 3. FORGOT PASSWORD */}
          {mode === 'forgot_password' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label 
                  htmlFor="forgot-email" 
                  className="block text-sm font-medium text-slate-700"
                >
                  Email address
                </label>
                <div className="mt-1.5">
                  <input
                    id="forgot-email"
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                    placeholder="name@example.com"
                    className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 cursor-pointer"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      <span>Sending code...</span>
                    </span>
                  ) : (
                    'Send reset code'
                  )}
                </button>
              </div>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => handleSwitchMode('login')}
                  className="text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  Back to log in
                </button>
              </div>
            </form>
          )}

          {/* 4. RESET PASSWORD */}
          {mode === 'reset_password' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {demoCode && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700 text-center font-mono">
                  Verification Code: {demoCode}
                </div>
              )}

              <div>
                <label 
                  htmlFor="reset-code" 
                  className="block text-sm font-medium text-slate-700"
                >
                  Reset code
                </label>
                <div className="mt-1.5">
                  <input
                    id="reset-code"
                    type="text"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    required
                    placeholder="Enter 6-digit code"
                    className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label 
                  htmlFor="new-password" 
                  className="block text-sm font-medium text-slate-700"
                >
                  New password
                </label>
                <div className="mt-1.5 relative">
                  <input
                    id="new-password"
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="At least 8 characters"
                    className="block w-full rounded-md border border-slate-300 pl-3 pr-10 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label 
                  htmlFor="confirm-new-password" 
                  className="block text-sm font-medium text-slate-700"
                >
                  Confirm new password
                </label>
                <div className="mt-1.5">
                  <input
                    id="confirm-new-password"
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                    placeholder="Re-enter new password"
                    className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 cursor-pointer"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin" />
                      <span>Updating password...</span>
                    </span>
                  ) : (
                    'Save new password'
                  )}
                </button>
              </div>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => handleSwitchMode('login')}
                  className="text-sm font-medium text-slate-600 hover:text-slate-900"
                >
                  Back to log in
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
