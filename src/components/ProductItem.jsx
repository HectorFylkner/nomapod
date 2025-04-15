import React from 'react';

function ProductItem({ product, index, isSelected, onSelectionChange }) {

  const handleChange = () => {
    onSelectionChange(product.id, !isSelected);
  };

  // Handle selection via Enter/Space key on the label for accessibility
  const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.code === 'Enter') {
          e.preventDefault();
          handleChange();
      }
  };

  const labelClasses = `product-item-label ${isSelected ? 'selected-product' : ''}`;
  
  // Calculate stagger delay based on index
  const animationDelay = `${index * 0.07}s`; // 70ms delay increment per item

  return (
    // Apply inline style for animation delay to the wrapper
    <div className="product-item" style={{ animationDelay }}> 
      <label htmlFor={product.id} className={labelClasses} tabIndex={0} onKeyDown={handleKeyDown}>
        <input
          type="checkbox"
          id={product.id}
          name="product"
          value={product.price}
          checked={isSelected}
          onChange={handleChange}
          data-name={product.name} // Keep data attribute if needed elsewhere, though props are better
        />
        <img 
          src={`${import.meta.env.BASE_URL}${product.imgSrc}`}
          alt={product.altText} 
          className="product-image" 
          onError={(e) => e.target.style.display = 'none'} // Handle img error
        />
        <span className="product-name">{product.name}</span>
        <span className="product-price">{product.price} SEK</span>
      </label>
    </div>
  );
}

export default ProductItem; 