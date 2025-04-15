import React from 'react';

// Simple CSS spinner matching the button loader
const spinnerStyle = {
    content: "",
    display: 'inline-block',
    width: '20px',
    height: '20px',
    border: '3px solid rgba(78, 93, 108, 0.3)', // Use primary color with alpha
    borderTopColor: 'var(--primary-color)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
};

function LoadingSpinner({ size = '20px' }) {
  // Adjust size if needed via props
  const dynamicStyle = { ...spinnerStyle, width: size, height: size };
  return <div style={dynamicStyle}></div>;
}

export default LoadingSpinner; 