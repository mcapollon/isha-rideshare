'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogPanel, MenuButton, MenuItems, MenuItem, Menu } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { createClient } from '@/utils/supabase/client'
import { signIn, signOut, useSession } from 'next-auth/react'

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

const navigation = [
  { name: 'Find a ride', href: '/find' },
  { name: 'Create a ride', href: '/create' }
]

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const {data: session} = useSession()

  return (
    <header className="bg-[#d9cebc]">
      <nav aria-label="Global" className="mx-auto flex max-w-7xl items-center justify-between gap-x-6 p-6 lg:px-8 border-b border-white/25">
        <div className="hidden lg:flex lg:flex-shrink lg:gap-x-12">
          {navigation.map((item) => (
            <a key={item.name} href={item.href} className="text-sm/6 font-semibold text-gray-900">
              {item.name}
            </a>
          ))}
        </div>
        <div className="flex lg:flex-1 justify-center">
          {/* Isha logo */}
          <a href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">Isha Ride Share</span>
            <img
              alt=""
              src="./logo.png"
              className="h-8 w-auto"
            />
          </a>
        </div>

        {session ? (

          <>
            {/* <p>{session?.user.name}</p> */}
            <Menu as="div" className="relative ml-3 lg:flex-none flex-1 flex justify-end">
              <div>
                <MenuButton className="relative flex rounded-full bg-gray-800 text-sm focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-hidden">
                  <span className="absolute -inset-1.5" />
                  <span className="sr-only">Open user menu</span>
                  <img
                    alt=""
                    src={session?.user.image || "./default-user-icon.png"}
                    className="size-8 rounded-full"
                  />
                </MenuButton>
              </div>
              <MenuItems
                transition
                className="absolute right-0 z-10 mt-10 w-48 origin-top-right rounded-md bg-white py-1 ring-1 shadow-lg ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
              >
                <MenuItem>
                  <a
                    href="/account"
                    className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:outline-hidden"
                  >
                    Your Profile
                  </a>
                </MenuItem>
                <MenuItem>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-red-700 data-focus:bg-gray-100 data-focus:outline-hidden"
                    onClick={() => signOut()}
                  >
                    Sign out
                  </a>
                </MenuItem>
              </MenuItems>
            </Menu>
          </>

        ) : (
          
            <div className="flex flex-1 md:flex-auto lg:flex-none items-center justify-end gap-x-6">
              <a href="/auth/sign-in" className="hidden text-sm/6 font-semibold text-gray-900 lg:block">
                Log in
              </a>
              <a
                href="/auth/sign-up"
                className="rounded-md bg-amber-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-amber-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Sign up
              </a>
            </div>

      )}
          

        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon aria-hidden="true" className="size-6" />
          </button>
        </div>
      </nav>
      <Dialog 
        as="div"
        open={mobileMenuOpen} 
        onClose={setMobileMenuOpen} 
        className="lg:hidden"
      >
        {/* Add a backdrop with transition */}
        <div 
          className="fixed inset-0 z-10 bg-black/30 backdrop-blur-sm transition-opacity duration-300 ease-in-out"
          aria-hidden="true"
          data-headlessui-state={mobileMenuOpen ? "open" : "closed"}
          style={{ opacity: mobileMenuOpen ? 1 : 0 }}
        />
        
        <DialogPanel 
          className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10 transform transition-transform duration-300 ease-in-out"
          style={{ transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(100%)' }}
        >
          <div className="flex items-center gap-x-6">
            <a href="#" className="-m-1.5 p-1.5">
              <img
                alt=""
                src='/logo.png'
                className="h-8 w-auto"
              />
            </a>
            <a
              href="/auth/sign-up"
              className="ml-auto rounded-md bg-amber-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-amber-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Sign up
            </a>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon aria-hidden="true" className="size-6" />
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                  >
                    {item.name}
                  </a>
                ))}
              </div>
              <div className="py-6">
                <a
                  href="/auth/sign-in"
                  className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                >
                  Log in
                </a>
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  )
}
