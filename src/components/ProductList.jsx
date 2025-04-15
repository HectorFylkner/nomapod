import React from 'react';
import ProductItem from './ProductItem';

function ProductList({ products, selectedProducts, onSelectionChange }) {
  return (
    <div className="product-list">
      {products.map((product, index) => (
        <ProductItem 
          key={product.id}
          product={product}
          index={index}
          isSelected={selectedProducts.includes(product.id)}
          onSelectionChange={onSelectionChange}
        />
      ))}
    </div>
  );
}

export default ProductList; 