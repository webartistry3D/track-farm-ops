import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { 
  User, Shield, Eye, EyeOff, CheckCircle, AlertCircle, 
  Building, Users
} from 'lucide-react';

interface SuperUserFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  organizationName: string;
  organizationType: string;
  adminCode: string;
  phone: string;
  address: string;
  securityQuestion: string;
  securityAnswer: string;
  acceptTerms: boolean;
  acceptResponsibility: boolean;
}

const SuperUserSignup = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState<SuperUserFormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    organizationName: '',
    organizationType: 'farm',
    adminCode: '',
    phone: '',
    address: '',
    securityQuestion: '',
    securityAnswer: '',
    acceptTerms: false,
    acceptResponsibility: false
  });

  const organizationTypes = [
    { value: 'farm', label: 'Farm/Agricultural Business', icon: '🌾' },
    { value: 'cooperative', label: 'Agricultural Cooperative', icon: '🤝' },
    { value: 'enterprise', label: 'Agricultural Enterprise', icon: '🏢' },
    { value: 'government', label: 'Government Agricultural Agency', icon: '🏛️' },
    { value: 'research', label: 'Research Institution', icon: '🔬' },
    { value: 'consulting', label: 'Agricultural Consulting', icon: '💼' }
  ];

  const securityQuestions = [
    'What was the name of your first pet?',
    'What is your mother\'s maiden name?',
    'What city were you born in?',
    'What is your favorite childhood teacher\'s name?',
    'What is the make and model of your first car?',
    'What is the name of your elementary school?'
  ];

  useEffect(() => {
    // Check if user is already logged in as superuser
    const token = localStorage.getItem('trackfarmops_token');
    const user = localStorage.getItem('trackfarmops_user');
    
    if (token && user) {
      const userData = JSON.parse(user);
      if (userData.role === 'superuser') {
        navigate('/super-user/dashboard');
      }
    }
  }, [navigate]);

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.fullName.trim()) {
        newErrors.fullName = 'Full name is required';
      }
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
      }
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 12) {
        newErrors.password = 'Password must be at least 12 characters';
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/.test(formData.password)) {
        newErrors.password = 'Password must contain uppercase, lowercase, number, and special character';
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    if (currentStep === 2) {
      if (!formData.organizationName.trim()) {
        newErrors.organizationName = 'Organization name is required';
      }
      if (!formData.organizationType) {
        newErrors.organizationType = 'Organization type is required';
      }
      if (!formData.adminCode.trim()) {
        newErrors.adminCode = 'Administrator authorization code is required';
      } else if (formData.adminCode.length < 8) {
        newErrors.adminCode = 'Admin code must be at least 8 characters';
      }
      if (!formData.phone.trim()) {
        newErrors.phone = 'Phone number is required';
      }
      if (!formData.address.trim()) {
        newErrors.address = 'Address is required';
      }
    }

    if (currentStep === 3) {
      if (!formData.securityQuestion) {
        newErrors.securityQuestion = 'Security question is required';
      }
      if (!formData.securityAnswer.trim()) {
        newErrors.securityAnswer = 'Security answer is required';
      }
      if (!formData.acceptTerms) {
        newErrors.acceptTerms = 'You must accept the terms and conditions';
      }
      if (!formData.acceptResponsibility) {
        newErrors.acceptResponsibility = 'You must accept the superuser responsibility agreement';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: checkbox.checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep(3)) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await api.post('/auth/superuser-signup', {
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        adminKey: formData.adminCode
      });

      if (response.data.user) {
        setSuccess('Superuser account created successfully! Logging you in...');
        
        // Auto-login after successful signup
        setTimeout(async () => {
          try {
            await login({
              email: formData.email,
              password: formData.password
            });
            navigate('/super-user/dashboard');
          } catch (error) {
            setSuccess('Account created! Please login with your credentials.');
            navigate('/login');
          }
        }, 2000);
      }
    } catch (error: any) {
      if (error.response?.data?.error) {
        setErrors({ submit: error.response.data.error });
      } else if (error.message.includes('timeout')) {
        setErrors({ submit: 'Request timed out. Please try again.' });
      } else {
        setErrors({ submit: 'Failed to create superuser account. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      { number: 1, title: 'Account Information', icon: User },
      { number: 2, title: 'Organization Details', icon: Building },
      { number: 3, title: 'Security Setup', icon: Shield }
    ];

    return (
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          {steps.map((stepItem, index) => (
            <div key={stepItem.number} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                step >= stepItem.number
                  ? 'bg-green-600 border-green-600 text-white'
                  : 'bg-gray-100 border-gray-300 text-gray-500'
              }`}>
                {step > stepItem.number ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <stepItem.icon className="w-5 h-5" />
                )}
              </div>
              <div className="ml-3 hidden sm:block">
                <p className={`text-sm font-medium ${
                  step >= stepItem.number ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {stepItem.title}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-4 ${
                  step > stepItem.number ? 'bg-green-600' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Superuser Registration</h2>
          <p className="text-green-100">
            Create your administrative account with complete system control
          </p>
        </div>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Form */}
        <div className="bg-white/10  rounded-2xl p-8 shadow-2xl border border-white/20">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{success}</h3>
              <p className="text-green-100">Redirecting to your dashboard...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Account Information */}
              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-green-100 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-sm text-red-400">{errors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-green-100 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="superuser@example.com"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-400">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-green-100 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent pr-12"
                        placeholder="Create a strong password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-green-200 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-400">{errors.password}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-green-100 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent pr-12"
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-green-200 hover:text-white"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-400">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Organization Details */}
              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-green-100 mb-2">
                      Organization Name
                    </label>
                    <input
                      type="text"
                      name="organizationName"
                      value={formData.organizationName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter organization name"
                    />
                    {errors.organizationName && (
                      <p className="mt-1 text-sm text-red-400">{errors.organizationName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-green-100 mb-2">
                      Organization Type
                    </label>
                    <select
                      name="organizationType"
                      value={formData.organizationType}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="" className="bg-gray-800">Select organization type</option>
                      {organizationTypes.map(type => (
                        <option key={type.value} value={type.value} className="bg-gray-800">
                          {type.icon} {type.label}
                        </option>
                      ))}
                    </select>
                    {errors.organizationType && (
                      <p className="mt-1 text-sm text-red-400">{errors.organizationType}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-green-100 mb-2">
                      Administrator Authorization Code
                    </label>
                    <input
                      type="text"
                      name="adminCode"
                      value={formData.adminCode}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter admin authorization code"
                    />
                    {errors.adminCode && (
                      <p className="mt-1 text-sm text-red-400">{errors.adminCode}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-green-100 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="+234-XXX-XXX-XXXX"
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-400">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-green-100 mb-2">
                      Address
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter complete address"
                    />
                    {errors.address && (
                      <p className="mt-1 text-sm text-red-400">{errors.address}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Security Setup */}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-green-100 mb-2">
                      Security Question
                    </label>
                    <select
                      name="securityQuestion"
                      value={formData.securityQuestion}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="" className="bg-gray-800">Select a security question</option>
                      {securityQuestions.map((question, index) => (
                        <option key={index} value={question} className="bg-gray-800">
                          {question}
                        </option>
                      ))}
                    </select>
                    {errors.securityQuestion && (
                      <p className="mt-1 text-sm text-red-400">{errors.securityQuestion}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-green-100 mb-2">
                      Security Answer
                    </label>
                    <input
                      type="text"
                      name="securityAnswer"
                      value={formData.securityAnswer}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Enter your security answer"
                    />
                    {errors.securityAnswer && (
                      <p className="mt-1 text-sm text-red-400">{errors.securityAnswer}</p>
                    )}
                  </div>

                  {/* Terms and Agreements */}
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        name="acceptTerms"
                        checked={formData.acceptTerms}
                        onChange={handleChange}
                        className="mt-1 w-4 h-4 text-green-600 bg-white/10 border-white/20 rounded focus:ring-green-500"
                      />
                      <label className="ml-3 text-sm text-green-100">
                        I accept the Terms of Service and Privacy Policy
                      </label>
                    </div>
                    {errors.acceptTerms && (
                      <p className="mt-1 text-sm text-red-400">{errors.acceptTerms}</p>
                    )}

                    <div className="flex items-start">
                      <input
                        type="checkbox"
                        name="acceptResponsibility"
                        checked={formData.acceptResponsibility}
                        onChange={handleChange}
                        className="mt-1 w-4 h-4 text-green-600 bg-white/10 border-white/20 rounded focus:ring-green-500"
                      />
                      <label className="ml-3 text-sm text-green-100">
                        I understand and accept the responsibility of superuser privileges, including complete system oversight and user management
                      </label>
                    </div>
                    {errors.acceptResponsibility && (
                      <p className="mt-1 text-sm text-red-400">{errors.acceptResponsibility}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Error Message */}
              {errors.submit && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
                    <p className="text-red-200 text-sm">{errors.submit}</p>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-3 bg-white/10 border border-white/20 rounded-lg text-white font-medium hover:bg-white/20 transition-colors"
                  >
                    Previous
                  </button>
                )}
                
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="ml-auto px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center"
                  >
                    Next
                    <Users className="w-4 h-4 ml-2" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="ml-auto px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Create Superuser Account
                        <Shield className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Security Notice */}
        <div className="text-center">
          <p className="text-xs text-green-200/60">
            🔒 This is a secure superuser registration portal. All activities are logged.
          </p>
          <Link to="/login" className="text-xs text-green-200/60 hover:text-green-200 mt-2 inline-block">
            ← Back to regular login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SuperUserSignup;
