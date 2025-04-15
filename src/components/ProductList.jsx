import React from 'react';
import ProductItem from './ProductItem';

function ProductList({ products, selectedProducts, onSelectionChange }) {
  return (
    <div className="product-list">
      {products.map(product => (
        <ProductItem 
          key={product.id}
          product={product}
          isSelected={selectedProducts.includes(product.id)}
          onSelectionChange={onSelectionChange}
        />
      ))}
    </div>
  );
}

export default ProductList; 