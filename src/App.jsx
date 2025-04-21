import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import Header from './components/Header';
import ProductList from './components/ProductList';
import ProductSkeleton from './components/ProductSkeleton';
import TotalDisplay from './components/TotalDisplay';
import PhoneInput from './components/PhoneInput';
import Footer from './components/Footer';
import CheckoutForm from './components/CheckoutForm';
import AnimatedBackground from './components/AnimatedBackground';
import './App.css';

// Load Stripe outside of component render to avoid recreating promise on every render
// Get key from Vite environment variables (prefixed with VITE_)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Check if the key was actually loaded
if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
  console.error("ERROR: VITE_STRIPE_PUBLISHABLE_KEY is not set in environment variables.");
  // Optionally, render an error message or prevent app load
}

// --- Define Stripe Appearance --- 
const stripeAppearance = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#5469d4', 
    colorBackground: '#ffffff',
    colorText: '#30313d',
    colorDanger: '#df1b41',
    fontFamily: 'Ideal Sans, system-ui, sans-serif',
    spacingUnit: '4px',
    borderRadius: '4px',
  },
  rules: {
    '.Input': { 
       border: '1px solid #d1d1d1',
       boxShadow: 'none',
    },
    '.Label': { 
       fontWeight: '500',
       marginBottom: '6px',
    }
  }
};
// -----------------------------

const NUM_SKELETONS = 4;

function App() {
  const [products, setProducts] = useState([]);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneHasInput, setPhoneHasInput] = useState(false);
  const [showPaymentInfo, setShowPaymentInfo] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productError, setProductError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPulse, setShowPulse] = useState(false);
  const [highlightedProductId, setHighlightedProductId] = useState(null);
  const [clientSecret, setClientSecret] = useState('');

  const prevCanProceedRef = useRef();

  // Fetch products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoadingProducts(true);
      setProductError(null);
      setHighlightedProductId(null);
      try {
        const productsPath = `${import.meta.env.BASE_URL}products.json`;
        const response = await fetch(productsPath);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        setProducts(data);
        if (data && data.length > 0) {
          const randomIndex = Math.floor(Math.random() * data.length);
          setHighlightedProductId(data[randomIndex].id);
        }
      } catch (error) {
        console.error("Could not load products:", error);
        setProductError('Failed to load products. Please refresh or try again later.');
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  // Handle product selection change
  const handleSelectionChange = useCallback((productId, isChecked) => {
    // Calculate the next selection state
    const newSelection = isChecked 
      ? [...selectedProductIds, productId] 
      : selectedProductIds.filter(id => id !== productId);

    // Update the selection state
    setSelectedProductIds(newSelection);
    
    // Reset phone input status and hide payment info on any selection change
    setPhoneHasInput(false);
    setShowPaymentInfo(false); 
  }, [selectedProductIds]); // Keep selectedProductIds dependency

  // Handle phone number input change
  const handlePhoneChange = useCallback((value) => {
    setPhoneNumber(value);
    setPhoneHasInput(true);
    // Hide payment info if phone number changes
    setShowPaymentInfo(false); 
  }, []);

  // Calculate total price
  const totalPrice = useMemo(() => {
    return selectedProductIds.reduce((total, id) => {
      const product = products.find(p => p.id === id);
      return total + (product ? product.price : 0);
    }, 0);
  }, [selectedProductIds, products]);

  // Validate phone number
  const isPhoneValid = useMemo(() => {
    const phoneRegex = /^07[0-9]{8}$/;
    return phoneRegex.test(phoneNumber.trim());
  }, [phoneNumber]);

  // Determine if payment button should be enabled
  const canProceedToPayment = selectedProductIds.length > 0 && isPhoneValid;

  // Effect to trigger pulse animation when button becomes enabled
  useEffect(() => {
    const prevCanProceed = prevCanProceedRef.current;
    if (!prevCanProceed && canProceedToPayment) {
      setShowPulse(true);
      const timer = setTimeout(() => setShowPulse(false), 1500);
      return () => clearTimeout(timer);
    }
    prevCanProceedRef.current = canProceedToPayment;
  }, [canProceedToPayment]);

  // Modified handleShowPaymentInfo to use the new Vercel API route
  const handleShowPaymentInfo = async () => { // Make async for await
    if (!canProceedToPayment || isSubmitting) return;

    setIsSubmitting(true);
    setClientSecret(''); // Clear previous secret
    // Clear any previous error message if you have one

    // Prepare data for the backend
    const backendPayload = {
      amount: totalPrice, // Backend expects 'amount'
      phoneNumber: phoneNumber
    };

    try {
      // Create a PaymentIntent via the new Vercel API route
      console.log("Calling backend to create PaymentIntent: /api/create-payment-intent");
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backendPayload)
      });

      if (!response.ok) {
        // Try to get error message from backend response body
        const errorData = await response.json().catch(() => ({})); // Handle non-JSON errors
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.clientSecret) {
        throw new Error("Received invalid data from server (missing clientSecret).");
      }

      console.log("Received clientSecret:", data.clientSecret);
      setClientSecret(data.clientSecret);
      setShowPaymentInfo(true); // Show payment form only on success

    } catch (error) {
      console.error("Failed to create PaymentIntent:", error);
      // TODO: Show an error message to the user
      // e.g., set an error state: setErrorState(error.message || "Could not initialize payment.");
    } finally {
      setIsSubmitting(false); // Stop loading indicator regardless of outcome
    }
  };

  // Handle cancelling/hiding payment info
  const handleCancelPayment = useCallback(() => {
    setShowPaymentInfo(false);
    setClientSecret(''); // Also clear client secret on cancel
  }, []);

  // Determine tooltip text for disabled payment button
  const paymentButtonTitle = useMemo(() => {
      if (canProceedToPayment) return undefined;
      let reason = 'Please ';
      const productSelected = selectedProductIds.length > 0;
      if (!productSelected && !isPhoneValid && phoneHasInput) {
          reason += 'select a product and enter a valid phone number.';
      } else if (!productSelected && (!isPhoneValid || !phoneHasInput)) {
          reason += 'select a product';
          if (!isPhoneValid && phoneHasInput) reason += ' and enter a valid phone number';
          reason += '.';
      } else if (!productSelected) {
          reason += 'select a product.';
      } else {
          reason += 'enter a valid 10-digit phone number (07XXXXXXXX).';
      }
      return reason;
  }, [canProceedToPayment, selectedProductIds, isPhoneValid, phoneHasInput]);

  // Options for Stripe Elements provider
  const options = {
    clientSecret,
    appearance: stripeAppearance, // Pass the appearance object here
  };

  // Render Error state first if product fetch failed
  if (productError) {
    return <div className="error-message">{productError}</div>;
  }

  return (
    <>
      <AnimatedBackground />
      <div className="container">
        <Header />
        
        <div className="section-products">
          <h2>Select Products</h2>
          <div className="product-list-container">
            {isLoadingProducts ? (
              Array.from({ length: NUM_SKELETONS }).map((_, index) => (
                <ProductSkeleton key={index} />
              ))
            ) : (
              <ProductList 
                products={products}
                selectedProducts={selectedProductIds}
                onSelectionChange={handleSelectionChange}
                highlightedProductId={highlightedProductId}
              />
            )}
          </div>
        </div>

        {!isLoadingProducts && (
          <div className="section-controls">
            <TotalDisplay totalPrice={totalPrice} /> 
            <PhoneInput 
              phoneNumber={phoneNumber}
              onPhoneChange={handlePhoneChange}
              isPhoneValid={isPhoneValid}
              phoneHasInput={phoneHasInput}
            />
            <div className={`payment-button-container ${showPaymentInfo ? 'hidden' : ''}`}>
                <div className="payment-button-wrapper">
                    <button 
                        className={`payment-button ${isSubmitting ? 'loading' : ''} ${showPulse ? 'pulse-enable' : ''}`}
                        onClick={handleShowPaymentInfo}
                        disabled={!canProceedToPayment || isSubmitting}
                        title={paymentButtonTitle}
                    >
                        <span>Proceed to Payment</span> 
                    </button>
                </div>
            </div>
          </div>
        )}

        {/* Conditionally render Elements Provider only when clientSecret is available */} 
        {clientSecret && showPaymentInfo && (
          <Elements stripe={stripePromise} options={options}>
            <div className={`payment-info-wrapper ${showPaymentInfo ? 'visible' : ''}`}> 
              <CheckoutForm totalPrice={totalPrice} />
              <button onClick={handleCancelPayment} className="edit-selection-button" style={{marginTop: '15px'}}>
                 Cancel Payment
               </button> 
            </div>
          </Elements>
        )}

      </div>
      <Footer />
    </>
  );
}

export default App; 