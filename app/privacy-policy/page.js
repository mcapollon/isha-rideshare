export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-8">
        <div className="prose max-w-none">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          <p className="text-gray-600 mb-8">
            This Privacy Policy explains how Sangha Rideshare (“we,” “us,” or “our”) collects, uses, and protects user data. By using the App, you consent to the practices described in this policy.
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>Personal details (e.g., name, email address, phone number)</li>
              <li>Ride history, preferences, and communications with other users</li>
              <li>Payment information (if applicable, via third-party processors)</li>
              <li>Location data, only if manually entered or explicitly provided by the user</li>
              <li>Device and technical information for analytics and performance improvements</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>To facilitate connections between drivers and passengers</li>
              <li>To operate, maintain, and improve the functionality of the App</li>
              <li>To process payments securely and prevent fraudulent activity</li>
              <li>To enhance user safety and experience, including reviews and support services</li>
              <li>To comply with applicable legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Data Sharing &amp; Protection</h2>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>We do not sell your personal data to third parties.</li>
              <li>We may share data with trusted service providers (e.g., payment processors, cloud providers) strictly as needed.</li>
              <li>We implement reasonable technical and organizational measures to protect your data, though no method is 100% secure.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Cookies &amp; Tracking Technologies</h2>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>We may use cookies and analytics tools to enhance App performance and understand user behavior.</li>
              <li>You can manage cookie preferences through your browser settings.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. User Rights</h2>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>You may request access, correction, or deletion of your personal data by contacting us.</li>
              <li>You may opt out of location tracking by disabling related permissions in your device settings.</li>
              <li>You can opt out of marketing communications at any time.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Data Retention</h2>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>We retain data only as long as needed for the purposes outlined in this policy.</li>
              <li>Upon request, data may be deleted unless retention is required by law.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Reviews and Community Content</h2>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>Passengers may leave reviews of drivers. These may be visible to other users.</li>
              <li>We do not moderate reviews but may remove abusive or harmful content at our discretion.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Future Features</h2>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>While the App does not currently verify driver identities, we may integrate license verification in the future.</li>
              <li>Continued use of the platform may be subject to future verification requirements.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Changes to This Policy</h2>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>We may update this Privacy Policy periodically. Significant changes will be communicated through the App or by email.</li>
              <li>Continued use of the App constitutes acceptance of the revised policy.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Contact Information</h2>
            <p className="text-gray-600">
              For questions about this Privacy Policy, contact us at{' '}
              <a href="mailto:support@sangharides.com" className="text-amber-600 hover:text-amber-700">
                support@sangharides.com
              </a>
            </p>
          </section>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              Last updated: April 22, 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

