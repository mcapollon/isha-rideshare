import {create} from 'zustand'

const useFormStore = create((set) => ({
    formStoreStartingCoordinates: null,
    startingAddress: 'null',
    startingCity: '',
    formStoreIshaYogaCenterCoordinates: null,
    departure: null,
    seats: '',
    luggage: '',
    description: '',
    formStoreRideDistanceMeters: null,
    formStoreRideDuration: null,
    formStoreRouteStatus: null,
    formStorePricePerSeat: null,
    updateFormStoreStartingCoordinates: (startingCoordinates) => set(() => ({formStoreStartingCoordinates: startingCoordinates})),
    updateFormStoreIshaYogaCenterCoordinates: (ishaYogaCenter) => {

        let coordinates;
        switch (ishaYogaCenter) {
            case 'Isha Yoga Center, Coimbatore':
                coordinates = { lat: 10.9763407, lng: 76.7342506 };
                break;
            case 'Sadhguru Sannidhi, Bengaluru':
                coordinates = { lat: 13.4861346, lng: 77.7064053 };
                break;
            case 'Sadhguru Sanndhi, Chattarpur':
                coordinates = { lat: 28.4813421, lng: 77.1517377 };
                break;
            case 'Isha Institute of Inner-sciences (iii)':
                coordinates = { lat: 35.5649253, lng: -85.5729322 };
                break;
            case 'Isha Yoga Center, California':
                coordinates = { lat: 34.1991773, lng: -118.6128837 };
                break;
            default:
                coordinates = { lat: 10.9763407, lng: 76.7342506 };
        }

        set(() => ({formStoreIshaYogaCenterCoordinates: coordinates}))
    },
    updateFormStoreRideDistanceMeters: (rideDistanceMeters) => set(() => ({formStoreRideDistanceMeters: rideDistanceMeters})),
    updateFormStoreRouteStatus: (routeStatus) => set((state) => ({formStoreRouteStatus: routeStatus})),
    updateFormStorePricePerSeat: (pricePerSeat) => set(() => ({formStorePricePerSeat: pricePerSeat})),
    updateFormStoreRideDuration: (rideDuration) => set(() => ({formStoreRideDuration: rideDuration})),
}))

export default useFormStore