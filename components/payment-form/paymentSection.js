"use client"

import React, { useEffect, useState, useImperativeHandle } from 'react'
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { CheckCircle, Shield, Lock, CreditCard } from 'lucide-react';
import usePaymentStore from '../../components/payment-form/paymentStore'
import { useSession } from 'next-auth/react';

export default function PaymentSection({ totalPrice, tripSummary, ref, session, seats, currency, serviceFee, pricePerSeat }) {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState('')
  const [clientSecret, setClientSecret] = useState()
  const [paymentLoading, setPaymentLoading] = useState(false)

  // const paymentStorePricePerSeat = usePaymentStore((state) => state.paymentStorePricePerSeat)

  useEffect(() => {
    if (!tripSummary || !tripSummary.id) {
      console.error("Missing ride information");
      setErrorMessage("Missing ride information");
      return;
    }

    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        amount: totalPrice,
        rideData: tripSummary,
        currency,
        seats, 
        session,
        serviceFee,
        pricePerSeat: pricePerSeat,
        payInCash: tripSummary.payInCash // Pass payInCash to API
      }) 
    })
      .then((res) => {
      if (!res.ok) {
        return res.json().then(data => {
        throw new Error(data.error || "Failed to initialize payment");
        });
      }
      return res.json();
      })
      .then((data) => {
      setClientSecret(data.clientSecret);
      })
      .catch((error) => {
      console.error("Payment initialization error:", error);
      setErrorMessage(error.message || "Failed to initialize payment");
      });
  }, [totalPrice, tripSummary, session, seats]);

  const handlePayment = async () => {
    if (!stripe || !elements) {
      return;
    }

    // Check if clientSecret exists
    if (!clientSecret) {
      setErrorMessage("Payment cannot be initialized. Please try again later.");
      return;
    }

    const {error: submitError} = await elements.submit();
    if (submitError) {
      setErrorMessage(submitError.message);
      return new Error(submitError || "Payment failed");
    }
    
    setPaymentLoading(true);
    setErrorMessage(null);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success?id=${tripSummary.id}&amount=${totalPrice}&serviceFee=${serviceFee}&curr=${currency.toUpperCase()}&pricePerSeat=${pricePerSeat}&startingCity=${encodeURI(tripSummary?.startingCity)}&iyc=${encodeURI(tripSummary?.ishaYogaCenter)}&departure=${tripSummary?.departure}&duration=${tripSummary.rideDuration}&distance=${tripSummary.rideDistanceKm}&seats=${seats}&payInCash=${tripSummary.payInCash}`,
        },
      });

      if (error) {
        setErrorMessage(error.message);
        return new Error(error.message || "Payment failed");
      } 

    } catch (e) {
      console.error("Payment error:", e);
      setErrorMessage("An unexpected error occurred");
    } finally {
      setPaymentLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    handlePayment
  }));


  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-4">Payment Information</h3>

      {/* Payment Methods */}
      <div className="space-y-6">
        <div className="flex items-center space-x-4 pb-4 border-b">
          <CreditCard className="w-6 h-6 text-blue-600" />
          <div>
            <div className="font-medium">Secure Payment Methods</div>
            <p className="text-gray-600 text-sm">We accept all major credit cards and debit cards</p>
          </div>
        </div>

        {/* Security Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <Lock className="w-5 h-5 text-green-600 mt-1" />
            <div>
              <div className="font-medium">Secure Transactions</div>
              <p className="text-gray-600 text-sm">256-bit SSL encryption for all payments</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-green-600 mt-1" />
            <div>
              <div className="font-medium">Buyer Protection</div>
              <p className="text-gray-600 text-sm">Full refund if the trip is cancelled</p>
            </div>
          </div>
        </div>

        {/* Payment Process */}
        <div className="mt-6">
          <h4 className="font-medium mb-3">How payment works</h4>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <span className="text-gray-600">Payment is processed when booking is confirmed</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <span className="text-gray-600">Funds are held securely until after the trip</span>
            </div>
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <span className="text-gray-600">24/7 customer support available</span>
            </div>
          </div>
        </div>
        <PaymentElement />
        <div>{errorMessage}</div>
      </div>
    </div>
  );
}