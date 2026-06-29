import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../lib/api';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided.');
      return;
    }

    api.get(`/auth/verify-email?token=${token}`)
      .then(() => setStatus('success'))
      .catch(err => {
        setStatus('error');
        setMessage(err?.response?.data?.error || 'Verification failed. The link may have expired.');
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <div className="text-4xl mb-4 animate-spin inline-block">⏳</div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">Verifying your email…</h1>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-5xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Email verified!</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              Your email address has been confirmed. You're all set.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors text-sm"
            >
              Go to Login
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-5xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Verification failed</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{message}</p>
            <Link
              to="/login"
              className="text-green-600 dark:text-green-400 hover:underline text-sm font-medium"
            >
              Back to login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
