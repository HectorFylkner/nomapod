import Stripe from 'stripe';
import { buffer } from 'micro';
import { Vonage } from '@vonage/server-sdk';
import util from 'util'; // Import the util module for improved logging
import { setTimeout } from 'node:timers/promises'; // Import for manual timeout

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-04-10',
});

// --- o3's Recommended Vonage Call Wrapper --- 
async function sendLockSMS({ vonage, to, from, text }) {
  const label = `[Vonage SMS → ${to}]`;

  try {
    // Short manual timeout so the function never hits Vercel's 10 s hard limit
    const vonagePromise = vonage.sms.send({ to, from, text });
    const response = await Promise.race([
      vonagePromise,
      setTimeout(7000, { timeout: true })
    ]);

    if (response?.timeout) throw new Error('Vonage SMS call timed out (>7 s)');

    console.log(`${label} raw response: ${JSON.stringify(response)}`);

    const msg = response.messages?.[0];
    if (msg?.status === '0') {
      console.log(`${label} ✅ delivered — message-id=${msg['message-id']}`);
    } else {
      throw new Error(
        `API responded with non-zero status=${msg?.status || 'unknown'} ` +
        `error="${msg?.['error-text'] || 'none'}"`
      );
    }
  } catch (err) {
    // Log *everything* – works for plain Error, UndiciError, AxiosError, etc.
    console.error(`${label} 🆘 ${err.message || err}`);
    console.error('⋯ full error object:', util.inspect(err, { depth: 5 }));

    if (err.response) {
      console.error('⋯ HTTP status:', err.response.status);
      const body = await err.response.text().catch(() => '');
      console.error('⋯ HTTP body:', body);
    }
    // Optionally rethrow if you want Vercel to show FUNCTION_INVOCATION_FAILED
    // throw err; 
  }
}
// --- End Vonage Call Wrapper ---

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
  
  // === Deep Debugging: Log all available environment variables ===
  // console.log('Available ENV_VAR keys:', Object.keys(process.env));
  // Log specific keys we expect
  // console.log('Attempting to read STRIPE_SECRET_KEY:', process.env.STRIPE_SECRET_KEY ? 'Set' : 'Not Set');
  // console.log('Attempting to read STRIPE_WEBHOOK_SECRET:', process.env.STRIPE_WEBHOOK_SECRET ? 'Set' : 'Not Set/Empty');
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

          await sendLockSMS({
              vonage,
              to: formattedPhoneNumber,
              from: vonageNumber,
              text: messageBody
          });

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
    console.error('🆘 Error handling webhook event (outside SMS send):', err);
    res.status(500).json({ error: 'Internal server error handling event.' });
  }
} 