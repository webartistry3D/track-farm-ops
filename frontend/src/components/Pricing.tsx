import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { formatCurrency } from '../utils/currency';

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  
  useEffect(() => {
    // Check if we need to scroll to pricing section from landing page
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('scroll') === 'pricing') {
      // Scroll to top of pricing page
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const plans = [
    {
      id: 'freemium',
      name: 'Free',
      emoji: '�',
      description: 'Perfect for trying out FarmOps',
      price: { monthly: 0, annual: 0 },
      features: [
        '1 farm location',
        '3 workers',
        'Basic income tracking',
        'Basic expense tracking',
        'Dashboard & Financial reports',
        'Email support'
      ],
      highlighted: false,
      popular: false
    },
    {
      id: 'growth',
      name: 'Growth',
      emoji: '🌾',
      description: 'Everything in Free, plus...',
      price: { monthly: 40000, annual: 384000 },
      features: [
        'Everything in Free, plus...',
        'Up to 20 workers',
        'Full inventory transactions',
        'Full Assets Management',
        'Dashboard & financial reports',
        'Data export (CSV / Excel)',
        'Priority email support',
        '1 - 2 farm locations',
        'Advanced analytics & trends',
        'Priority support'
      ],
      highlighted: true,
      popular: true
    },
    {
      id: 'pro',
      name: 'Mega',
      description: 'Everything in Growth, plus...',
      emoji: '🚜',
      price: { monthly: 100000, annual: 960000 },
      features: [
        '3 farm locations',
        'Up to 80 workers',
        'Priority support'
      ],
      highlighted: false,
      popular: false
    }
  ];

  const addOns = [
    {
      id: 'location',
      name: 'Extra farm location',
      emoji: '📍',
      price: '₦20,000 / month',
      description: 'Add additional farm locations to any plan'
    },
    {
      id: 'migration',
      name: 'Data migration',
      emoji: '📊',
      price: '₦100,000 – ₦300,000',
      description: 'One-time service to migrate your existing data'
    },
    {
      id: 'whatsapp',
      name: 'Dedicated WhatsApp support',
      emoji: '💬',
      price: '₦30,000 / month',
      description: 'Get priority support via WhatsApp'
    }
  ];

  const benefits = [
    {
      emoji: '🌍',
      title: 'Remote Monitoring',
      description: 'Monitor your farm from anywhere in the world'
    },
    {
      emoji: '🔍',
      title: 'Full Transparency',
      description: 'No deleted records — complete audit trail'
    },
    {
      emoji: '🇳🇬',
      title: 'Built for Nigerian farmers',
      description: 'Designed specifically for Nigerian farm realities'
    },
    {
      emoji: '📱',
      title: 'Low-End Android Support',
      description: 'Works perfectly on basic Android phones'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Header Section */}
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-poppins font-bold text-gray-900 mb-6">
            Pricing
          </h1>
          {/*<p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Track your <strong className="text-green-600">income, expenses, inventory and assets in real time</strong>,{' '}
            even when you're not on-site.
          </p>*/}
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex items-center bg-gray-100 rounded-full p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                billingCycle === 'monthly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 relative ${
                billingCycle === 'annual'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Annual
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20 max-w-7xl mx-auto items-start">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden ${
                plan.highlighted
                  ? 'ring-2 ring-green-500 ring-offset-4 transform scale-105'
                  : 'border border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-green-500 text-white px-4 py-2 rounded-bl-lg text-sm font-medium">
                  Most Popular
                </div>
              )}
              
              <div className="p-8">
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <div className="text-5xl mb-4">{plan.emoji}</div>
                  <h3 className="text-2xl font-poppins font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 font-inter mb-6">
                    {plan.description}
                  </p>
                  <div className="mb-4">
                    <span className="text-4xl font-poppins font-bold text-gray-900">
                      {formatCurrency(plan.price[billingCycle].toString())}
                    </span>
                    <span className="text-lg text-gray-600 font-normal">
                      /{billingCycle === 'monthly' ? 'month' : 'year'}
                    </span>
                  </div>
                  {billingCycle === 'annual' && (
                    <div className="text-sm text-green-600 font-medium">
                      Save {formatCurrency((plan.price.monthly * 12 - plan.price.annual).toString())} per year
                    </div>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700 font-inter">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Link
                  to="/signup"
                  className={`w-full py-3 px-6 rounded-lg font-poppins font-medium transition-all duration-200 text-center block ${
                    plan.id === 'freemium'
                      ? 'bg-green-100 text-green-700 hover:bg-green-200 border-2 border-green-300'
                      : plan.highlighted
                      ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl'
                      : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                >
                  {plan.id === 'freemium' ? 'Start Free' : 'Get Started'}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Add-Ons Section */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-poppins font-bold text-gray-900 mb-4">
              Optional Add‑Ons
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Enhance your plan with these additional features
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {addOns.map((addOn) => (
              <div
                key={addOn.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-200 text-center"
              >
                <div className="text-4xl mb-4">{addOn.emoji}</div>
                <h3 className="text-xl font-poppins font-semibold text-gray-900 mb-2">
                  {addOn.name}
                </h3>
                <p className="text-green-600 font-bold font-inter text-lg mb-3">
                  {addOn.price}
                </p>
                <p className="text-gray-600 font-inter text-sm">
                  {addOn.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* One-Time Setup */}
        {/*
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl shadow-lg p-8 mb-16 text-white">
          <h3 className="text-2xl font-poppins font-bold mb-4 text-center">
            One‑Time Setup (White‑Label)
          </h3>
          <div className="text-center mb-6">
            <div className="text-3xl font-poppins font-bold mb-2">
              ₦800,000 – ₦1,500,000
            </div>
            <div className="text-sm text-gray-500">
              ≈ $5,200 – $9,750 • £4,160 – £7,800 • €4,800 – €9,000
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-poppins font-semibold mb-3">Includes:</h4>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-white mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="font-inter">Custom branding (logo, colors, domain/subdomain)</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-white mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="font-inter">System deployment</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-white mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="font-inter">Admin & worker account setup</span>
                </li>
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-white mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="font-inter">Basic onboarding & handover</span>
                </li>
              </ul>
            </div>
            <div className="flex items-center justify-center">
              <Link 
                to="/signup" 
                className="bg-white text-green-600 py-3 px-8 rounded-lg font-poppins font-bold hover:bg-gray-100 transition-colors duration-200 text-center"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div> */}

        {/* Why Choose FarmOps */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-poppins font-bold text-gray-900 mb-4">
              Why Choose Us
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="text-center group"
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {benefit.emoji}
                </div>
                <h3 className="font-poppins font-semibold text-gray-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 font-inter leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-poppins font-bold mb-4">
            Ready to Transform Your Farm?
          </h2>
          {/*<p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Join thousands of Nigerian farmers who are already using FarmOps to grow their business
          </p>*/}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="bg-white text-green-600 px-8 py-4 rounded-lg font-poppins font-semibold hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Sign up
            </Link>
            <Link
              to="/contact"
              className="border-2 border-white text-white px-8 py-4 rounded-lg font-poppins font-semibold hover:bg-white hover:text-green-600 transition-all duration-200"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
