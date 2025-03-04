'use client'

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { addYears } from 'date-fns'
import { useForm } from "react-hook-form"
import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Label } from "@radix-ui/react-label"

export default function Page() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [uploadStatus, setUploadStatus] = useState('')
  const supabase = createClient()

  useEffect(() => {
    if (status !== 'loading' && !session) {
      redirect('/auth/sign-in')
    }
    if (session) {
      checkProfile()
    }
  }, [session, status])

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // Calculate the maximum allowed date (16 years ago from today)
  const maxDate = new Date()
  maxDate.setFullYear(maxDate.getFullYear() - 16)
  const formattedMaxDate = maxDate.toISOString().split('T')[0]

  const schema = yup.object().shape({
    name: yup.string().required('Name is required'),
    phone: yup.string().required('Phone number is required'),
    email: yup.string().email('Must be a valid email').required('Email is required'),
    location: yup.string().required('Location is required'),
    dateOfBirth: yup.date()
      .max(maxDate, 'You must be at least 16 years old')
      .required('Date of birth is required'),
    image: yup.string()
  })

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      phone: '',
      email: '',
      location: '',
      dateOfBirth: '',
      name: '',
      image: ''
    }
  })

  const checkProfile = async () => {
    const { data, error } = await supabase.schema('next_auth')
      .from('users')
      .select('*')
      .eq('id', session.user?.id)
      .single()

    if (data?.phone_number && data?.location && data?.dateOfBirth && data?.name) {
      redirect('/')
    }

    if (data) {
      setValue('phone', data.phone_number)
      setValue('email', data.email)
      setValue('location', data.location)
      setValue('dateOfBirth', data.dateOfBirth)
      setValue('name', data.name)
      setValue('image', data.image)
    }

    setLoading(false)
  }

  const onSubmit = async (formData) => {
    const { error } = await supabase.schema('next_auth')
      .from('users')
      .update({
        phone_number: formData.phone,
        email: formData.email,
        location: formData.location,
        dateOfBirth: formData.dateOfBirth,
        name: formData.name,
        image: formData.image
      })
      .eq('id', session.user?.id)

    if (!error) {
      redirect('/')
    }
  }

  const uploadProfilePicture = async (file) => {
    try {
      setUploadStatus('uploading')
      const fileExt = file.name.split('.').pop()
      const fileName = `${crypto.randomUUID()}.${fileExt}`
      const filePath = `public/${fileName}`

      const { data, error } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, file, {
          cacheControl: '3600',
        })

      if (error) {
        console.error('Error uploading image:', error)
        setUploadStatus('error')
        return
      }

      const { data: publicURL } = supabase
        .storage
        .from('profile-pictures')
        .getPublicUrl(data.path)

      setValue('image', publicURL.publicUrl)
      setUploadStatus('success')

      setTimeout(() => {
        setUploadStatus('')
      }, 3000)

    } catch (error) {
      setUploadStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Complete Your Profile
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                {!watch('image') && !session.user?.image ? (
                  <div className="w-24 h-24 my-6 rounded-full bg-gray-200 flex items-center justify-center cursor-pointer relative mx-auto">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => uploadProfilePicture(e.target.files[0])}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-full"
                    />
                    <span className="text-gray-500">Picture</span>
                  </div>
                ) : (
                  <div className="relative w-24 h-24 mx-auto my-6 group">
                    <img
                      src={watch('image') || session.user?.image}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => uploadProfilePicture(e.target.files[0])}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <span className="text-white text-sm">Change</span>
                    </div>
                  </div>
                )}
                {uploadStatus && (
                  <div className={`text-center mt-2 ${
                    uploadStatus === 'error' ? 'text-red-500' : 
                    uploadStatus === 'success' ? 'text-green-500' : 
                    'text-gray-500'
                  }`}>
                    {uploadStatus === 'uploading' && 'Uploading...'}
                    {uploadStatus === 'success' && 'Upload successful!'}
                    {uploadStatus === 'error' && 'Upload failed'}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  {...register('name')}
                  type="text"
                  autoComplete="off"
                />
                {errors.name && (
                  <p className="text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  {...register('phone')}
                  type="tel"
                  autoComplete="off"
                />
                {errors.phone && (
                  <p className="text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  {...register('email')}
                  type="email"
                  autoComplete="off"
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  {...register('location')}
                  type="text"
                  autoComplete="off"
                />
                {errors.location && (
                  <p className="text-sm text-red-600">{errors.location.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">
                  Date of Birth
                  <span className="text-sm text-gray-500 ml-2">(Must be at least 16 years old)</span>
                </Label>
                <Input
                  id="dateOfBirth"
                  {...register('dateOfBirth')}
                  type="date"
                  max={formattedMaxDate}
                  autoComplete="off"
                />
                {errors.dateOfBirth && (
                  <p className="text-sm text-red-600">{errors.dateOfBirth.message}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full bg-amber-600 hover:bg-amber-500"
              >
                Complete Profile
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
