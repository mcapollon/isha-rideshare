import { NextRequest, NextResponse } from 'next/server'

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
    try {
        const { amount } = await request.json();

        const paymentIntent = await stripe.paymentIntent.create({
            amount: amount,
            current: 'cad',
            automatic_payment_methods: { enabled: true }
        })

        return NextResponse.json({clientSecret: paymentIntent.client_secret})
    } catch (error) {
        console.log(error, 'api payment error')

        return NextResponse.json(
            {error: error},
            {status: 500}
        )
    }
}