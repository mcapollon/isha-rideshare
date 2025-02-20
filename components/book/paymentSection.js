"use client"

import React, { useEffect, useState, use, useImperativeHandle } from 'react'
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { CheckCircle, Shield, Lock, CreditCard } from 'lucide-react';

export default function PaymentSection({ totalPrice, onPaymentComplete, ref }) {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState('')
  const [clientSecret, setClientSecret] = useState()
  const [paymentLoading, setPaymentLoading] = useState(false)

  useEffect(() => {
    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount: totalPrice })
    })
      .then((res) => res.json())
      .then((data) => {setClientSecret(data.clientSecret); console.log(data, 'paymennt intent data')})
      .catch((error) => setErrorMessage("Failed to initialize payment"));

  }, [totalPrice])

  const handlePayment = async () => {
    if (!stripe || !elements) {
      console.log("Stripe not initialized");
      return;
    }

    const {error, selectedPaymentMethod} = await elements.submit();

    console.log(selectedPaymentMethod, 'selected Payment Method')
    
    setPaymentLoading(true);
    setErrorMessage(null);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success?amount=${totalPrice}`,
        },
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        onPaymentComplete?.();
      }
    } catch (e) {
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