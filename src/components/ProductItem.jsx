import React from 'react';

function ProductItem({ product, isSelected, onSelectionChange }) {

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

  return (
    <div className="product-item"> {/* Added wrapper div if needed */} 
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
          src={`/${product.imgSrc}`} 
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