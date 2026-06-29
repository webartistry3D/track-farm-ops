import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function NotFound() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGoBack = () => {
    if (user) {
      if (user.role === 'SUPERUSER') navigate('/super-user/dashboard');
      else if (user.role === 'VETERINARIAN') navigate('/livestock-health');
      else navigate('/dashboard');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-8xl font-extrabold text-green-600 dark:text-green-400 mb-4">
          404
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Page not found
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <button
          onClick={handleGoBack}
          className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
        >
          {user ? 'Go to Dashboard' : 'Go to Home'}
        </button>
      </div>
    </div>
  );
}
