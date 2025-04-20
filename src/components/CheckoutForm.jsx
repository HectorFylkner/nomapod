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
                // Make sure to change this to your payment completion page
                // return_url: `${window.location.origin}/payment-success`, // Example return URL
                // For now, we won't redirect, just simulate.
            },
            // We are commenting out redirect to prevent actual redirect during simulation
            // redirect: "if_required"
        });
        // ---------------------------------------------------------------

        // Simulate success/error without actual redirect
        if (error) { 
            // This point will only be reached if there is an immediate error when
            // confirming the payment. Otherwise, your customer will be redirected to
            // your `return_url`. For some payment methods like iDEAL, your customer will
            // be redirected to an intermediate site first to authorize the payment, then
            // redirected to the `return_url`.
            if (error.type === "card_error" || error.type === "validation_error") {
                setMessage(error.message);
            } else {
                setMessage("An unexpected error occurred.");
            }
            console.error("Stripe Error:", error);
        } else {
            // ** SIMULATION **: In a real scenario, the user would be redirected.
            // Since we commented out redirect, we simulate success here.
            console.log("Simulated Payment Success!");
            setMessage(`Payment successful! (Simulated)`);
            // Here you would typically show a success message or redirect manually
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