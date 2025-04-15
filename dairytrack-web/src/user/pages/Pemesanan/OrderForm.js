// PemesananComponents/OrderForm.jsx
import React, { useState } from "react";
import TermsModal from "./TermsModal";
import ProductList from "./ProductList";
import OrderSummary from "./OrderSummary";

const OrderForm = ({
  form,
  newItem,
  availableProducts,
  subtotal,
  total,
  error,
  submitting,
  formatPrice,
  handleChange,
  handleItemChange,
  handleDecrement,
  handleIncrement,
  addOrderItem,
  removeOrderItem,
  incrementItemQuantity,
  decrementItemQuantity,
  handleSubmit,
}) => {
  const [showTermsModal, setShowTermsModal] = useState(false);

  const openTermsModal = (e) => {
    e.preventDefault();
    setShowTermsModal(true);
  };

  return (
    <div className="contact-form-container" style={{ height: "auto", minHeight: "650px" }}>
      <h3 className="text-center mb-4">Form Pemesanan Produk</h3>
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      <form className="order-form" onSubmit={handleSubmit}>
        {/* Personal Information Section */}
        <div className="row g-3 mb-3">
          <div className="col-sm-6">
            <input
              type="text"
              id="firstName"
              name="firstName"
              required
              className="form-control"
              placeholder="Nama Depan"
            />
          </div>
          <div className="col-sm-6">
            <input
              type="text"
              id="lastName"
              name="lastName"
              required
              className="form-control"
              placeholder="Nama Belakang"
            />
          </div>
          <div className="col-12">
            <input
              type="email"
              id="email"
              name="email"
              required
              className="form-control"
              placeholder="Email Anda"
              value={form.email}
              onChange={handleChange}
            />
          </div>
          <div className="col-12">
            <input
              type="tel"
              id="phone_number"
              name="phone_number"
              required
              className="form-control"
              placeholder="Nomor Telepon"
              value={form.phone_number}
              onChange={handleChange}
            />
          </div>
          <div className="col-12">
            <textarea
              id="location"
              name="location"
              rows="3"
              required
              className="form-control"
              placeholder="Alamat Lengkap"
              value={form.location}
              onChange={handleChange}
            ></textarea>
          </div>
        </div>
        
        {/* Order Details Section */}
        <div className="mb-3">
          <div className="row mb-2">
            <div className="col-md-6">
              <select
                name="product_type"
                value={newItem.product_type}
                onChange={handleItemChange}
                className="form-select"
              >
                <option value="">-- Pilih Produk --</option>
                {availableProducts.map((product) => (
                  <option
                    key={product.product_type}
                    value={product.product_type}
                  >
                    {product.product_name} (Stok: {product.total_quantity}) - {formatPrice(product.price)}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <div className="input-group">
                <button
                  type="button"
                  onClick={handleDecrement}
                  className="btn btn-outline-secondary"
                >
                  <i className="fas fa-minus"></i>
                </button>
                <input
                  type="number"
                  name="quantity"
                  min="1"
                  value={newItem.quantity}
                  onChange={handleItemChange}
                  className="form-control text-center"
                  placeholder="Jumlah"
                />
                <button
                  type="button"
                  onClick={handleIncrement}
                  className="btn btn-outline-secondary"
                >
                  <i className="fas fa-plus"></i>
                </button>
              </div>
            </div>
            <div className="col-md-2">
              <button
                type="button"
                className="btn btn-primary w-100"
                onClick={addOrderItem}
              >
                Tambah
              </button>
            </div>
          </div>
          
          {/* List of added items */}
          <ProductList 
            orderItems={form.order_items}
            availableProducts={availableProducts}
            formatPrice={formatPrice}
            removeOrderItem={removeOrderItem}
            incrementItemQuantity={incrementItemQuantity}
            decrementItemQuantity={decrementItemQuantity}
          />
          
          {/* Notes Section */}
          <div className="mt-3">
            <div className="mb-3">
              <label className="form-label">Catatan Tambahan</label>
              <textarea
                id="notes"
                name="notes"
                rows="2"
                className="form-control"
                placeholder="Catatan Tambahan"
                value={form.notes}
                onChange={handleChange}
              ></textarea>
            </div>
          </div>
        </div>
        
        {/* Order Summary */}
        {form.order_items.length > 0 && (
          <OrderSummary total={total} formatPrice={formatPrice} />
        )}
        
        {/* Terms and Submit */}
        <div className="mb-3 form-check">
          <input
            type="checkbox"
            id="terms"
            name="terms"
            required
            className="form-check-input"
          />
          <label htmlFor="terms" className="form-check-label">
            Saya menyetujui{" "}
            <a
              href="#"
              onClick={openTermsModal}
              className="text-decoration-underline"
            >
              syarat dan ketentuan
            </a>{" "}
            yang berlaku
          </label>
        </div>
        
        <button
          type="submit"
          className="btn btn-primary w-100"
          disabled={submitting}
        >
          <i className="fas fa-paper-plane me-2"></i>
          {submitting ? "Memproses..." : "Kirim Pesanan"}
        </button>
      </form>

      {/* Terms and Conditions Modal */}
      <TermsModal show={showTermsModal} onHide={() => setShowTermsModal(false)} />
    </div>
  );
};

export default OrderForm;