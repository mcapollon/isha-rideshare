import {create} from 'zustand';

const usePaymentStore = create((set) => ({
    paymentStorePricePerSeat: null,
    paymentStoreServiceFee: 5,
    paymentStoreSeatCount: 1,
    paymentStoreSeatLimit: 1,
    paymentStoreAmount: null,
    paymentStoreAmountInCents: null,
    paymentStoreIsCash: false,
    paymentStoreDisplayTotal: null,
    updatePaymentStorePricePerSeat: (amount) => set(() => ({paymentStorePricePerSeat: amount})),
    updatePaymentStoreSeatCountIncrement: (state) => set((state) => ({paymentStoreSeatCount: state.paymentStoreSeatCount <= state.paymentStoreSeatLimit ? state.paymentStoreSeatCount + 1 : state.paymentStoreSeatCount})),
    updatePaymentStoreSeatCountDecrement: (state) => set((state) => ({paymentStoreSeatCount: state.paymentStoreSeatCount <= state.paymentStoreSeatLimit ? state.paymentStoreSeatCount - 1 : state.paymentStoreSeatCount})),
    updatePaymentStorePaymentStoreSeatLimit: (seats) => set(() => ({paymentStoreSeatLimit: seats})),
    updatePaymentStoreAmount: (amount) => set(() => ({paymentStoreAmount: amount})),
    updatePaymentStoreAmountInCents: (amount) => set(() => ({paymentStoreAmountInCents: amount * 100})),
    updatePaymentStoreServiceFee: (amount) => set(() => ({paymentStoreServiceFee: amount})),
    updatePaymentStoreIsCash: (isCash) => set(() => ({paymentStoreIsCash: isCash})),
    updatePaymentStoreDisplayTotal: (amount) => set(() => ({paymentStoreDisplayTotal: amount})),
}))

export default usePaymentStore