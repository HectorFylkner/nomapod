import React, { useState, useEffect } from 'react';
import { 
    PaymentElement, 
    useStripe, 
    useElements 
} from '@stripe/react-stripe-js';

function CheckoutForm({ totalPrice }) { // Accept totalPrice to display on button
    const stripe = useStripe();
    const elements = useElements();

    const [message, setMessage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!stripe) {
            return;
        }
        // Optionally retrieve the PaymentIntent status here if needed
        // const clientSecret = new URLSearchParams(window.location.search).get(
        //   "payment_intent_client_secret"
        // );
        // if (!clientSecret) { return; }
        // stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => { ... });
    }, [stripe]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            // Stripe.js hasn't yet loaded.
            setMessage("Stripe is not ready. Please wait a moment.");
            return;
        }

        setIsLoading(true);
        setMessage("Processing payment...");

        // --- THIS IS WHERE THE ACTUAL PAYMENT CONFIRMATION HAPPENS ---
        // In a real app, this redirects the user to Stripe's payment page or shows an error
        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // No return_url needed if using redirect: 'if_required'
                // return_url: `${window.location.origin}/payment-success`, 
            },
            // Add redirect: 'if_required' to handle result without redirecting
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
                setMessage("An unexpected error occurred.");
            }
            console.error("Stripe Error:", error);
        } else {
            // This point will be reached if redirect: 'if_required' is used and 
            // the payment succeeds without needing a redirect step.
            // NOTE: The webhook is still the definitive source of truth!
            console.log("Payment confirmation successful (client-side)!");
            setMessage(`Payment successful! (Awaiting server confirmation)`); 
            // Potentially call a function passed via props to indicate success to App.jsx
        }

        setIsLoading(false);
    };

    const paymentElementOptions = {
        layout: "tabs"
    }

    return (
        <form id="payment-form" onSubmit={handleSubmit}>
            <PaymentElement id="payment-element" options={paymentElementOptions} />
            <button disabled={isLoading || !stripe || !elements} id="submit" className="stripe-pay-button">
                <span id="button-text">
                    {isLoading ? <div className="spinner" id="spinner"></div> : `Pay ${totalPrice} SEK`}
                </span>
            </button>
            {/* Show any error or success messages */} 
            {message && <div id="payment-message">{message}</div>}
        </form>
    );
}

export default CheckoutForm; 