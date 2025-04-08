'use client'

export default function Page() {
  return (
    <div className="min-h-screen bg-[#d9cebc] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <img
              src="/profilepic.jpeg"
              alt="Mckinsley Apollon"
              className="w-32 h-32 rounded-full mx-auto mb-4 object-cover"
            />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Mckinsley Apollon
            </h1>
            <p className="text-lg text-gray-600">
              Creator - Isha RideShare
            </p>
          </div>

          <div className="prose max-w-none">
            <p className="text-gray-600 mb-6">
              As the lead developer of Isha RideShare, I&apos;m passionate about creating technology that serves the Isha community. This platform was developed to help practitioners connect and share rides to various Isha centers, making spiritual journeys more accessible and environmentally conscious.
            </p>

            <div className="border-t border-gray-200 pt-6 mt-6">
              <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
              <ul className="space-y-2 text-gray-600">
                <li>Email: mckinsleyapollon@hotmail.com</li>
                <li>Address: 4120 rue de la martinière, Terrebonne, QC, Canada</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
