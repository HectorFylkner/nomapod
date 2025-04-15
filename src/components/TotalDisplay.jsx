import React, { useState, useEffect } from 'react';

function TotalDisplay({ totalPrice }) {
  const [highlight, setHighlight] = useState(false);
  const [prevTotal, setPrevTotal] = useState(totalPrice);

  // Effect to trigger highlight on price change
  useEffect(() => {
    if (totalPrice !== prevTotal) {
      setHighlight(true);
      const timer = setTimeout(() => setHighlight(false), 200); // Duration of highlight
      setPrevTotal(totalPrice);
      return () => clearTimeout(timer);
    }
  }, [totalPrice, prevTotal]);

  const totalStyle = highlight ? { 
    transform: 'scale(1.1)',
    color: 'var(--primary-color)',
    transition: 'transform 0.2s ease, color 0.2s ease'
  } : {
    transition: 'transform 0.2s ease, color 0.2s ease'
  };

  return (
    <div className="total-section">
      Total: <span style={totalStyle}>{totalPrice}</span> SEK
    </div>
  );
}

export default TotalDisplay; 