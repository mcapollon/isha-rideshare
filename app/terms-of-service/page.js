
export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm p-8">
        <div className="prose max-w-none">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
            <p className="text-gray-600">
              Welcome to Isha Rideshare ("the App"), a rideshare/carpool platform designed to connect drivers 
              and passengers for shared travel. By using our services, you agree to abide by these Terms of 
              Service. If you do not agree, please do not use the App.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. User Eligibility</h2>
            <p className="text-gray-600 mb-3">To use the App, you must:</p>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>Be at least 18 years old</li>
              <li>Provide accurate and truthful information</li>
              <li>Abide by all applicable laws and regulations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. User Responsibilities</h2>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>Drivers must possess a valid driver's license and necessary insurance</li>
              <li>Passengers and drivers are responsible for their own safety and behavior during rides</li>
              <li>Users must communicate clearly and respect agreed-upon ride terms</li>
              <li>Illegal, fraudulent, or harmful activities are strictly prohibited</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Payment & Fees</h2>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>Payments, if applicable, are handled through a third-party provider</li>
              <li>The App does not guarantee refunds for missed or canceled rides unless specified in a refund policy</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Limitation of Liability</h2>
            <ul className="list-disc pl-5 text-gray-600 space-y-2">
              <li>The App only facilitates connections between users and does not verify the background, behavior, or identity of users</li>
              <li>We are not liable for any accidents, damages, disputes, or losses arising from rides arranged through the App</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Termination</h2>
            <p className="text-gray-600">
              We reserve the right to suspend or terminate accounts that violate these Terms or engage in harmful activities.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Changes to Terms</h2>
            <p className="text-gray-600">
              We may update these Terms at any time. Continued use of the App signifies acceptance of the updated Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Contact Information</h2>
            <p className="text-gray-600">
              For questions about these Terms of Service, contact us at{' '}
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
