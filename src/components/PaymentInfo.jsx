import React, { useState, useEffect } from 'react';

// Configuration (consider moving to a central config file)
const SWISH_NUMBER = "070-4228605";

function PaymentInfo({ products, selectedProductIds, totalPrice, phoneNumber, onCancel }) {
  const [showWaitingHighlight, setShowWaitingHighlight] = useState(false);

  // Get details of selected products
  const selectedItems = products.filter(p => selectedProductIds.includes(p.id));

  // Add highlight effect shortly after component mounts (is shown)
  useEffect(() => {
    const timer = setTimeout(() => {
        setShowWaitingHighlight(true);
    }, 500); // Delay matches original script
    
    // Cleanup function to clear timeout if component unmounts before highlight
    return () => clearTimeout(timer);
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div className="payment-info">
      <h3>Payment Instructions</h3>
      
      <p className="final-amount">Amount: <span>{totalPrice}</span> SEK</p>
      <p className="swish-number">Swish payment to: <span>{SWISH_NUMBER}</span></p>
      <p><strong>Important:</strong> Enter your phone number (<span>{phoneNumber}</span>) as the message.</p>
      <p className={showWaitingHighlight ? 'sms-wait-message' : ''}>
        You will receive the unlock code via SMS once payment is received. Please note that this may take up to a minute.
      </p>
      <p><strong>After retrieving your item, please close the box and reset the lock to 000.</strong></p>
      
      <button onClick={onCancel} className="edit-selection-button">
        Edit Selection
      </button>
    </div>
  );
}

export default PaymentInfo; 