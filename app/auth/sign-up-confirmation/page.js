import React from 'react';
import Link from 'next/link';
import { CheckCircle, ArrowRight, Mail, Shield, User } from 'lucide-react';

const page = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Account Created!</h1>
            <p className="text-gray-600 mt-2">Welcome to the Poparide community</p>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-50 rounded-lg p-6">
              <h2 className="font-semibold text-lg mb-4">Next Steps</h2>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <Mail className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Verify your email address</p>
                    <p className="text-sm text-gray-600">We've sent a verification link to your email</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <User className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Complete your profile</p>
                    <p className="text-sm text-gray-600">Add a profile photo and more details about yourself</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Verify your identity</p>
                    <p className="text-sm text-gray-600">For safety, we verify all members of our community</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="border rounded-lg p-6">
              <h2 className="font-semibold text-lg mb-4">Your Account Details</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">John Doe</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">john.doe@example.com</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-medium">{new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col space-y-3">
              <Link 
                href="/dashboard/profile" 
                className="w-full bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-700 flex items-center justify-center"
              >
                Complete Your Profile
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link 
                href="/" 
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 flex items-center justify-center"
              >
                Explore Available Rides
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            Need help? <a href="#" className="text-blue-600 hover:underline">Contact our support team</a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default page;