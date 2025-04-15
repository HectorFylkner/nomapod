import React, { useState, useEffect } from 'react';
import CountUp from 'react-countup';

// Define the pop animation styles directly or in CSS
const popStyleBase = {
    position: 'absolute',
    top: '-10px', // Start above the total
    left: '50%', 
    transform: 'translateX(-50%)',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '0.8em',
    fontWeight: '600',
    opacity: 0,
    transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
    whiteSpace: 'nowrap', 
    zIndex: 5, // Ensure it appears above total
};

const popStyleVisible = {
    opacity: 1,
    transform: 'translateX(-50%) translateY(-15px)', // Float up further
};

function TotalDisplay({ totalPrice, priceDifference }) {
  const [showPop, setShowPop] = useState(false);
  const [popText, setPopText] = useState('');

  // Effect to trigger the pop animation
  useEffect(() => {
    if (priceDifference !== 0) {
      const sign = priceDifference > 0 ? '+' : '-';
      setPopText(`${sign}${Math.abs(priceDifference)} SEK`);
      setShowPop(true);

      const timer = setTimeout(() => {
        setShowPop(false);
      }, 1200); // Duration pop is visible

      return () => clearTimeout(timer);
    }
  }, [priceDifference, totalPrice]); // Depend on totalPrice too to re-trigger if diff is same but price changed?

  const popStyle = {
      ...popStyleBase,
      ...(showPop ? popStyleVisible : {}),
      color: priceDifference > 0 ? '#28a745' : '#dc3545', // Green for +, Red for -
      backgroundColor: priceDifference > 0 ? 'rgba(40, 167, 69, 0.1)' : 'rgba(220, 53, 69, 0.1)',
  };

  return (
    <div className="total-section" style={{ position: 'relative' }}>
      {showPop && (
        <span style={popStyle}>
            {popText}
        </span>
      )}
      Total: 
      <span>
        <CountUp 
          start={0}
          end={totalPrice}
          duration={0.5}
          separator=" "
          decimals={0}
          preserveValue={true}
        />
      </span> SEK
    </div>
  );
}

export default TotalDisplay; 