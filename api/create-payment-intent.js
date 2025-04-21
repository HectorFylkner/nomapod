import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-03-31',
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).send('Method Not Allowed');
  }

  const { amount, phoneNumber } = req.body;
  if (typeof amount !== 'number' || amount <= 0 || !Number.isInteger(amount * 100)) {
    return res.status(400).json({ error: 'Invalid amount provided. Must be a positive number.' });
  }
  if (!phoneNumber || typeof phoneNumber !== 'string') {
    return res.status(400).json({ error: 'Invalid phone number provided.' });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'sek',
      payment_method_types: ['card'],
      metadata: { phoneNumber },
    });
    return res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    console.error('Stripe API Error creating payment intent:', err);
    return res.status(500).json({ error: 'Failed to create payment intent.' });
  }
} 