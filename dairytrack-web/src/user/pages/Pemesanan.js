import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./ContactUs.css";

const Pemesanan = () => {
  const [quantity, setQuantity] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);

  // Daftar produk dengan harga
  const products = [
    {
      value: "susu-segar-full-cream",
      label: "Susu Segar Full Cream - Rp 30.000",
      price: 30000,
    },
    {
      value: "susu-pasteurisasi",
      label: "Susu Pasteurisasi - Rp 25.000",
      price: 25000,
    },
    {
      value: "yogurt-rasa-buah",
      label: "Yogurt Rasa Buah - Rp 20.000",
      price: 20000,
    },
    {
      value: "keju-mozzarella-cheddar",
      label: "Keju Mozzarella & Cheddar - Rp 40.000",
      price: 40000,
    },
    {
      value: "susu-rendah-lemak",
      label: "Susu Rendah Lemak - Rp 35.000",
      price: 35000,
    },
    {
      value: "susu-sapi-organik",
      label: "Susu Sapi Organik - Rp 50.000",
      price: 50000,
    },
  ];

  // Update total pembayaran
  const updateTotal = () => {
    const product = products.find((p) => p.value === selectedProduct);
    const productPrice = product ? product.price : 0;
    const newSubtotal = productPrice * quantity;
    const newTotal = newSubtotal

    setSubtotal(newSubtotal);
    setTotal(newTotal);
  };

  // Efek untuk memperbarui total saat quantity, selectedProduct
  useEffect(() => {
    updateTotal();
  }, [quantity, selectedProduct]);

  // Handler untuk increment dan decrement jumlah
  const handleIncrement = () => setQuantity(quantity + 1);
  const handleDecrement = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };


  // Function to format price in Rupiah
  const formatPrice = (price) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <>
      {/* Breadcrumb Section */}
      <section className="breadcrumb__wrap">
        <div className="container custom-container">
          <div className="row justify-content-center">
            <div className="col-xl-6 col-lg-8 col-md-10">
              <div className="breadcrumb__wrap__content">
                <h2 className="title">Pemesanan</h2>
                <nav aria-label="breadcrumb">
                  <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/">Home</Link>
                    </li>
                    <li className="breadcrumb-item">
                      <Link to="/products">Products</Link>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">
                      Pemesanan
                    </li>
                  </ol>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <div className="breadcrumb_wrap_icon">
        <ul>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
        </ul>
      </div>
      
      <div className="app-icon Pakan"></div>
      <div className="app-icon Kesehatan"></div>
      <div className="app-icon Susu"></div>
      <div className="app-icon Keuangan"></div>
      <div className="app-icon Sapi"></div>
      <div className="app-icon Ternak"></div>
      
      <div className="contact-container">
        {/* Container untuk peta dan form */}
        <div className="map-form-container">
          {/* Peta Lokasi */}
          <div className="contact-map">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3985.955655519632!2d98.6253594!3d2.2886875!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x302e0787e9196b01%3A0x67392c0157f55171!7JQG%2BF4H%2C%20Aek%20Nauli%20I%2C%20Kec.%20Pollung%2C%20Kabupaten%20Humbang%20Hasundutan%2C%20Sumatera%20Utara%2022456!5e0!3m2!1sen!2sid!4v1684305845722!5m2!1sen!2sid"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              title="Peta Pollung Humbang Hasundutan"
            ></iframe>
          </div>
          
          {/* Formulir Pemesanan diposisikan di atas peta */}
          <div className="contact-form-container" style={{ height: "auto", minHeight: "650px" }}>
            <h3 className="text-center mb-4">Form Pemesanan Produk</h3>
            <form className="order-form">
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
                  />
                </div>
                <div className="col-12">
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    className="form-control"
                    placeholder="Nomor Telepon"
                  />
                </div>
                <div className="col-12">
                  <textarea
                    id="address"
                    name="address"
                    rows="3"
                    required
                    className="form-control"
                    placeholder="Alamat Lengkap"
                  ></textarea>
                </div>
              </div>

              {/* Order Details Section */}
              <div className="mb-3">
                <select
                  id="product"
                  name="product"
                  required
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="form-select mb-3"
                >
                  <option value="" disabled>
                    Pilih produk
                  </option>
                  {products.map((product) => (
                    <option key={product.value} value={product.value}>
                      {product.label}
                    </option>
                  ))}
                </select>
                
                <div className="input-group mb-3">
                  <button
                    type="button"
                    onClick={handleDecrement}
                    className="btn btn-outline-secondary"
                  >
                    <i className="fas fa-minus"></i>
                  </button>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
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
                
                <textarea
                  id="notes"
                  name="notes"
                  rows="2"
                  className="form-control mb-3"
                  placeholder="Catatan Tambahan"
                ></textarea>
              </div>
              
              {/* Order Summary */}
              {selectedProduct && (
                <div className="mb-3 p-3 bg-light rounded">
                  <h5 className="fw-bold mb-2">Ringkasan Pesanan</h5>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Subtotal:</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="d-flex justify-content-between fw-bold">
                    <span>Total:</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>
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
              >
                <i className="fas fa-paper-plane me-2"></i>
                Kirim Pesanan
              </button>
            </form>
          </div>
        </div>
        
        {/* Header */}
        <h2 className="contact-header">Hubungi Kami</h2>
        
        {/* Informasi Kontak */}
        <div className="contact-info-container">
          <div className="contact-info-box">
            <i className="fas fa-map-marker-alt"></i>
            <h3>Alamat</h3>
            <p>Pollung, Humbang Hasundutan, Sumatera Utara, Indonesia</p>
          </div>
          <div className="contact-info-box">
            <i className="fas fa-phone"></i>
            <h3>Telepon</h3>
            <p>+62 123 456 7890</p>
          </div>
          <div className="contact-info-box">
            <i className="fas fa-envelope"></i>
            <h3>Email</h3>
            <p>info@pollung.com</p>
          </div>
        </div>
        
        {/* Footer */}
        <div className="contact-footer">
          <p>Ada pertanyaan? Jangan ragu untuk menghubungi kami.</p>
          <p>
            <strong>Terima Kasih!!!</strong>
          </p>
        </div>
      </div>
    </>
  );
};

export default Pemesanan;