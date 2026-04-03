import { Link } from 'react-router-dom';
import Navigation from './Navigation';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-poppins font-bold mb-4">
              Privacy Policy
            </h1>
            <p className="text-xl font-inter max-w-3xl mx-auto">
              Learn how we collect, use, and protect your information.
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
                TrackFarmOps ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
                explains how we collect, use, disclose, and safeguard your information when you use our 
                farm management platform and related services.
              </p>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-poppins font-semibold text-gray-900 mb-4">
                1. Information We Collect
              </h2>
              
              <h3 className="text-xl font-poppins font-medium text-gray-800 mb-3">
                Personal Information
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 font-inter">
                <li>Name, email address, phone number</li>
                <li>Farm name and location details</li>
                <li>Payment and billing information</li>
                <li>Government identification (for verification)</li>
              </ul>

              <h3 className="text-xl font-poppins font-medium text-gray-800 mb-3 mt-6">
                Farm Data
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 font-inter">
                <li>Crop information and yields</li>
                <li>Financial records (income, expenses)</li>
                <li>Inventory and equipment details</li>
                <li>Worker information and payroll data</li>
                <li>Operational activities and transactions</li>
              </ul>

              <h3 className="text-xl font-poppins font-medium text-gray-800 mb-3 mt-6">
                Technical Information
              </h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 font-inter">
                <li>IP address and device information</li>
                <li>Browser type and operating system</li>
                <li>Usage patterns and app interactions</li>
                <li>Location data (with your consent)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-poppins font-semibold text-gray-900 mb-4">
                2. How We Use Your Information
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 font-inter">
                <li><strong>Service Provision:</strong> To provide and maintain our farm management services</li>
                <li><strong>Account Management:</strong> To create and manage your TrackFarmOps account</li>
                <li><strong>Customer Support:</strong> To respond to your inquiries and provide technical assistance</li>
                <li><strong>Improvement:</strong> To analyze usage patterns and improve our services</li>
                <li><strong>Security:</strong> To detect fraud and maintain platform security</li>
                <li><strong>Legal Compliance:</strong> To comply with applicable laws and regulations</li>
                <li><strong>Communication:</strong> To send you important updates about your account and services</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-poppins font-semibold text-gray-900 mb-4">
                3. Information Sharing
              </h2>
              
              <h3 className="text-xl font-poppins font-medium text-gray-800 mb-3">
                We Do Not Sell Your Data
              </h3>
              <p className="text-gray-600 font-inter">
                TrackFarmOps never sells your personal information or farm data to third parties. Your data is yours.
              </p>

              <h3 className="text-xl font-poppins font-medium text-gray-800 mb-3 mt-6">
                Limited Sharing
              </h3>
              <p className="text-gray-600 font-inter mb-4">
                We may share your information only in the following circumstances:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 font-inter">
                <li><strong>Service Providers:</strong> With trusted third-party service providers who help us operate our platform (payment processors, cloud services, etc.)</li>
                <li><strong>Legal Requirements:</strong> When required by law, court order, or government regulation</li>
                <li><strong>Business Transfers:</strong> In connection with mergers, acquisitions, or sales of business assets</li>
                <li><strong>With Your Consent:</strong> When you explicitly authorize us to share specific information</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-poppins font-semibold text-gray-900 mb-4">
                4. Data Security
              </h2>
              <p className="text-gray-600 font-inter mb-4">
                We implement industry-standard security measures to protect your information:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 font-inter">
                <li><strong>Encryption:</strong> All data is encrypted using AES-256 encryption</li>
                <li><strong>Secure Transmission:</strong> HTTPS/TLS protocols for all data transmissions</li>
                <li><strong>Access Controls:</strong> Strict access controls and authentication systems</li>
                <li><strong>Regular Audits:</strong> Regular security audits and vulnerability assessments</li>
                <li><strong>Backup Systems:</strong> Secure backup systems with redundancy</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-poppins font-semibold text-gray-900 mb-4">
                5. Your Rights
              </h2>
              <p className="text-gray-600 font-inter mb-4">
                You have the following rights regarding your personal information:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 font-inter">
                <li><strong>Access:</strong> Request access to your personal information</li>
                <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Portability:</strong> Request transfer of your data to another service</li>
                <li><strong>Objection:</strong> Object to certain uses of your information</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-poppins font-semibold text-gray-900 mb-4">
                6. Data Retention
              </h2>
              <p className="text-gray-600 font-inter">
                We retain your information only as long as necessary to provide our services and comply 
                with legal obligations. You can request deletion of your account and associated data at any time.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-poppins font-semibold text-gray-900 mb-4">
                7. Cookies and Tracking
              </h2>
              <p className="text-gray-600 font-inter mb-4">
                We use cookies and similar technologies to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 font-inter">
                <li>Remember your preferences and login status</li>
                <li>Analyze app usage and performance</li>
                <li>Provide personalized features</li>
                <li>Ensure security and prevent fraud</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-poppins font-semibold text-gray-900 mb-4">
                8. Children's Privacy
              </h2>
              <p className="text-gray-600 font-inter">
                TrackFarmOps is not intended for children under 18 years of age. We do not knowingly collect 
                personal information from children under 18. If we become aware that we have collected 
                such information, we will take steps to delete it immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-poppins font-semibold text-gray-900 mb-4">
                9. International Data Transfers
              </h2>
              <p className="text-gray-600 font-inter">
                Your data is stored primarily in Nigeria. Any international transfers of data are conducted 
                in accordance with applicable data protection laws and with appropriate safeguards in place.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-poppins font-semibold text-gray-900 mb-4">
                10. Changes to This Policy
              </h2>
              <p className="text-gray-600 font-inter">
                We may update this Privacy Policy from time to time. We will notify you of any significant 
                changes by posting the new policy on our platform and sending you an email notification.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-poppins font-semibold text-gray-900 mb-4">
                11. Contact Us
              </h2>
              <p className="text-gray-600 font-inter mb-4">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-600 font-inter">
                  <strong>Email:</strong> privacy@farmops.ng<br />
                  <strong>Phone:</strong> +234 800 123 4567<br />
                  <strong>Address:</strong> 123 Farm Road, Ikeja, Lagos, Nigeria
                </p>
              </div>
            </section>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
              <p className="text-gray-600 font-inter text-sm">
                © 2026 TrackFarmOps. All rights reserved.
              </p>
              <div className="flex gap-4">
                <Link 
                  to="/terms"
                  className="text-green-600 hover:text-green-700 font-inter text-sm"
                >
                  Terms of Service
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

export default Privacy;
