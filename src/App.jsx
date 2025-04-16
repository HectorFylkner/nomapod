import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Header from './components/Header';
import ProductList from './components/ProductList';
import ProductSkeleton from './components/ProductSkeleton';
import TotalDisplay from './components/TotalDisplay';
import PhoneInput from './components/PhoneInput';
import PaymentInfo from './components/PaymentInfo';
import Footer from './components/Footer';
import AnimatedBackground from './components/AnimatedBackground';
import { useWindowSize } from 'react-use';
import './App.css';

const NUM_SKELETONS = 4;
const HIGHLIGHTED_PRODUCT_ID = 'prod3'; // Example: Highlight Barebells

// Helper function for greeting
function getTimeOfDayGreeting() {
  const hour = new Date().getHours();
  if (hour < 5) return "Burning the midnight oil?";
  if (hour < 12) return "Good morning! Ready for a pick-me-up?";
  if (hour < 18) return "Good afternoon! Need a snack?";
  return "Good evening! Late night craving?";
}

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
  const [greeting, setGreeting] = useState('');
  const [smartHint, setSmartHint] = useState('');

  const prevCanProceedRef = useRef();
  const { width, height } = useWindowSize();

  // Fetch products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoadingProducts(true);
      setProductError(null);
      try {
        const productsPath = `${import.meta.env.BASE_URL}products.json`;
        const response = await fetch(productsPath);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Could not load products:", error);
        setProductError('Failed to load products. Please refresh or try again later.');
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  // Set greeting on mount
  useEffect(() => {
    setGreeting(getTimeOfDayGreeting());
  }, []);

  // Handle product selection change
  const handleSelectionChange = useCallback((productId, isChecked) => {
    setSelectedProductIds(prevSelectedIds => {
      if (isChecked) {
        return [...prevSelectedIds, productId];
      } else {
        return prevSelectedIds.filter(id => id !== productId);
      }
    });
    // Hide payment info if product selection changes
    setShowPaymentInfo(false); 
  }, []);

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

  // Effect to update smart hint based on selection
  useEffect(() => {
    let hint = '';
    const numItems = selectedProductIds.length;
    if (numItems === 0) {
      hint = ''; // No hint when nothing is selected
    }
    else if (numItems === 1 && totalPrice <= 20) {
        hint = "Quick refuel!";
    } else if (numItems > 2 && totalPrice > 40) {
        hint = "Stocking up!";
    } else if (numItems > 0) {
        hint = "Nice choice!"; // Default positive hint
    }
    setSmartHint(hint);
  }, [selectedProductIds, totalPrice]);

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

  // Handle showing payment info
  const handleShowPaymentInfo = () => {
    if (!canProceedToPayment || isSubmitting) return;

    setIsSubmitting(true);
    setTimeout(() => {
        setShowPaymentInfo(true);
        setIsSubmitting(false);
    }, 300);
  };

  // Handle cancelling/hiding payment info
  const handleCancelPayment = useCallback(() => {
    setShowPaymentInfo(false);
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

  // Render Error state first if product fetch failed
  if (productError) {
    return <div className="error-message">{productError}</div>;
  }

  return (
    <>
      <AnimatedBackground />
      <div className="container">
        <Header />
        
        {/* Render Greeting */} 
        {greeting && <p className="time-greeting">{greeting}</p>}
        
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
                highlightedProductId={HIGHLIGHTED_PRODUCT_ID} // Pass down highlighted ID
              />
            )}
          </div>
        </div>

        {!isLoadingProducts && (
          <div className="section-controls">
            <TotalDisplay totalPrice={totalPrice} /> 
            {/* Render Smart Hint */} 
            {smartHint && <p className="smart-hint">{smartHint}</p>}
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
                        <span>Show Payment Info</span>
                    </button>
                </div>
            </div>
          </div>
        )}

        <div className={`payment-info-wrapper ${showPaymentInfo ? 'visible' : ''}`}> 
          <PaymentInfo 
            products={products}
            selectedProductIds={selectedProductIds}
            totalPrice={totalPrice}
            phoneNumber={phoneNumber}
            onCancel={handleCancelPayment}
          />
        </div>

      </div>
      <Footer />
    </>
  );
}

export default App; 