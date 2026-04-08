import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import api from '../lib/api';
import { Eye, EyeOff } from 'lucide-react';

interface SignupData {
  farmName: string;
  ownerName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  farmType: string;
  farmSize: string;
}

const Signup = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState<SignupData>({
    farmName: '',
    ownerName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    farmType: '',
    farmSize: ''
  });

  // Clear form on component mount
  useEffect(() => {
    setFormData({
      farmName: '',
      ownerName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      farmType: '',
      farmSize: ''
    });
    setError('');
    setMessage('');
  }, []);

  const farmTypes = [
    'Poultry',
    'Livestock',
    'Crop Farming',
    'Mixed Farm',
    'Fish Farming',
    'Other'
  ];

  const farmSizes = [
    'Small (1-5 acres)',
    'Medium (6-20 acres)',
    'Large (21-50 acres)',
    'Very Large (50+ acres)'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateStep1 = () => {
    if (!formData.farmName.trim()) {
      setError('Farm name is required');
      return false;
    }
    if (!formData.ownerName.trim()) {
      setError('Owner name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    if (!formData.farmType) {
      setError('Please select farm type');
      return false;
    }
    if (!formData.farmSize) {
      setError('Please select farm size');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError('');
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!validateStep2()) {
      return;
    }

    setLoading(true);

    try {
      // Create farm owner account
      await api.post('/auth/signup', {
        name: formData.ownerName,
        email: formData.email,
        password: formData.password,
        farmName: formData.farmName,
        farmType: formData.farmType // Send farm type to backend
      });

      setMessage('Account created successfully! Logging you in...');
      
      // Auto-login after successful signup
      setTimeout(async () => {
        try {
          await login({
            email: formData.email,
            password: formData.password
          });
          navigate('/dashboard');
        } catch (loginError) {
          setError('Account created but login failed. Please try logging in manually.');
        }
      }, 2000);

    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Home Icon and Theme Toggle */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-4">
        <Link 
          to="/" 
          className="flex items-center justify-center w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg transition-shadow duration-200 text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400"
          title="Back to Home"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </Link>
        
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-md hover:shadow-lg transition-shadow duration-200 text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? '☀️' : '🌙'}
        </button>
      </div>

      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Create Your Farm Account
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            Join hundreds of Nigerian farmers managing their operations with FarmOps
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-4">
          <div className={`flex items-center ${step >= 1 ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
              1
            </div>
            <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">Farm Info</span>
          </div>
          <div className={`w-8 h-0.5 ${step >= 2 ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-600'}`}></div>
          <div className={`flex items-center ${step >= 2 ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-green-600 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
              2
            </div>
            <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">Account Setup</span>
          </div>
        </div>

        {message && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-md text-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="space-y-4">
              {/* First row: Farm Name and Owner Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="farmName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Farm Name *
                  </label>
                  <input
                    id="farmName"
                    name="farmName"
                    type="text"
                    required
                    className="form-input"
                    placeholder="Enter your farm name"
                    value={formData.farmName}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Your Name *
                  </label>
                  <input
                    id="ownerName"
                    name="ownerName"
                    type="text"
                    required
                    className="form-input"
                    placeholder="Enter your full name"
                    value={formData.ownerName}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Second row: Email and Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="form-input"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="off"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number *
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    className="form-input"
                    placeholder="+234 800 000 0000"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Third row: Farm Type and Farm Size */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="farmType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Farm Type *
                  </label>
                  <select
                    id="farmType"
                    name="farmType"
                    required
                    className="form-input"
                    value={formData.farmType}
                    onChange={handleChange}
                  >
                    <option value="">Select farm type</option>
                    {farmTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="farmSize" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Farm Size *
                  </label>
                  <select
                    id="farmSize"
                    name="farmSize"
                    required
                    className="form-input"
                    value={formData.farmSize}
                    onChange={handleChange}
                  >
                    <option value="">Select farm size</option>
                    {farmSizes.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="btn btn-primary w-full"
              >
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
                <h3 className="font-medium text-gray-900 dark:text-white mb-2">Farm Summary</h3>
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <p><strong>Farm:</strong> {formData.farmName}</p>
                  <p><strong>Owner:</strong> {formData.ownerName}</p>
                  <p><strong>Type:</strong> {formData.farmType}</p>
                  <p><strong>Size:</strong> {formData.farmSize}</p>
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    className="form-input pr-10"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleChange}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Minimum 6 characters</p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    className="form-input pr-10"
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">🎉 What happens next?</h4>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Your farm account will be created</li>
                  <li>• You'll be logged in automatically</li>
                  <li>• You can add workers and start tracking operations</li>
                  <li>• Free 30-day trial with all features</li>
                </ul>
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleBack}
                  className="btn btn-secondary flex-1"
                  disabled={loading}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            </div>
          )}

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-green-600 hover:text-green-500 font-medium">
                Sign in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
