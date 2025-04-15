import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Header from './components/Header';
import ProductList from './components/ProductList';
import TotalDisplay from './components/TotalDisplay';
import PhoneInput from './components/PhoneInput';
import PaymentInfo from './components/PaymentInfo';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';
import './App.css';

function App() {
  const [products, setProducts] = useState([]);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneHasInput, setPhoneHasInput] = useState(false); // Track if user typed in phone input
  const [showPaymentInfo, setShowPaymentInfo] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productError, setProductError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // For button loading state

  // Fetch products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Construct path relative to the base URL for deployment
        const productsPath = `${import.meta.env.BASE_URL}products.json`; 
        console.log("Fetching products from:", productsPath); // Add log for debugging
        const response = await fetch(productsPath); 
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        setProducts(data);
        setProductError(null);
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
    setPhoneHasInput(true); // User has interacted with the input
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

  // Handle showing payment info
  const handleShowPaymentInfo = () => {
    if (!canProceedToPayment || isSubmitting) return;

    setIsSubmitting(true);
    // Simulate delay like original script
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
      } else { // Phone must be invalid
          reason += 'enter a valid 10-digit phone number (07XXXXXXXX).';
      }
      return reason;
  }, [canProceedToPayment, selectedProductIds, isPhoneValid, phoneHasInput]);

  // Render logic based on loading/error state
  if (isLoadingProducts) {
    return <div className="loading-message"><LoadingSpinner size="30px" /> Loading Products...</div>;
  }

  if (productError) {
    return <div className="error-message">{productError}</div>;
  }

  return (
    <>
      <div className="container">
        <Header />
        
        <h2>Select Products</h2>
        <ProductList 
          products={products}
          selectedProducts={selectedProductIds}
          onSelectionChange={handleSelectionChange}
        />

        <TotalDisplay totalPrice={totalPrice} />

        <PhoneInput 
          phoneNumber={phoneNumber}
          onPhoneChange={handlePhoneChange}
          isPhoneValid={isPhoneValid}
          phoneHasInput={phoneHasInput}
        />

        {!showPaymentInfo && (
            <button 
                className={`payment-button ${isSubmitting ? 'loading' : ''}`}
                onClick={handleShowPaymentInfo}
                disabled={!canProceedToPayment || isSubmitting}
                title={paymentButtonTitle}
            >
                <span>Show Payment Info</span>
            </button>
        )}

        {showPaymentInfo && (
          <PaymentInfo 
            products={products}
            selectedProductIds={selectedProductIds}
            totalPrice={totalPrice}
            phoneNumber={phoneNumber}
            onCancel={handleCancelPayment}
          />
        )}
      </div>
      <Footer />
    </>
  );
}

export default App; 