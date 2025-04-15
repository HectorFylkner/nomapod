import React from 'react';
import CountUp from 'react-countup';

function TotalDisplay({ totalPrice }) {
  return (
    <div className="total-section">
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