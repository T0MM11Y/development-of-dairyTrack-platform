// PemesananComponents/ProductList.jsx
import React from "react";

const ProductList = ({ 
  orderItems, 
  availableProducts, 
  formatPrice, 
  removeOrderItem, 
  incrementItemQuantity, 
  decrementItemQuantity 
}) => {
  if (orderItems.length === 0) return null;

  return (
    <div className="mt-3">
      <h6>Daftar Item:</h6>
      <ul className="list-group">
        {orderItems.map((item, index) => {
          const product = availableProducts.find(
            p => p.product_type === item.product_type
          );
          return (
            <li
              key={index}
              className="list-group-item d-flex align-items-center"
            >
              {product?.image && (
                <img
                  src={product.image}
                  alt={product.product_name}
                  style={{
                    width: "50px",
                    height: "50px",
                    objectFit: "cover",
                    marginRight: "15px",
                    borderRadius: "5px",
                  }}
                  onError={(e) => {
                    e.target.src = "/path/to/fallback-image.jpg"; // Gambar fallback jika gagal
                  }}
                />
              )}
              <div className="flex-grow-1">
                {product?.product_name} - {formatPrice(product?.price || 0)}
              </div>
              
              {/* Control quantity buttons */}
              <div className="d-flex align-items-center me-3">
                <button 
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => decrementItemQuantity(index)}
                >
                  -
                </button>
                <span className="mx-2">{item.quantity}</span>
                <button 
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => incrementItemQuantity(index)}
                >
                  +
                </button>
              </div>
              
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => removeOrderItem(index)}
              >
                Hapus
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ProductList;