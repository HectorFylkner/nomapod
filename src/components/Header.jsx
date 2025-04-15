import React from 'react';

function Header() {
  return (
    <img 
      // Prepend BASE_URL to logo source for correct path in deployment
      src={`${import.meta.env.BASE_URL}nomapod.png`} 
      alt="nomapod Logo" 
      className="logo-image" 
    />
  );
}

export default Header; 