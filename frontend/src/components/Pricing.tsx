import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { formatCompactCurrency } from '../utils/currency';

const Pricing = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if we need to scroll to pricing section from landing page
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('scroll') === 'pricing') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const plans = [
    {
      id: 'freemium',
      name: 'Free',
      emoji: '🌱',
      description: 'Test run TrackFarmOps',
      price: { monthly: 0, annual: 0 },
      features: [
        '1 Farm, 1 Owner, 1 Manager, 1 Worker',
        'Limited Tracking & Reporting',
        //'Limited inventory transactions',
        //'Limited Assets management',
        //'Limited Financial Reports & Analytics',
        'Email support'
      ],
      highlighted: false,
      popular: false
    },
    {
      id: 'starter',
      name: 'Starter',
      emoji: '🪴',
      description: 'Everything in Free, plus...',
      price: { monthly: 10000, annual: 96000 },
      features: [
        'Full Income & Expense Tracking',
        //'Full Inventory transactions',
        'Full Tracking & Reporting',
        //'Data export (CSV / Excel)',
        'Priority email support'
      ],
      highlighted: false,
      popular: false
    },
    {
      id: 'growth',
      name: 'Growth',
      emoji: '🌾',
      description: 'Everything in Starter, plus...',
      price: { monthly: 39000, annual: 374400 },
      features: [
        '1 Farm location',
        'Up to 18 Farm managers & workers',
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
      price: { monthly: 99000, annual: 950400 },
      features: [
        '3 Farm locations',
        'Up to 75 Farm managers & workers',
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
      price: '₦24K / month',
      description: 'Add additional farm locations to any plan + up to 20 extra staff members'
    },
    {
      id: 'migration',
      name: 'Data migration',
      emoji: '📊',
      price: '₦100K – ₦300K',
      description: 'One-time service to migrate your existing data'
    },
    {
      id: 'whatsapp',
      name: 'Dedicated support',
      emoji: '💬',
      price: '₦30K / month',
      description: 'Get priority support via WhatsApp'
    }
  ];

  const benefits = [
    {
      emoji: '🌍',
      title: '24/7 Remote Monitoring',
      //description: 'Monitor your farm from anywhere in the world'
    },
    {
      emoji: '🔍',
      title: 'Full Transparency',
      //description: 'No deleted records — complete audit trail'
    },
    {
      emoji: 'nigeria-flag',
      title: 'Built for Nigerian farmers',
      //description: 'Designed specifically for Nigerian farm realities'
    },
    {
      emoji: '📱',
      title: 'Low-End Android Support',
      //description: 'Works perfectly on basic Android phones'
    }
  ];

  return (
    <div ref={root} className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Header Section */}
        <div data-pricing="header" className="text-center mb-20">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-jetbrains-mono font-bold text-gray-900 mb-6">
            Pricing
          </h1>
          {/*<p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Track your <strong className="text-emerald-600">income, expenses, inventory and assets in real time</strong>,{' '}
            even when you're not on-site.
          </p>*/}
        </div>

        {/* Billing Toggle */}
        <div data-pricing="toggle" className="flex justify-center mb-12">
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
              <span className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Plans */}
        <div data-pricing="plans" className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-20 max-w-4xl mx-auto items-start">
          {plans.map((plan) => (
            <div
              key={plan.id}
              data-pricing="plan"
              className={`relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden ${
                plan.highlighted
                  ? 'ring-2 ring-emerald-500 ring-offset-4 transform scale-105'
                  : 'border border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-emerald-500 text-white px-4 py-2 rounded-bl-lg text-sm font-medium">
                  Most Popular
                </div>
              )}
              
              <div className="flex flex-col p-8">
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <div className="text-5xl mb-4">{plan.emoji}</div>
                  <h3 className="text-2xl font-jetbrains-mono font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 font-inter mb-6">
                    {plan.description}
                  </p>
                </div>

                {/* Features */}
                <ul className="mb-8 space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <div className="flex-shrink-0 w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700 font-inter">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Pricing Amount */}
                <div className="text-center mb-6">
                  <div className="mb-2">
                    <span className="text-4xl font-jetbrains-mono font-bold text-gray-900">
                      {formatCompactCurrency(plan.price[billingCycle])}
                    </span>
                    <span className="text-lg text-gray-600 font-normal">
                      /{billingCycle === 'monthly' ? 'month' : 'year'}
                    </span>
                  </div>
                  {billingCycle === 'annual' && (
                    <div className="text-sm text-emerald-600 font-medium">
                      Save {formatCompactCurrency(plan.price.monthly * 12 - plan.price.annual)} per year
                    </div>
                  )}
                </div>

                {/* Payment Methods */}
                <div className="flex flex-wrap justify-center gap-2 mb-4 text-xs text-gray-600 dark:text-gray-400">
                  {/* <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded">Bank Transfer</span> */}
                  {/* <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded">Paystack</span> */}
                </div>

                {/* CTA Button */}
                <Link
                  to="/signup"
                  className={`w-full py-3 px-6 rounded-lg font-jetbrains-mono font-medium transition-all duration-200 text-center block ${
                    plan.id === 'freemium'
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-2 border-emerald-300'
                      : plan.highlighted
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg hover:shadow-xl'
                      : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-2 border-emerald-300'
                  }`}
                >
                  {plan.id === 'freemium' ? 'Start Free' : 'Choose Plan'}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Add-Ons Section */}
        <div data-pricing="addons" className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-jetbrains-mono font-bold text-gray-900 mb-4">
              Optional Add‑Ons
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Enhance your plan with these additional features
            </p>
          </div>
          
          <div data-pricing="addons-grid" className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {addOns.map((addOn) => (
              <div
                key={addOn.id}
                data-pricing="addon"
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-200 text-center"
              >
                <div className="text-4xl mb-4">{addOn.emoji}</div>
                <h3 className="text-xl font-jetbrains-mono font-semibold text-gray-900 mb-2">
                  {addOn.name}
                </h3>
                <p className="text-emerald-600 font-bold font-inter text-lg mb-3">
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
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl shadow-lg p-8 mb-16 text-white">
          <h3 className="text-2xl font-jetbrains-mono font-bold mb-4 text-center">
            One‑Time Setup (White‑Label)
          </h3>
          <div className="text-center mb-6">
            <div className="text-3xl font-jetbrains-mono font-bold mb-2">
              ₦800,000 – ₦1,500,000
            </div>
            <div className="text-sm text-gray-500">
              ≈ $5,200 – $9,750 • £4,160 – £7,800 • €4,800 – €9,000
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-jetbrains-mono font-semibold mb-3">Includes:</h4>
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
                className="bg-white text-emerald-600 py-3 px-8 rounded-lg font-jetbrains-mono font-bold hover:bg-gray-100 transition-colors duration-200 text-center"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div> */}

        {/* Why Choose FarmOps */}
        <div data-pricing="benefits" className="mb-2">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-jetbrains-mono font-bold text-gray-900 mb-4">
              Why Choose TrackFarmOps?
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                data-pricing="benefit"
                className="text-center group"
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {benefit.emoji === 'nigeria-flag' ? (
                    <svg className="w-16 h-12 mx-auto rounded-md shadow-sm" viewBox="0 0 6 4" xmlns="http://www.w3.org/2000/svg">
                      <rect width="2" height="4" fill="#008751"/>
                      <rect x="2" width="2" height="4" fill="#FFFFFF"/>
                      <rect x="4" width="2" height="4" fill="#008751"/>
                    </svg>
                  ) : (
                    benefit.emoji
                  )}
                </div>
                <h3 className="font-jetbrains-mono font-semibold text-gray-900 mb-2">
                  {benefit.title}
                </h3>
                {/*<p className="text-gray-600 font-inter leading-relaxed">
                  {benefit.description}
                </p>*/}
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        {/*
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-6 text-center text-white max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-jetbrains-mono font-bold mb-4">
            Ready to Transform Your Farm?
          </h2>
          {/*<p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            Join thousands of Nigerian farmers who are already using FarmOps to grow their business
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/signup"
              className="bg-white text-emerald-600 px-8 py-4 rounded-lg font-jetbrains-mono font-semibold hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Contact Sales
            </Link>
          </div>
        </div>
        */}

      </div>

      <img src="/footer4.png" alt="" className="h-200 w-1200 object-cover object-bottom" />
    </div>
  );
};

export default Pricing;
