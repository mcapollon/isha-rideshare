import { useFormContext } from 'react-hook-form'
import React, { useState } from 'react';
import format from 'date-fns/format';
import { Check, Car, DollarSign, ClipboardList, CheckCircle, MapPin, Calendar, Users, Package, FileText, CreditCard, User, Mail, Phone } from 'lucide-react';

export default function ReviewStep() {
  const { getValues } = useFormContext()
  const formData = getValues()

  return (<>
    <div>
              <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">Review Your Ride</h2>
              
              <div className="bg-[#f9f6f0] rounded-lg p-6 mb-8">
                <h3 className="text-lg font-medium mb-4 text-[#d98e3e] flex items-center">
                  <Car className="w-5 h-5 mr-2" />
                  Ride Details
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">From</p>
                      <p className="font-medium">{formData.startingPointAddress || "Not specified"}</p>
                      <p className="font-medium">{formData.startingCity || "Not specified"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">To</p>
                      <p className="font-medium">{formData.ishaYogaCenter}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Calendar className="w-5 h-5 text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">Departure</p>
                      <p className="font-medium">{format(formData.departure, 'PP') || "Not specified"} at {format(formData.departure, 'p') || "Not specified"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Users className="w-5 h-5 text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">Available Seats</p>
                      <p className="font-medium">{formData.seats}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Package className="w-5 h-5 text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">Luggage Size</p>
                      <p className="font-medium">{formData.luggage}</p>
                    </div>
                  </div>
                  
                  {formData.description && (
                    <div className="flex items-start">
                      <FileText className="w-5 h-5 text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500">Additional Information</p>
                        <p className="text-sm">{formData.description}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-[#f9f6f0] rounded-lg p-6 mb-8">
                <h3 className="text-lg font-medium mb-4 text-[#d98e3e] flex items-center">
                  <CreditCard className="w-5 h-5 mr-2" />
                  Pricing
                </h3>
                
                <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm mb-2">
                  <span className="text-gray-700">Price per seat</span>
                  <span className="text-xl font-bold text-[#d98e3e]">
                    {(() => {
                      const currencySymbols = { USD: '$', CAD: 'CA$', INR: '₹' };
                      const symbol = currencySymbols[formData.currency] || formData.currency;
                      return `${symbol}${formData.pricePerSeat} - ${formData.currency}`;
                    })()}
                  </span>
                </div>
              </div>
            </div>
    </>
  )
}

