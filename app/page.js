"use client"

import useGlobalStore from '../lib/globalStore'
import { useEffect } from 'react';

export default function Home() {
  const updateGlobalStoreLocation = useGlobalStore(state => state.updateGlobalStoreLocation)
  const updateGlobalStoreCurrency = useGlobalStore(state => state.updateGlobalStoreCurrency)
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          // Use Nominatim for reverse geocoding
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
            const data = await res.json();
            const country = data.address?.country_code?.toUpperCase() || data.address?.country || null;
            if (country) {
              console.log('User country:', country)
              updateGlobalStoreLocation(country);
              // Set currency based on country
              if (country === 'US') {
                updateGlobalStoreCurrency('USD');
              } else if (country === 'IN') {
                updateGlobalStoreCurrency('INR');
              } else {
                updateGlobalStoreCurrency('CAD');
              }
            }
          } catch (e) {
            // fallback or ignore
          }
        },
        () => {}
      );
    }
  }, [updateGlobalStoreLocation, updateGlobalStoreCurrency]);

  return (
    <div className="relative bg-white">
      <div className="mx-auto max-w-7xl lg:grid lg:grid-cols-12 lg:gap-x-8 lg:px-8">
        <div className="px-6 pt-10 pb-24 sm:pb-32 lg:col-span-7 lg:px-0 lg:pt-40 lg:pb-48 xl:col-span-6">
          <div className="mx-auto max-w-lg lg:mx-0">
            <h1 className="mt-24 text-5xl font-semibold tracking-tight text-pretty text-gray-900 sm:mt-10 sm:text-7xl">
              Rideshare to bliss
            </h1>
            <p className="mt-8 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8">
            Looking for a convenient and eco-friendly way to travel to Isha programs? Our platform connects you with fellow travelers heading to major Isha Yoga Centers, making it easy to find and share rides. Enjoy a smooth, hassle-free journey while fostering meaningful connections with like-minded seekers.
            </p>
            <div className="mt-10 flex items-center gap-x-6">
              <a
                href="/find"
                className="rounded-md bg-amber-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-amber-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Get started
              </a>
              <a href="/create" className="text-sm/6 font-semibold text-amber-600">
                Create a ride <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
        <div className="relative lg:col-span-5 lg:-mr-8 xl:absolute xl:inset-0 xl:left-1/2 xl:mr-0">
          <img
            alt=""
            src="/adiyogi-abode.png"
            className="aspect-3/2 w-full bg-gray-50 object-cover lg:absolute lg:inset-0 lg:aspect-auto lg:h-full"
          />
        </div>
      </div>
    </div>
  )
}
