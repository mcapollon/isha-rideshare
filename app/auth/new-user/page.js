'use client'

import { useSession, signOut, update } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { addYears } from 'date-fns'
import { useForm, Controller } from "react-hook-form" // Add Controller import
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@radix-ui/react-label"
import Autocomplete from "react-google-autocomplete" // Import Autocomplete
import { Search } from "lucide-react" // Import Search icon

export default function Page() {
  const { data: session, status, update } = useSession()
  const [loading, setLoading] = useState(true)
  const [uploadStatus, setUploadStatus] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const supabase = createClient()
  
  const router = useRouter();  
  // Calculate the maximum allowed date (16 years ago from today)
  const maxDate = new Date()
  maxDate.setFullYear(maxDate.getFullYear() - 16)
  const formattedMaxDate = maxDate.toISOString().split('T')[0]

  const { register, handleSubmit, setValue, watch, formState: { errors }, control } = useForm({
    defaultValues: {
      phone: '',
      email: '',
      location: '',
      dateOfBirth: '',
      name: '',
      image: '',
      sex: ''
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
      setValue('sex', data.sex) // Prefill sex if available
    }

    setLoading(false)
  }

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

  const onSubmit = async (formData) => {
    setFormLoading(true)
    setFormError('')
    try {
      const { error } = await supabase.schema('next_auth')
        .from('users')
        .update({
          phone_number: formData.phone,
          email: formData.email,
          location: formData.location,
          dateOfBirth: formData.dateOfBirth,
          name: formData.name,
          image: formData.image,
          sex: formData.sex
        })
        .eq('id', session.user?.id)

      if (!error) {
        router.push('/')
      } else {
        setFormError('Failed to update profile. Please try again.')
        // console.log(error)
      }
    } catch (err) {
      setFormError('An unexpected error occurred. Please try again.')
      // console.log(err)
    } finally {
      setFormLoading(false)
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

      await update({
        ...session,
        user: {
          ...session.user,
          image: publicURL.publicUrl
        }
      });

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
                  {...register('name', { required: 'Name is required' })}
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
                  {...register('phone', { required: 'Phone number is required' })}
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
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Must be a valid email'
                    }
                  })}
                  type="email"
                  autoComplete="off"
                />
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black/40" />
                  <Controller
                    name="location"
                    control={control}
                    rules={{ required: 'Location is required' }}
                    render={({ field }) => (
                      <Autocomplete
                        {...field}
                        value={field.value || ''}
                        placeholder="Please enter a city"
                        apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS}
                        onPlaceSelected={(place) => {
                          if (place && place.address_components) {
                            const cityName = place.address_components[0].long_name;
                            setValue('location', cityName);
                          }
                        }}
                        onChange={(e) => {
                          field.onChange(e);
                          if (e.target.value === '') {
                            setValue('location', '');
                          }
                        }}
                        className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                        options={{
                          types: ['locality'],
                        }}
                      />
                    )}
                  />
                </div>
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
                  {...register('dateOfBirth', {
                    required: 'Date of birth is required',
                    validate: value => {
                      if (!value) return 'Date of birth is required';
                      const minDate = new Date();
                      minDate.setFullYear(minDate.getFullYear() - 16);
                      if (new Date(value) > minDate) {
                        return 'You must be at least 16 years old';
                      }
                      return true;
                    }
                  })}
                  type="date"
                  max={formattedMaxDate}
                  autoComplete="off"
                />
                {errors.dateOfBirth && (
                  <p className="text-sm text-red-600">{errors.dateOfBirth.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sex">Sex</Label>
                <select
                  id="sex"
                  {...register('sex', { required: 'Sex is required' })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="">Select...</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
                {errors.sex && (
                  <p className="text-sm text-red-600">{errors.sex.message}</p>
                )}
              </div>

              {formError && (
                <div className="text-red-600 text-center text-sm">{formError}</div>
              )}
              <Button 
                type="submit" 
                className="w-full bg-amber-600 hover:bg-amber-500"
                disabled={formLoading}
              >
                {formLoading ? 'Saving...' : 'Complete Profile'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
