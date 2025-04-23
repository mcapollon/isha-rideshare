export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-8">
        <div className="prose max-w-none">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          <p className="text-gray-600 mb-8">
            Welcome to Sangha Rideshare (“the App”), a platform designed to connect drivers and passengers for pre-arranged, shared travel. By using our services, you agree to abide by these Terms of Service. If you do not agree, please do not use the App.
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. User Eligibility</h2>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>You must be at least 18 years old.</li>
              <li>You must provide accurate, complete, and truthful information.</li>
              <li>You must comply with all applicable laws and regulations.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. User Responsibilities</h2>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>Drivers must possess a valid driver’s license and any legally required insurance.</li>
              <li>Passengers and drivers are fully responsible for their safety, behavior, and adherence to agreed-upon ride terms.</li>
              <li>The App is not responsible for monitoring or enforcing user behavior.</li>
              <li>Users must not engage in illegal, fraudulent, or harmful activities through the platform.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Community Guidelines &amp; Conduct</h2>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>Users should cancel rides with reasonable notice. Frequent no-shows or last-minute cancellations may result in account warnings or suspension.</li>
              <li>Timely communication is expected between drivers and passengers regarding delays or changes.</li>
              <li>Passengers may review drivers after completed rides. Reviews are public and may affect a user’s continued access to the platform.</li>
              <li>Misuse of the platform, safety complaints, or repeat misconduct may lead to account termination at our discretion.</li>
              <li>Users may report issues via <a href="mailto:support@sangharides.com" className="text-amber-600 hover:text-amber-700">support@sangharides.com</a>. While we are not responsible for disputes, we may review patterns of abuse.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Payment &amp; Fees</h2>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>Payments may be made via third-party processors integrated into the App or directly between users (e.g., in cash).</li>
              <li>Sangha Rideshare does not manage, guarantee, or refund direct cash transactions.</li>
              <li>All payment disputes must be resolved between the users unless explicitly governed by a published refund policy.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Verification and Future Services</h2>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>As of now, we do not conduct background checks or driver verification.</li>
              <li>We plan to introduce third-party driver’s license verification in the future. Use of those services may be required for continued use as a driver.</li>
              <li>The App is not responsible for the identity, background, or conduct of users.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Limitation of Liability</h2>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>Sangha Rideshare facilitates connections but is not involved in actual transportation.</li>
              <li>We are not liable for any accidents, injuries, losses, damages, or disputes arising from rides.</li>
              <li>The App provides no warranties regarding the safety, punctuality, or quality of the rides arranged.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Termination</h2>
            <p className="text-gray-600">
              We may suspend or terminate your account for violating these Terms or engaging in behavior we deem harmful or disruptive.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Changes to Terms</h2>
            <p className="text-gray-600">
              We may update these Terms of Service at any time. Continued use of the App constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Contact Information</h2>
            <p className="text-gray-600">
              For questions about these Terms of Service, contact us at{' '}
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
