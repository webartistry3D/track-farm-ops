import { Link } from 'react-router-dom';
import Navigation from './Navigation';

const Terms = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-poppins font-bold mb-4">
              Terms of Service
            </h1>
            <p className="text-xl font-inter max-w-3xl mx-auto">
              Please read these terms carefully before using TrackFarmOps services.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="prose prose-green max-w-none">
            <div className="mb-8">
              <p className="text-gray-600 font-inter">
                <strong>Last updated:</strong> January 1, 2024
              </p>
              <p className="text-gray-600 font-inter mt-4">
                Welcome to TrackFarmOps. These Terms of Service ("Terms") govern your use of our farm 
                management platform and related services. By accessing or using TrackFarmOps, you agree 
                to be bound by these Terms.
              </p>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-poppins font-semibold text-gray-900 mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-600 font-inter">
                By creating an account and using TrackFarmOps, you acknowledge that you have read, understood, 
                and agree to be bound by these Terms, including our Privacy Policy. If you do not agree 
                to these Terms, you may not use our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-poppins font-semibold text-gray-900 mb-4">
                2. Description of Services
              </h2>
              <p className="text-gray-600 font-inter mb-4">
                TrackFarmOps provides a comprehensive farm management platform that includes:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 font-inter">
                <li>Income and expense tracking</li>
                <li>Inventory management</li>
                <li>Worker management and payroll</li>
                <li>Crop and yield monitoring</li>
                <li>Financial reporting and analytics</li>
                <li>Multi-user access controls</li>
                <li>Data backup and security</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-poppins font-semibold text-gray-900 mb-4">
                3. Account Registration and Security
              </h2>
              
              <h3 className="text-xl font-poppins font-medium text-gray-800 mb-3">
                Account Responsibilities
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 font-inter">
                <li>You must provide accurate, complete, and current information</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                <li>You are responsible for all activities that occur under your account</li>
                <li>You must notify us immediately of any unauthorized use of your account</li>
                <li>You must be at least 18 years old to create an account</li>
              </ul>

              <h3 className="text-xl font-poppins font-medium text-gray-800 mb-3 mt-6">
                Account Suspension
              </h3>
              <p className="text-gray-600 font-inter">
                We reserve the right to suspend or terminate accounts that violate these Terms or 
                engage in fraudulent activities.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-poppins font-semibold text-gray-900 mb-4">
                4. Subscription Plans and Payment
              </h2>
              
              <h3 className="text-xl font-poppins font-medium text-gray-800 mb-3">
                Subscription Fees
              </h3>
              <p className="text-gray-600 font-inter mb-4">
                TrackFarmOps offers various subscription plans with different features and pricing:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 font-inter">
                <li><strong>Growth Plan:</strong> ₦30,000 per month</li>
                <li><strong>Pro Plan:</strong> ₦100,000 per month</li>
                <li><strong>Add-ons:</strong> Additional features available for extra fees</li>
              </ul>

              <h3 className="text-xl font-poppins font-medium text-gray-800 mb-3 mt-6">
                Payment Terms
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 font-inter">
                <li>Payments are processed monthly in advance</li>
                <li>We accept bank transfers, credit cards, and mobile money</li>
                <li>All fees are non-refundable except as required by law</li>
                <li>Prices are subject to change with 30 days notice</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-poppins font-semibold text-gray-900 mb-4">
                5. User Responsibilities
              </h2>
              
              <h3 className="text-xl font-poppins font-medium text-gray-800 mb-3">
                Prohibited Activities
              </h3>
              <p className="text-gray-600 font-inter mb-4">
                You agree not to use TrackFarmOps for any of the following purposes:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 font-inter">
                <li>Violating any applicable laws or regulations</li>
                <li>Providing false or misleading information</li>
                <li>Interfering with or disrupting our services</li>
                <li>Attempting to gain unauthorized access to our systems</li>
                <li>Using the service for fraudulent or illegal activities</li>
                <li>Sharing account credentials with unauthorized users</li>
                <li>Uploading malicious code or viruses</li>
              </ul>

              <h3 className="text-xl font-poppins font-medium text-gray-800 mb-3 mt-6">
                Data Accuracy
              </h3>
              <p className="text-gray-600 font-inter">
                You are responsible for ensuring the accuracy and completeness of the data you 
                enter into TrackFarmOps. We are not responsible for errors in your data or decisions 
                made based on your data.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-poppins font-semibold text-gray-900 mb-4">
                6. Intellectual Property
              </h2>
              
              <h3 className="text-xl font-poppins font-medium text-gray-800 mb-3">
                FarmOps Intellectual Property
              </h3>
              <p className="text-gray-600 font-inter">
                FarmOps and all related content, features, and functionality are owned by FarmOps 
                and are protected by copyright, trademark, and other intellectual property laws.
              </p>

              <h3 className="text-xl font-poppins font-medium text-gray-800 mb-3 mt-6">
                User Data
              </h3>
              <p className="text-gray-600 font-inter">
                You retain ownership of all data you input into FarmOps. You grant us a license to 
                use, process, and store your data solely to provide our services to you.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-poppins font-semibold text-gray-900 mb-4">
                7. Privacy and Data Protection
              </h2>
              <p className="text-gray-600 font-inter">
                Your privacy is important to us. Our collection, use, and protection of your 
                information is governed by our Privacy Policy, which is incorporated into these 
                Terms by reference.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-poppins font-semibold text-gray-900 mb-4">
                8. Service Availability and Support
              </h2>
              
              <h3 className="text-xl font-poppins font-medium text-gray-800 mb-3">
                Service Availability
              </h3>
              <p className="text-gray-600 font-inter">
                We strive to maintain high service availability but cannot guarantee 100% uptime. 
                We may schedule maintenance periods with advance notice when possible.
              </p>

              <h3 className="text-xl font-poppins font-medium text-gray-800 mb-3 mt-6">
                Customer Support
              </h3>
              <p className="text-gray-600 font-inter">
                Customer support is available via email, phone, and WhatsApp during business hours 
                (Monday-Friday, 8am-6pm). Response times may vary based on inquiry complexity.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-poppins font-semibold text-gray-900 mb-4">
                9. Disclaimers and Limitations
              </h2>
              
              <h3 className="text-xl font-poppins font-medium text-gray-800 mb-3">
                Service Disclaimer
              </h3>
              <p className="text-gray-600 font-inter">
                FarmOps is provided "as is" without warranties of any kind. We do not guarantee that 
                the service will be error-free, uninterrupted, or meet your specific requirements.
              </p>

              <h3 className="text-xl font-poppins font-medium text-gray-800 mb-3 mt-6">
                Limitation of Liability
              </h3>
              <p className="text-gray-600 font-inter">
                To the maximum extent permitted by law, FarmOps shall not be liable for any indirect, 
                incidental, special, or consequential damages arising from your use of our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-poppins font-semibold text-gray-900 mb-4">
                10. Termination
              </h2>
              
              <h3 className="text-xl font-poppins font-medium text-gray-800 mb-3">
                Termination by User
              </h3>
              <p className="text-gray-600 font-inter">
                You may terminate your account at any time by contacting our support team or using 
                the account deletion feature in your settings.
              </p>

              <h3 className="text-xl font-poppins font-medium text-gray-800 mb-3 mt-6">
                Termination by FarmOps
              </h3>
              <p className="text-gray-600 font-inter">
                We may terminate or suspend your account immediately for violations of these Terms, 
                fraudulent activities, or non-payment of fees.
              </p>

              <h3 className="text-xl font-poppins font-medium text-gray-800 mb-3 mt-6">
                Effect of Termination
              </h3>
              <p className="text-gray-600 font-inter">
                Upon termination, your access to the service will cease, and we may delete your 
                data after a reasonable retention period, unless required by law to retain it.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-poppins font-semibold text-gray-900 mb-4">
                11. Governing Law and Dispute Resolution
              </h2>
              <p className="text-gray-600 font-inter mb-4">
                These Terms are governed by the laws of the Federal Republic of Nigeria. Any disputes 
                arising from these Terms shall be resolved through:
              </p>
              <ol className="list-decimal pl-6 space-y-2 text-gray-600 font-inter">
                <li>Negotiation between the parties</li>
                <li>Mediation through a mutually agreed mediator</li>
                <li>Arbitration in Lagos, Nigeria</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-poppins font-semibold text-gray-900 mb-4">
                12. Changes to Terms
              </h2>
              <p className="text-gray-600 font-inter">
                We may modify these Terms from time to time. We will notify you of any material 
                changes by posting the updated Terms on our platform and sending you an email 
                notification at least 30 days before the changes take effect.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-poppins font-semibold text-gray-900 mb-4">
                13. Contact Information
              </h2>
              <p className="text-gray-600 font-inter mb-4">
                If you have any questions about these Terms, please contact us:
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-600 font-inter">
                  <strong>Email:</strong> legal@farmops.ng<br />
                  <strong>Phone:</strong> +234 800 123 4567<br />
                  <strong>Address:</strong> 123 Farm Road, Ikeja, Lagos, Nigeria
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-poppins font-semibold text-gray-900 mb-4">
                14. General Provisions
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 font-inter">
                <li><strong>Entire Agreement:</strong> These Terms constitute the entire agreement between you and FarmOps</li>
                <li><strong>Severability:</strong> If any provision is invalid, the remaining provisions remain in effect</li>
                <li><strong>Waiver:</strong> Failure to enforce any provision does not constitute a waiver</li>
                <li><strong>Assignment:</strong> You may not assign your rights without our written consent</li>
                <li><strong>Notices:</strong> All notices will be sent to your registered email address</li>
              </ul>
            </section>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <p className="text-gray-600 font-inter text-sm">
                © 2024 FarmOps. All rights reserved.
              </p>
              <div className="flex gap-4">
                <Link 
                  to="/privacy"
                  className="text-green-600 hover:text-green-700 font-inter text-sm"
                >
                  Privacy Policy
                </Link>
                <Link 
                  to="/contact"
                  className="text-green-600 hover:text-green-700 font-inter text-sm"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
