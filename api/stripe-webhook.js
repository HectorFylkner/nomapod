import Stripe from 'stripe';
import { buffer } from 'micro';
import { Vonage } from '@vonage/server-sdk';
import { SMS } from '@vonage/messages';

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

  const apiKey = process.env.VONAGE_API_KEY;
  const apiSecret = process.env.VONAGE_API_SECRET;
  const vonage = (apiKey && apiSecret) ? new Vonage({ apiKey, apiSecret }) : null;

  const sig = req.headers['stripe-signature'];
  
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
        const customerPhoneNumber = pi.metadata.phoneNumber;
        const vonageNumber = process.env.VONAGE_NUMBER;

        if (customerPhoneNumber && vonage && vonageNumber) {
          const lockCode = "729";
          
          let formattedPhoneNumber = customerPhoneNumber.trim();
          if (formattedPhoneNumber.startsWith('0')) {
            formattedPhoneNumber = `46${formattedPhoneNumber.substring(1)}`;
          } else if (formattedPhoneNumber.startsWith('+')) {
            formattedPhoneNumber = formattedPhoneNumber.substring(1);
          } else {
            console.warn(`⚠️ Phone number "${customerPhoneNumber}" has unexpected format. Attempting as is for Vonage.`);
          }
          
          const messageBody = `Your nomapod lock code is: ${lockCode}.`;

          try {
            console.log(`Attempting to send SMS lock code via Vonage to ${formattedPhoneNumber} from ${vonageNumber}`);
            
            const message = new SMS(messageBody, formattedPhoneNumber, vonageNumber);
            const results = await vonage.messages.send(message);
            
            if (results && results.message_uuid) {
              console.log(`✅ SMS submitted successfully via Vonage! Message UUID: ${results.message_uuid}`);
            } else {
              console.warn(`⚠️ Vonage SMS submission may not have succeeded. Response:`, results);
            }
            
          } catch (smsError) {
            console.error(`🆘 Failed to send SMS via Vonage to ${formattedPhoneNumber}:`, smsError);
          }
        } else {
          if (!customerPhoneNumber) console.warn("⚠️ Cannot send SMS: Customer phone number missing.");
          if (!vonage) console.warn("⚠️ Cannot send SMS: Vonage client not initialized (check VONAGE_API_KEY/VONAGE_API_SECRET).");
          if (!vonageNumber) console.warn("⚠️ Cannot send SMS: VONAGE_NUMBER env var not set.");
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