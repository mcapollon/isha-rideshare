'use client'
import Link from 'next/link';
import { Mail, ArrowRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { signIn } from 'next-auth/react';


const page = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm();

  const onSubmit = (data) => {
    signIn('resend', {
      email: data.email
    });
    
    
    // Here you would typically make an API call to register the user
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-md mx-auto px-4 py-12">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
            <p className="text-gray-600 mt-2">Join our community of travelers</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="your.email@example.com"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-500 flex items-center justify-center"
              >
                Create Account
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </div>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link href="/auth/sign-in" className="text-amber-600 hover:text-amber-500 font-medium">
                Sign in
              </Link>
            </p>
          </div>

          <div className="mt-6 border-t pt-6">
            <p className="text-xs text-gray-500 text-center">
              By creating an account, you agree to our{' '}
              <a href="/terms-of-service" className="text-blue-600 hover:underline">Terms of Service</a>{' '}
              and{' '}
              <a href="/privacy-policy" className="text-amber-600 hover:underline">Privacy Policy</a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default page;

