import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useGlobalStore = create(
  persist(
    (set) => ({
      globalStoreCurrency: 'CAD',
      updateGlobalStoreCurrency: (currency) => set(() => ({ globalStoreCurrency: currency })),
      globalStoreLocation: null,
      updateGlobalStoreLocation: (location) => set(() => ({ globalStoreLocation: location })),
    }),
    {
      name: 'global-store', // name of item in storage
      partialize: (state) => ({ globalStoreCurrency: state.globalStoreCurrency, globalStoreLocation: state.globalStoreLocation }), // persist currency and location
    }
  )
);

export default useGlobalStore;