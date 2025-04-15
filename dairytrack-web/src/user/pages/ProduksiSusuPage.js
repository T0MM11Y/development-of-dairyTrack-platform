import React, { useState, useEffect } from "react";

const ProduksiSusuPage = () => {
  const [quantity, setQuantity] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [subtotal, setSubtotal] = useState(0);
  const [shipping, setShipping] = useState(15000); // Default biaya pengiriman (Reguler)
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
    const newTotal = newSubtotal + shipping;

    setSubtotal(newSubtotal);
    setTotal(newTotal);
  };

  // Efek untuk memperbarui total saat quantity, selectedProduct, atau shipping berubah
  useEffect(() => {
    updateTotal();
  }, [quantity, selectedProduct, shipping]);

  // Handler untuk increment dan decrement jumlah
  const handleIncrement = () => setQuantity(quantity + 1);
  const handleDecrement = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  // Handler untuk metode pengiriman
  const handleDeliveryChange = (e) => {
    const deliveryType = e.target.value;
    setShipping(deliveryType === "regular" ? 15000 : 30000); // Reguler: Rp 15.000, Express: Rp 30.000
  };

  return (
    <div className="bg-light min-vh-100">
      <div className="container py-5">
        {/* Header Section */}
        <div className="text-center mb-5">
          <p className="lead text-muted">
            Silahkan isi form berikut untuk memesan produk kami. Tim kami akan
            segera menghubungi Anda.
          </p>
        </div>

        {/* Form Container */}
        <div className="card shadow">
          <div className="row g-0">
            {/* Left Side - Illustration */}
            <div className="col-md-6 d-none d-md-block bg-primary text-white p-4 d-flex flex-column justify-content-center">
              <div className="text-center mb-4">
                <i className="fas fa-box-open fa-3x mb-3"></i>
                <h2 className="h4 fw-bold mb-2">Pesan Sekarang</h2>
                <p className="small">
                  Dapatkan produk berkualitas dengan pelayanan terbaik dari kami
                </p>
              </div>
              <img
                src="https://cdn-icons-png.flaticon.com/512/3976/3976626.png"
                alt="Order Illustration"
                className="img-fluid mx-auto"
                style={{ maxWidth: "200px" }}
              />
            </div>

            {/* Right Side - Form */}
            <div className="col-md-6 p-4">
              <form id="orderForm">
                {/* Personal Information Section */}
                <div className="mb-4">
                  <h3 className="h5 fw-bold mb-4">
                    <i className="fas fa-user-circle text-primary me-2"></i>
                    Informasi Pribadi
                  </h3>
                  <div className="row g-3">
                    <div className="col-sm-6">
                      <label htmlFor="firstName" className="form-label">
                        Nama Depan
                      </label>
                      <div className="input-group">
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          required
                          className="form-control"
                          placeholder="John"
                        />
                        <span className="input-group-text">
                          <i className="fas fa-user"></i>
                        </span>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <label htmlFor="lastName" className="form-label">
                        Nama Belakang
                      </label>
                      <div className="input-group">
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          required
                          className="form-control"
                          placeholder="Doe"
                        />
                        <span className="input-group-text">
                          <i className="fas fa-user"></i>
                        </span>
                      </div>
                    </div>
                    <div className="col-12">
                      <label htmlFor="email" className="form-label">
                        Email
                      </label>
                      <div className="input-group">
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          className="form-control"
                          placeholder="johndoe@example.com"
                        />
                        <span className="input-group-text">
                          <i className="fas fa-envelope"></i>
                        </span>
                      </div>
                    </div>
                    <div className="col-12">
                      <label htmlFor="phone" className="form-label">
                        Nomor Telepon
                      </label>
                      <div className="input-group">
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          required
                          className="form-control"
                          placeholder="081234567890"
                        />
                        <span className="input-group-text">
                          <i className="fas fa-phone"></i>
                        </span>
                      </div>
                    </div>
                    <div className="col-12">
                      <label htmlFor="address" className="form-label">
                        Alamat Lengkap
                      </label>
                      <div className="input-group">
                        <textarea
                          id="address"
                          name="address"
                          rows="3"
                          required
                          className="form-control"
                          placeholder="Jl. Contoh No. 123, Kota, Provinsi"
                        ></textarea>
                        <span className="input-group-text">
                          <i className="fas fa-map-marker-alt"></i>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Details Section */}
                <div className="mb-4">
                  <h3 className="h5 fw-bold mb-4">
                    <i className="fas fa-shopping-cart text-primary me-2"></i>
                    Detail Pesanan
                  </h3>
                  <div className="mb-3">
                    <label htmlFor="product" className="form-label">
                      Pilih Produk
                    </label>
                    <select
                      id="product"
                      name="product"
                      required
                      value={selectedProduct}
                      onChange={(e) => setSelectedProduct(e.target.value)}
                      className="form-select"
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
                  </div>
                  <div className="mb-3">
                    <label htmlFor="quantity" className="form-label">
                      Jumlah
                    </label>
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
                        id="quantity"
                        name="quantity"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        className="form-control text-center"
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
                  <div>
                    <label htmlFor="notes" className="form-label">
                      Catatan Tambahan
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      rows="2"
                      className="form-control"
                      placeholder="Catatan khusus untuk pesanan Anda..."
                    ></textarea>
                  </div>
                </div>
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
                      className="text-primary text-decoration-underline"
                    >
                      syarat dan ketentuan
                    </a>{" "}
                    yang berlaku
                  </label>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 d-flex align-items-center justify-content-center"
                >
                  <i className="fas fa-paper-plane me-2"></i>
                  Kirim Pesanan
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProduksiSusuPage;
