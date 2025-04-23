import React, { useState, useEffect } from 'react';
import { 
    PaymentElement, 
    useStripe, 
    useElements 
} from '@stripe/react-stripe-js';
import './CheckoutForm.css'; // Import a CSS file for styling

function CheckoutForm({ totalPrice }) { // Accept totalPrice to display on button
    const stripe = useStripe();
    const elements = useElements();

    // State for user messages
    const [message, setMessage] = useState(null);
    // State to track overall process
    const [paymentStatus, setPaymentStatus] = useState('idle'); // idle, processing, succeeded, error

    useEffect(() => {
        if (!stripe) {
            return;
        }
        
        // --- Check URL for Stripe redirect params on initial load --- 
        const clientSecret = new URLSearchParams(window.location.search).get(
          "payment_intent_client_secret"
        );
        const redirectStatus = new URLSearchParams(window.location.search).get(
          "redirect_status"
        );

        if (!clientSecret) {
          return; // No client secret in URL, normal load
        }

        // Retrieve the PaymentIntent based on client secret in URL
        stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
          switch (paymentIntent?.status) {
            case "succeeded":
              setMessage(null);
              setPaymentStatus('succeeded'); 
              console.log("[useEffect] Payment succeeded via redirect check.");
              break;
            case "processing":
              setMessage("Payment processing. We'll update you when payment is received.");
              setPaymentStatus('processing');
              console.log("[useEffect] Payment processing via redirect check.");
              break;
            case "requires_payment_method":
              setMessage("Payment failed. Please try another payment method.");
              setPaymentStatus('error');
              console.error("[useEffect] Payment failed via redirect check.");
              break;
            default:
              setMessage("Something went wrong checking payment status.");
              setPaymentStatus('error');
              console.error("[useEffect] Unknown payment status via redirect check:", paymentIntent?.status);
              break;
          }
          // --- Optional: Clean the URL --- 
          // Remove query params from URL so they don't linger
          // window.history.replaceState(null, '', window.location.pathname);
        });
        // ----------------------------------------------------------

    }, [stripe]); // Depend on stripe being loaded

    // --- New useEffect to check for Apple Pay availability (for logging) ---
    useEffect(() => {
        if (stripe) {
            const paymentRequest = stripe.paymentRequest({
                country: 'SE', // Country code
                currency: 'sek', // Currency code
                total: {
                    label: 'Nomapod Item', // Placeholder label
                    amount: 100, // Placeholder amount (1 SEK) - actual amount doesn't matter for canMakePayment
                },
                requestPayerName: false,
                requestPayerEmail: false,
            });

            paymentRequest.canMakePayment().then(result => {
                if (result) {
                    // result can be {applePay: true}, {googlePay: true}, etc. or null
                    console.log('[PaymentRequest Check] Wallet payment detected:', result);
                    if (result.applePay) {
                        console.log('[PaymentRequest Check] ✅ Apple Pay *should* be available.');
                    } else {
                        console.log('[PaymentRequest Check] ⚠️ Apple Pay compatibility check returned false or non-ApplePay wallet.');
                    }
                } else {
                    console.log('[PaymentRequest Check] ❌ No wallet payment method available (or check failed).');
                }
            }).catch(err => {
                console.error('[PaymentRequest Check] Error checking canMakePayment:', err);
            });
        }
    }, [stripe]); // Run when stripe is loaded
    // --- End Apple Pay check ---

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            // Stripe.js hasn't yet loaded.
            setMessage("Stripe is not ready. Please wait a moment.");
            return;
        }

        setPaymentStatus('processing');
        setMessage("Processing payment...");

        // --- THIS IS WHERE THE ACTUAL PAYMENT CONFIRMATION HAPPENS ---
        // In a real app, this redirects the user to Stripe's payment page or shows an error
        const { error, paymentIntent } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Make sure to change this to your payment completion page
                return_url: `${window.location.origin}${window.location.pathname}`, // Return to the same page
            },
            redirect: "if_required"
        });
        // ---------------------------------------------------------------

        // This part will handle the result if no redirect occurs
        if (error) { 
            // This point will be reached if there is an immediate error or if
            // redirect: 'if_required' is used and the payment fails.
            if (error.type === "card_error" || error.type === "validation_error") {
                setMessage(error.message);
            } else {
                setMessage("An unexpected payment error occurred.");
            }
            console.error("Stripe Error:", error);
            setPaymentStatus('error');
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
            // This point will be reached if redirect: 'if_required' is used and 
            // the payment succeeds without needing a redirect step.
            // NOTE: The webhook is still the definitive source of truth!
            console.log("Payment confirmation successful (client-side)!");
            setMessage(null); // Clear processing message
            setPaymentStatus('succeeded'); 
            // ADD LOGGING HERE
            console.log("[handleSubmit] Set paymentStatus to: succeeded"); 
        } else {
            // Handle other potential statuses if needed
            setMessage("Payment status uncertain. Please check your account or contact support.");
            console.warn("Unexpected paymentIntent status:", paymentIntent?.status);
            setPaymentStatus('error');
        }
    };

    // --- Render different views based on status --- 

    // ADD LOGGING HERE
    console.log("[CheckoutForm Render] Current paymentStatus:", paymentStatus);

    if (paymentStatus === 'succeeded') {
        // ADD LOGGING HERE
        console.log("[CheckoutForm Render] Rendering SUCCESS VIEW");
        return (
            <div className="payment-success">
                <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                    <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
                    <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                </svg>
                <h3>Payment Successful!</h3>
                <p>Thank you for your purchase.</p>
                <p><strong>Please check your phone for the SMS unlock code.</strong></p>
                {/* Add reset instructions with a class */}
                <p className="reset-instructions" style={{ marginTop: '15px'}}>
                    Remember to reset the lock to 000 after collecting your items.
                </p>
                {/* Updated Google Form Link */}
                <p style={{ marginTop: '20px' }}>
                    <a href="https://docs.google.com/forms/d/e/1FAIpQLSc7c8HgBm6xv270LhAgQCuvlNvMyT6iTsbaA_ACUnQVuSbUhw/viewform" target="_blank" rel="noopener noreferrer">
                        We'd be very thankful if you'd want to answer our very short survey!
                    </a>
                </p>
                {/* Optional: Add a button to close/reset */}
                {/* <button onClick={() => window.location.reload()}>Done</button> */}
            </div>
        );
    }

    // ADD LOGGING HERE
    console.log("[CheckoutForm Render] Rendering PAYMENT FORM VIEW");
    // Render payment form for idle, processing, error states
    const paymentElementOptions = {
        layout: "tabs"
    }
    const isLoading = paymentStatus === 'processing';

    return (
        <form id="payment-form" onSubmit={handleSubmit}>
            <PaymentElement id="payment-element" options={paymentElementOptions} />
            {/* Add a placeholder div for potential future PaymentRequestButton if needed */}
            {/* <div id="payment-request-button"></div> */}
            <button type="submit" disabled={isLoading || !stripe || !elements} id="submit" className="stripe-pay-button">
                <span id="button-text">
                    {isLoading ? <div className="spinner" id="spinner"></div> : `Pay ${totalPrice} SEK`}
                </span>
            </button>
            {/* Show any error or status messages */} 
            {message && <div id="payment-message" className={paymentStatus === 'error' ? 'error' : ''}>{message}</div>}
        </form>
    );
}

export default CheckoutForm; 