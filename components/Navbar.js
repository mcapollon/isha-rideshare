'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogPanel, MenuButton, MenuItems, MenuItem, Menu, Listbox } from '@headlessui/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { signOut, useSession } from 'next-auth/react'
import useGlobalStore from '@/lib/globalStore'

const navigation = [
  { name: 'Find a ride', href: '/find' },
  { name: 'Create a ride', href: '/create' }
]

const currencyOptions = [
  { code: 'CAD', label: 'CAD' },
  { code: 'USD', label: 'USD' },
  // { code: 'INR', label: 'INR' },
]

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const {data: session} = useSession()

  const globalStoreCurrency = useGlobalStore(state => state.globalStoreCurrency)
  const updateGlobalStoreCurrency = useGlobalStore(state => state.updateGlobalStoreCurrency)

  const selectedCurrency = currencyOptions.find(opt => opt.code === globalStoreCurrency) || currencyOptions[0];

  const handleCurrencyChange = (selected) => {
    updateGlobalStoreCurrency(selected.code)
  }

  const [hydrated, setHydrated] = useState(false)
  useEffect(() => {
    setHydrated(true)
  }, [])

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
              src="/logo.png"
              className="h-12 w-auto"
            />
          </a>
        </div>

        {session ? (
          <>
            {/* Desktop: Currency Selector + Profile */}
            <div className="hidden lg:flex items-center gap-4">
              {hydrated && (
                <Listbox value={selectedCurrency} onChange={handleCurrencyChange}>
                  <div className="relative">
                    <Listbox.Button className="flex items-center rounded-md border border-gray-300 bg-white px-2 py-1 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition w-20">
                      {selectedCurrency.label}
                      <svg className="ml-2 h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="none" stroke="currentColor"><path d="M7 7l3-3 3 3M7 13l3 3 3-3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </Listbox.Button>
                    <Listbox.Options className="absolute right-0 mt-1 w-20 rounded-md bg-white shadow-lg ring-1 ring-black/5 z-20">
                      {currencyOptions.map((option) => (
                        <Listbox.Option
                          key={option.code}
                          value={option}
                          className={({ active }) =>
                            `cursor-pointer select-none px-3 py-2 text-sm ${active ? 'bg-amber-100 text-amber-900' : 'text-gray-900'}`
                          }
                        >
                          {option.label}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </div>
                </Listbox>
              )}
              {/* Profile dropdown */}
              <Menu as="div" className="relative flex-1 flex justify-end">
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
            </div>

            {/* Mobile: Hamburger + Profile */}
            <div className="flex lg:hidden items-center gap-2">
              <Menu as="div" className="relative flex-1 flex justify-end">
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
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
              >
                <span className="sr-only">Open main menu</span>
                <Bars3Icon aria-hidden="true" className="size-6" />
              </button>
            </div>
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
            {hydrated && (
                <Listbox value={selectedCurrency} onChange={handleCurrencyChange} className="hidden lg:block">
                  <div className="relative">
                    <Listbox.Button className="flex items-center rounded-md border border-gray-300 bg-white px-2 py-1 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition w-20">
                      {selectedCurrency.label}
                      <svg className="ml-2 h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="none" stroke="currentColor"><path d="M7 7l3-3 3 3M7 13l3 3 3-3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </Listbox.Button>
                    <Listbox.Options className="absolute right-0 mt-1 w-20 rounded-md bg-white shadow-lg ring-1 ring-black/5 z-20">
                      {currencyOptions.map((option) => (
                        <Listbox.Option
                          key={option.code}
                          value={option}
                          className={({ active }) =>
                            `cursor-pointer select-none px-3 py-2 text-sm ${active ? 'bg-amber-100 text-amber-900' : 'text-gray-900'}`
                          }
                        >
                          {option.label}
                        </Listbox.Option>
                      ))}
                    </Listbox.Options>
                  </div>
                </Listbox>
              )}
          </div>
        )}

        {/* Hamburger for mobile only, if not logged in */}
        {!session && (
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
        )}
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
          <div className="flex items-center gap-x-4">
            <a href="#" className="-m-1.5 p-1.5">
              <img
                alt=""
                src='/logo.png'
                className="h-12 w-auto"
              />
            </a>
            <div className="flex flex-1 justify-end items-center gap-2">
              {session ? (
                <Menu as="div" className="relative flex-1 flex justify-end">
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
              ) : (
                <a
                  href="/auth/sign-up"
                  className="rounded-md bg-amber-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-amber-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Sign up
                </a>
              )}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="-m-2.5 rounded-md p-2.5 text-gray-700"
              >
                <span className="sr-only">Close menu</span>
                <XMarkIcon aria-hidden="true" className="size-6" />
              </button>
            </div>
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
              {!session && (
                <div className="py-6">
                  <a
                    href="/auth/sign-in"
                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                  >
                    Log in
                  </a>
                </div>
              )}
              {/* Currency selector at the very bottom of the mobile dialog */}
              <div className="pt-6 border-t mt-6 relative">
                {hydrated && (
                  <Listbox value={selectedCurrency} onChange={handleCurrencyChange}>
                    <div className="relative w-24">
                      <Listbox.Button className="flex items-center rounded-md border border-gray-300 bg-white px-2 py-1 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition w-full">
                        {selectedCurrency.label}
                        <svg className="ml-2 h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="none" stroke="currentColor"><path d="M7 7l3-3 3 3M7 13l3 3 3-3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </Listbox.Button>
                      <Listbox.Options className="absolute left-0 mt-1 w-full rounded-md bg-white shadow-lg ring-1 ring-black/5 z-20">
                        {currencyOptions.map((option) => (
                          <Listbox.Option
                            key={option.code}
                            value={option}
                            className={({ active }) =>
                              `cursor-pointer select-none px-3 py-2 text-sm ${active ? 'bg-amber-100 text-amber-900' : 'text-gray-900'}`
                            }
                          >
                            {option.label}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </div>
                  </Listbox>
                )}
              </div>
            </div>
          </div>
        </DialogPanel>
      </Dialog>
    </header>
  )
}
