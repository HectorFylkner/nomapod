import Stripe from 'stripe';
import { buffer } from 'micro';
import { Vonage } from '@vonage/server-sdk';
import util from 'util'; // Import the util module for improved logging

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

          try {
            console.log(`Attempting to send SMS lock code via Vonage (SMS API) to ${formattedPhoneNumber} from ${vonageNumber}`);

            // --- Use the legacy SMS API ---
            const vonageResponse = await vonage.sms.send({
                to: formattedPhoneNumber,
                from: vonageNumber, // Can be your Vonage number or an approved Alphanumeric Sender ID
                text: messageBody
            });
            // --------------------------------

            // Log the raw response for debugging
            console.log('Raw Vonage SMS API Response:', JSON.stringify(vonageResponse, null, 2));

            // Check response structure (this might vary slightly, adjust as needed based on logs)
            // Example check: assuming response has a messages array and the first message has a status
            if (vonageResponse && vonageResponse['message-count'] === '1' && vonageResponse.messages && vonageResponse.messages[0].status === '0') {
              console.log(`✅ SMS submitted successfully via Vonage (SMS API)! Message ID: ${vonageResponse.messages[0]['message-id']}`);
            } else {
              const status = vonageResponse?.messages?.[0]?.status;
              const errorText = vonageResponse?.messages?.[0]?.['error-text'];
              console.warn(`⚠️ Vonage SMS submission failed or requires attention. Status: ${status || 'N/A'}, Error: ${errorText || 'N/A'}`);
            }

          } catch (smsError) {
            // --- Improved Error Logging ---
            console.error(`🆘 Failed to send SMS via Vonage (SMS API) to ${formattedPhoneNumber}`);
            console.error('Raw Vonage Error Object:', util.inspect(smsError, {depth: 5})); // Log the full error object structure

            // Log specific HTTP details if available (often helpful for auth/network issues)
            if (smsError.response) {
                console.error('--> HTTP Status:', smsError.response.status);
                try {
                    // Attempt to parse and log the response body text
                    const errorBody = await smsError.response.text();
                    console.error('--> HTTP Response Body:', errorBody);
                } catch (bodyError) {
                    console.error('--> Error reading HTTP Response Body:', bodyError);
                }
            }
            // --- End Improved Error Logging ---
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