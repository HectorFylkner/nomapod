import Stripe from 'stripe';
import { buffer } from 'micro';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-10',
});

export const config = {
  api: {
    bodyParser: false, // Stripe requires raw body for webhooks
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).send('Method Not Allowed');
  }

  const sig = req.headers['stripe-signature'];
  
  // === Deep Debugging: Log all available environment variables ===
  console.log('Available ENV_VAR keys:', Object.keys(process.env));
  // Log specific keys we expect
  console.log('Attempting to read STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? 'Set' : 'Not Set');
  console.log('Attempting to read STRIPE_WEBHOOK_SECRET:', process.env.STRIPE_WEBHOOK_SECRET ? 'Set' : 'Not Set/Empty');
  // ============================================================

  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error('Stripe webhook secret is not set.');
    return res.status(500).send('Webhook Error: Secret not configured.');
  }

  let event;
  try {
    const rawBody = await buffer(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, secret);
  } catch (err) {
    console.warn(`⚠️ Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  
  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const pi = event.data.object;
        console.log('✅ PaymentIntent succeeded for id', pi.id);
        const phone = pi.metadata.phoneNumber;
        if (phone) {
          console.log(`TODO: Send lock code to ${phone}`);
        }
        break;
      case 'payment_intent.payment_failed':
        console.log('❌ PaymentIntent failed', event.data.object.id);
        break;
      default:
        console.log(`▶️ Unhandled event type ${event.type}`);
    }
    res.status(200).json({ received: true });
  } catch (err) {
    console.error('🆘 Error handling webhook event:', err);
    res.status(500).json({ error: 'Internal server error handling event.' });
  }
} 