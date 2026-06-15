// src/app/forgot-password/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { resetPassword } from '@/lib/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }

    setLoading(true);

    const { error: resetError } = await resetPassword(email);

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[#0f1117] flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">

        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500 flex items-center justify-center text-black font-bold text-xl">
            AI
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">AI Intelligence Platform</h1>
            <p className="mt-1 text-gray-400 text-sm">Reset your password</p>
          </div>
        </div>

        {/* Success State */}
        {success ? (
          <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl p-8 text-center space-y-4">
            <div className="text-4xl">📧</div>
            <h2 className="text-white font-semibold text-lg">Check your email</h2>
            <p className="text-gray-400 text-sm">
              We sent a password reset link to{' '}
              <span className="text-cyan-400 font-medium">{email}</span>.
              Click the link in the email to reset your password.
            </p>
            <p className="text-gray-500 text-xs">
              Didn&apos;t receive it? Check your spam folder or try again.
            </p>
            <div className="space-y-3 pt-2">
              <button
                onClick={() => { setSuccess(false); setEmail(''); }}
                className="block w-full py-3 rounded-xl border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 text-sm font-medium transition-colors"
              >
                Try a different email
              </button>
              <Link
                href="/login"
                className="block w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-sm transition-colors text-center"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          /* Form */
          <div className="bg-[#1a1d27] border border-gray-800 rounded-2xl p-8 space-y-6">

            <p className="text-gray-400 text-sm">
              Enter the email address associated with your account and we&apos;ll
              send you a link to reset your password.
            </p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-[#0f1117] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold text-sm transition-colors"
              >
                {loading ? 'Sending reset link...' : 'Send Reset Link'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-400">
              Remember your password?{' '}
              <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                Sign in
              </Link>
            </p>

          </div>
        )}

      </div>
    </main>
  );
}