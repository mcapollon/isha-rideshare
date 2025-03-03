
export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-8">
        <div className="prose max-w-none">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-600">
              This Privacy Policy explains how Isha Rideshare ("we," "us," or "our") collects, uses, and protects user data. 
              By using the App, you consent to this policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
            <p className="text-gray-600 mb-3">We may collect the following information:</p>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>Personal details (name, email, phone number)</li>
              <li>Ride history and preferences</li>
              <li>Payment information (if applicable)</li>
              <li>Location data (with user consent)</li>
              <li>Device information and analytics</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
            <p className="text-gray-600 mb-3">We use your data to:</p>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>Facilitate connections between drivers and passengers</li>
              <li>Improve user experience and enhance safety</li>
              <li>Process payments and prevent fraud</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Data Sharing & Protection</h2>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>We do not sell personal data to third parties</li>
              <li>Data may be shared with trusted service providers (e.g., payment processors) as needed</li>
              <li>We implement security measures to protect your data but cannot guarantee absolute security</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Cookies & Tracking Technologies</h2>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>We may use cookies and analytics tools to enhance the App's functionality</li>
              <li>Users can control cookie settings in their browser preferences</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. User Rights</h2>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>Users may request access, correction, or deletion of their personal data</li>
              <li>Location tracking can be disabled via device settings</li>
              <li>Users can opt out of marketing communications</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Data Retention</h2>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>We retain user data as long as necessary to fulfill the purposes outlined in this policy</li>
              <li>Data may be deleted upon user request, subject to legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Changes to this Policy</h2>
            <p className="text-gray-600">
              We may update this Privacy Policy from time to time. Significant changes will be communicated to users.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Contact Information</h2>
            <p className="text-gray-600">
              For questions about this Privacy Policy, contact us at{' '}
              <a href="mailto:support@isharideshare.com" className="text-amber-600 hover:text-amber-700">
                support@isharideshare.com
              </a>
            </p>
          </section>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

