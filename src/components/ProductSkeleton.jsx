import React from 'react';
import './ProductSkeleton.css'; // We'll create this CSS file next

function ProductSkeleton() {
  return (
    <div className="skeleton-item">
      <div className="skeleton skeleton-checkbox"></div>
      <div className="skeleton skeleton-image"></div>
      <div className="skeleton-text-group">
        <div className="skeleton skeleton-text"></div>
        <div className="skeleton skeleton-text skeleton-text-short"></div>
      </div>
      <div className="skeleton skeleton-price"></div>
    </div>
  );
}

export default ProductSkeleton; 