import React from 'react';
import CountUp from 'react-countup';

// Reverted to simpler version without price pop logic
function TotalDisplay({ totalPrice }) {
  return (
    <div className="total-section">
      Total: 
      <span>
        <CountUp 
          // Using 0 as start simplifies things, CountUp handles changes well
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