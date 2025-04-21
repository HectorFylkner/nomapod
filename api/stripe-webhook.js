import Stripe from 'stripe';
import { buffer } from 'micro';
import Twilio from 'twilio';

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

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const client = (accountSid && authToken) ? Twilio(accountSid, authToken) : null;

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
        const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

        if (customerPhoneNumber && client && twilioPhoneNumber) {
          const lockCode = "729";
          
          let formattedPhoneNumber = customerPhoneNumber.trim();
          if (formattedPhoneNumber.startsWith('0')) {
            formattedPhoneNumber = `+46${formattedPhoneNumber.substring(1)}`;
          } else if (!formattedPhoneNumber.startsWith('+')) {
            console.warn(`⚠️ Phone number "${customerPhoneNumber}" does not start with 0 or +. Attempting as is, assuming E.164 format.`);
          }
          
          const messageBody = `Your nomapod lock code is: ${lockCode}.`;

          try {
            console.log(`Attempting to send SMS lock code to ${formattedPhoneNumber} from ${twilioPhoneNumber}`);
            const message = await client.messages.create({
              body: messageBody,
              from: twilioPhoneNumber,
              to: formattedPhoneNumber
            });
            console.log(`✅ SMS sent successfully! SID: ${message.sid}`);
          } catch (smsError) {
            console.error(`🆘 Failed to send SMS to ${formattedPhoneNumber}:`, smsError);
          }
        } else {
          if (!customerPhoneNumber) console.warn("⚠️ Cannot send SMS: Customer phone number missing from payment metadata.");
          if (!client) console.warn("⚠️ Cannot send SMS: Twilio client not initialized (check TWILIO_ACCOUNT_SID/TWILIO_AUTH_TOKEN).");
          if (!twilioPhoneNumber) console.warn("⚠️ Cannot send SMS: TWILIO_PHONE_NUMBER env var not set.");
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