// PemesananComponents/OrderSummary.jsx
import React from "react";

const OrderSummary = ({ total, formatPrice }) => {
  return (
    <div className="mb-3 p-3 bg-light rounded">
      <h5 className="fw-bold mb-2">Ringkasan Pesanan</h5>
      <div className="d-flex justify-content-between fw-bold">
        <span>Total:</span>
        <span>{formatPrice(total)}</span>
      </div>
    </div>
  );
};

export default OrderSummary;