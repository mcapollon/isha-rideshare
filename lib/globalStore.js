import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useGlobalStore = create(
  persist(
    (set) => ({
      globalStoreCurrency: 'CAD',
      updateGlobalStoreCurrency: (currency) => set(() => ({ globalStoreCurrency: currency })),
    }),
    {
      name: 'global-store', // name of item in storage
      partialize: (state) => ({ globalStoreCurrency: state.globalStoreCurrency }), // only persist currency
    }
  )
);

export default useGlobalStore;