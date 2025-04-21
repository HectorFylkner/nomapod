require('dotenv').config();
const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Webhook endpoint for Stripe events
// Use express.raw for this specific route to get the raw body for signature verification
app.post('/webhook', express.raw({type: 'application/json'}), (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('Stripe webhook secret is not set.');
    return res.status(400).send('Webhook Error: Server configuration error.');
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntentSucceeded = event.data.object;
      // Log detailed information from the successful payment intent
      console.log('PaymentIntent Succeeded:', paymentIntentSucceeded.id);
      console.log('Amount received:', paymentIntentSucceeded.amount); // Amount in cents/öre
      console.log('Currency:', paymentIntentSucceeded.currency);
      console.log('Receipt Email:', paymentIntentSucceeded.receipt_email); // Might be null
      // Log billing details if available from the charge
      if (paymentIntentSucceeded.charges?.data?.length > 0) {
        console.log('Billing Details:', paymentIntentSucceeded.charges.data[0].billing_details);
      } else {
        console.log('No charge details found.');
      }

      // TODO: Add verification logic if needed (compare amount to expected amount)

      // TODO: Get the "Lock to the box" code (how?)
      const lockCode = "TEMP_LOCK_CODE_123"; // Placeholder

      // Get customer phone number from metadata
      const customerPhoneNumber = paymentIntentSucceeded.metadata.phoneNumber;

      if (customerPhoneNumber && lockCode) {
        console.log(`TODO: Send lock code ${lockCode} via SMS to ${customerPhoneNumber}`);
        // TODO: Implement actual SMS sending logic here (e.g., using Twilio)
      } else {
        console.error('Could not send lock code. Missing customer phone number from metadata or lock code.', { phone: customerPhoneNumber, code: lockCode });
      }

      // TODO: Fulfill the purchase based on paymentIntentSucceeded (e.g., update database)
      break;
    case 'payment_intent.payment_failed':
      const paymentIntentFailed = event.data.object;
      console.log('PaymentIntent failed:', paymentIntentFailed.id, paymentIntentFailed.last_payment_error?.message);
      // TODO: Notify the user or take other actions for failed payment
      break;
    // ... handle other event types as needed
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.json({received: true});
});

// Create a payment intent
app.post('/create-payment-intent', async (req, res) => {
  const { amount, phoneNumber } = req.body;

  // Input validation for amount
  if (typeof amount !== 'number' || amount <= 0 || !Number.isInteger(amount * 100)) {
    console.error('Invalid amount received:', amount);
    return res.status(400).json({ error: 'Invalid amount provided. Amount must be a positive number.' });
  }

  // Basic validation for phoneNumber (presence and maybe format)
  if (!phoneNumber || typeof phoneNumber !== 'string' || phoneNumber.length < 5) { // Basic check
    console.error('Invalid phone number received:', phoneNumber);
    return res.status(400).json({ error: 'Invalid phone number provided.' });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'sek',
      payment_method_types: ['card'],
      metadata: {
        // Store the phone number here!
        phoneNumber: phoneNumber
      }
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Stripe API Error creating payment intent:', error); // More specific log
    // Send a generic error message to the client for security
    res.status(500).json({ error: 'Failed to create payment intent.' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 