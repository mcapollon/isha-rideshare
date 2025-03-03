import { useFormContext } from 'react-hook-form'
import React from 'react';
import format from 'date-fns/format';
import { CheckCircle } from 'lucide-react';

export default function RideCreationSuccessStep() {
    const { getValues } = useFormContext()
    const formData = getValues()

    return (<>
        <div>
            <div className="flex flex-col items-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-2">Ride Successfully Created!</h2>
                <p className="text-gray-600 mb-6 text-center max-w-md">
                    Your ride has been successfully created and is now available for others to join.
                    You will receive notifications when someone books a seat.
                </p>

                <div className="bg-gray-50 rounded-lg p-6 w-full max-w-md mb-6 border border-gray-200">
                    <h3 className="font-medium text-gray-800 mb-3">Ride Summary</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">From:</span>
                            <span className="font-medium">{formData.startingPointAddress}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">To:</span>
                            <span className="font-medium">{formData.ishaYogaCenter}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Departure:</span>
                            {/* <span className="font-medium">{formData.departure}</span> */}
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Seats Available:</span>
                            <span className="font-medium">{formData.seats}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Price per Seat:</span>
                            <span className="font-medium">${formData.pricePerSeat}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
    )
}

