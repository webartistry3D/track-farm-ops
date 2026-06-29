import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Forgot password?</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm">
            Enter your email and we'll send you a reset link.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8">
          {submitted ? (
            <div className="text-center">
              <div className="text-4xl mb-4">📧</div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Check your inbox</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                If <strong>{email}</strong> is registered, you'll receive a password reset link shortly.
              </p>
              <Link
                to="/login"
                className="text-green-600 dark:text-green-400 hover:underline text-sm font-medium"
              >
                Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg px-4 py-3 text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoFocus
                  placeholder="you@example.com"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold rounded-lg transition-colors text-sm"
              >
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
              <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                <Link to="/login" className="text-green-600 dark:text-green-400 hover:underline">
                  Back to login
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
