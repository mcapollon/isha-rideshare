'use client'

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"

export default function page() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [uploadStatus, setUploadStatus] = useState('');
  const [profileData, setProfileData] = useState({
    phone: '+1 (403) 555-0123',
    email: 'john.doe@example.com',
    location: 'Calgary, AB',
    dateOfBirth: 'April 15, 1999'
  });
  const supabase = createClient()

  useEffect(() => {
    if (!session) {
      redirect("/api/auth/sign-in")
    }

    checkProfile()
  }, [session])

  const checkProfile = async () => {
    const { data, error } = await supabase.schema('next_auth')
      .from('users')
      .select('phone_number, location, dateOfBirth, name')
      .eq('id', session.user?.id)
      .single()

    if (data?.phone_number && data?.location && data?.dateOfBirth && data?.name) {
      // If profile is complete, redirect to home
      redirect('/')
    }
    setLoading(false)
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)

    const { error } = await supabase.schema('next_auth')
      .from('users')
      .update({
        phone_number: profileData.phone,
        email: profileData.email,
        location: profileData.location,
        dateOfBirth: profileData.dateOfBirth,
        image: profileData.image
    })
      .eq('id', session.user?.id)

    if (!error) {
      redirect('/')
    }
  }

  const uploadProfilePicture = async (file) => {
    try {
        const fileExt = file.name.split('.').pop()
        const fileName = `${crypto.randomUUID()}.${fileExt}`
        const filePath = `public/${fileName}`

        console.log(filePath, 'file path')

        // Upload the file to Supabase storage
        const { data, error } = await supabase.storage
            .from('profile-pictures')
            .upload(filePath, file, {
                cacheControl: '3600',
            })

            if (error) {
                console.error('Error uploading image:', error)
                setUploadStatus('error'); // Set status to error
                return
            }

        console.log(data.path, 'image data')
        // Get the public URL
        const { data: publicURL } = supabase
            .storage
            .from('profile-pictures')
            .getPublicUrl(data.path)

        // Update profile data with new image URL
        setProfileData({ ...profileData, image: publicURL.publicUrl })
        setUploadStatus('success');
        console.log(publicURL, '    profile image')

        setTimeout(() => {
            setUploadStatus('');
        }, 3000);

    } catch (error) {
        console.error('Error in upload:', error)
        setUploadStatus('error');
    }
}

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Complete Your Profile
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleProfileSubmit}>

          <div>
              {!profileData.image ? (
                <>
                  <div className="w-24 h-24 my-6 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer relative">
                    {uploadStatus === 'uploading' ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                        <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                    ) : uploadStatus === 'success' ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-green-500 bg-opacity-50 rounded-full">
                        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                    ) : uploadStatus === 'error' ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-red-500 bg-opacity-50 rounded-full">
                        <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </div>
                    ) : (
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => { uploadProfilePicture(e.target.files[0]) }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-full"
                        />
                        <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer">
                          <span className="text-gray-500">Picture</span>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <img
                  src={profileData.image || session.user?.image}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover"
                />
              )}
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
               Full Name
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="mt-1">
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <div className="mt-1">
                <input
                  id="location"
                  name="location"
                  type="text"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                Date of Birth
              </label>
              <div className="mt-1">
                <input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  min={new Date(new Date().setFullYear(new Date().getFullYear() - 16)).toISOString().split('T')[0]}
                  type="date"
                  required
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Complete Profile
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}