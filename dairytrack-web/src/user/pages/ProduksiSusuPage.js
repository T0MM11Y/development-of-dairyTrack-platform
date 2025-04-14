import React, { useState, useEffect } from "react";

const ProduksiSusuPage = () => {
  const [quantity, setQuantity] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [subtotal, setSubtotal] = useState(0);
  const [shipping, setShipping] = useState(15000); // Default biaya pengiriman (Reguler)
  const [total, setTotal] = useState(0);

  // Daftar produk dengan harga
  const products = [
    { value: "susu-segar-full-cream", label: "Susu Segar Full Cream - Rp 30.000", price: 30000 },
    { value: "susu-pasteurisasi", label: "Susu Pasteurisasi - Rp 25.000", price: 25000 },
    { value: "yogurt-rasa-buah", label: "Yogurt Rasa Buah - Rp 20.000", price: 20000 },
    { value: "keju-mozzarella-cheddar", label: "Keju Mozzarella & Cheddar - Rp 40.000", price: 40000 },
    { value: "susu-rendah-lemak", label: "Susu Rendah Lemak - Rp 35.000", price: 35000 },
    { value: "susu-sapi-organik", label: "Susu Sapi Organik - Rp 50.000", price: 50000 },
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-indigo-800 mb-3">Form Pemesanan</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Silahkan isi form berikut untuk memesan produk kami. Tim kami akan segera menghubungi Anda.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between items-center mb-12 px-4 sm:px-16">
          <div className="step flex flex-col items-center relative">
            <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold mb-2 z-10">
              1
            </div>
            <span className="text-sm font-medium text-indigo-600">Informasi Pribadi</span>
            <div className="absolute h-1 w-full bg-indigo-200 top-6 left-1/2 -z-[1]"></div>
          </div>
          <div className="step flex flex-col items-center relative">
            <div className="w-12 h-12 rounded-full bg-indigo-200 text-gray-700 flex items-center justify-center font-bold mb-2 z-10">
              2
            </div>
            <span className="text-sm font-medium text-gray-500">Detail Pesanan</span>
            <div className="absolute h-1 w-full bg-indigo-200 top-6 left-1/2 -z-[1]"></div>
          </div>
          <div className="step flex flex-col items-center relative">
            <div className="w-12 h-12 rounded-full bg-indigo-200 text-gray-700 flex items-center justify-center font-bold mb-2 z-10">
              3
            </div>
            <span className="text-sm font-medium text-gray-500">Pembayaran</span>
          </div>
        </div>

        {/* Form Container */}
        <div className="form-container max-w-4xl mx-auto bg-white rounded-xl overflow-hidden shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left Side - Illustration */}
            <div className="hidden md:block bg-gradient-to-br from-indigo-500 to-blue-600 p-8 flex flex-col justify-center">
              <div className="text-center text-white mb-8">
                <i className="fas fa-box-open text-6xl mb-4 animate-bounce"></i>
                <h2 className="text-2xl font-bold mb-2">Pesan Sekarang</h2>
                <p className="opacity-90">Dapatkan produk berkualitas dengan pelayanan terbaik dari kami</p>
              </div>
              <img
                src="https://cdn-icons-png.flaticon.com/512/3976/3976626.png"
                alt="Order Illustration"
                className="w-full max-w-xs mx-auto"
              />
            </div>

            {/* Right Side - Form */}
            <div className="p-8">
              <form id="orderForm">
                {/* Personal Information Section */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                    <i className="fas fa-user-circle text-indigo-600 mr-2"></i>
                    Informasi Pribadi
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                        Nama Depan
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          required
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent input-focus transition duration-200"
                          placeholder="John"
                        />
                        <i className="fas fa-user absolute right-3 top-3.5 text-gray-400"></i>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                        Nama Belakang
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          required
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent input-focus transition duration-200"
                          placeholder="Doe"
                        />
                        <i className="fas fa-user absolute right-3 top-3.5 text-gray-400"></i>
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent input-focus transition duration-200"
                          placeholder="johndoe@example.com"
                        />
                        <i className="fas fa-envelope absolute right-3 top-3.5 text-gray-400"></i>
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Nomor Telepon
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          required
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent input-focus transition duration-200"
                          placeholder="081234567890"
                        />
                        <i className="fas fa-phone absolute right-3 top-3.5 text-gray-400"></i>
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                        Alamat Lengkap
                      </label>
                      <div className="relative">
                        <textarea
                          id="address"
                          name="address"
                          rows="3"
                          required
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent input-focus transition duration-200"
                          placeholder="Jl. Contoh No. 123, Kota, Provinsi"
                        ></textarea>
                        <i className="fas fa-map-marker-alt absolute right-3 top-3.5 text-gray-400"></i>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Details Section */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                    <i className="fas fa-shopping-cart text-indigo-600 mr-2"></i>
                    Detail Pesanan
                  </h3>

                  <div className="space-y-6">
                    <div>
                      <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-1">
                        Pilih Produk
                      </label>
                      <div className="relative">
                        <select
                          id="product"
                          name="product"
                          required
                          value={selectedProduct}
                          onChange={(e) => setSelectedProduct(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent input-focus appearance-none transition duration-200"
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
                        <i className="fas fa-chevron-down absolute right-3 top-3.5 text-gray-400 pointer-events-none"></i>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                        Jumlah
                      </label>
                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={handleDecrement}
                          className="bg-gray-200 px-3 py-2 rounded-l-lg hover:bg-gray-300 transition"
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
                          className="w-full px-4 py-2 border-t border-b border-gray-300 text-center focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={handleIncrement}
                          className="bg-gray-200 px-3 py-2 rounded-r-lg hover:bg-gray-300 transition"
                        >
                          <i className="fas fa-plus"></i>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Metode Pengiriman</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <input
                            type="radio"
                            id="delivery1"
                            name="delivery"
                            value="regular"
                            className="hidden peer"
                            defaultChecked
                            onChange={handleDeliveryChange}
                          />
                          <label
                            htmlFor="delivery1"
                            className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer peer-checked:border-indigo-500 peer-checked:bg-indigo-50 transition"
                          >
                            <i className="fas fa-truck text-indigo-600 mr-3"></i>
                            <div>
                              <div className="font-medium">Reguler</div>
                              <div className="text-sm text-gray-500">3-5 hari kerja</div>
                            </div>
                          </label>
                        </div>
                        <div>
                          <input
                            type="radio"
                            id="delivery2"
                            name="delivery"
                            value="express"
                            className="hidden peer"
                            onChange={handleDeliveryChange}
                          />
                          <label
                            htmlFor="delivery2"
                            className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer peer-checked:border-indigo-500 peer-checked:bg-indigo-50 transition"
                          >
                            <i className="fas fa-bolt text-indigo-600 mr-3"></i>
                            <div>
                              <div className="font-medium">Express</div>
                              <div className="text-sm text-gray-500">1-2 hari kerja</div>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                        Catatan Tambahan
                      </label>
                      <textarea
                        id="notes"
                        name="notes"
                        rows="2"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent input-focus transition duration-200"
                        placeholder="Catatan khusus untuk pesanan Anda..."
                      ></textarea>
                    </div>
                  </div>
                </div>

                {/* Payment Section */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                    <i className="fas fa-credit-card text-indigo-600 mr-2"></i>
                    Metode Pembayaran
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                    <div>
                      <input
                        type="radio"
                        id="payment1"
                        name="payment"
                        value="bank"
                        className="hidden peer"
                        defaultChecked
                      />
                      <label
                        htmlFor="payment1"
                        className="flex flex-col items-center p-3 border border-gray-300 rounded-lg cursor-pointer peer-checked:border-indigo-500 peer-checked:bg-indigo-50 transition"
                      >
                        <i className="fas fa-university text-2xl text-indigo-600 mb-2"></i>
                        <div className="font-medium">Transfer Bank</div>
                      </label>
                    </div>
                    <div>
                      <input
                        type="radio"
                        id="payment2"
                        name="payment"
                        value="ewallet"
                        className="hidden peer"
                      />
                      <label
                        htmlFor="payment2"
                        className="flex flex-col items-center p-3 border border-gray-300 rounded-lg cursor-pointer peer-checked:border-indigo-500 peer-checked:bg-indigo-50 transition"
                      >
                        <i className="fas fa-wallet text-2xl text-indigo-600 mb-2"></i>
                        <div className="font-medium">E-Wallet</div>
                      </label>
                    </div>
                    <div>
                      <input
                        type="radio"
                        id="payment3"
                        name="payment"
                        value="cod"
                        className="hidden peer"
                      />
                      <label
                        htmlFor="payment3"
                        className="flex flex-col items-center p-3 border border-gray-300 rounded-lg cursor-pointer peer-checked:border-indigo-500 peer-checked:bg-indigo-50 transition"
                      >
                        <i className="fas fa-money-bill-wave text-2xl text-indigo-600 mb-2"></i>
                        <div className="font-medium">COD</div>
                      </label>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium" id="subtotal">
                        Rp {subtotal.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Biaya Pengiriman</span>
                      <span className="font-medium" id="shipping">
                        Rp {shipping.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-indigo-700 pt-2 border-t border-gray-200">
                      <span>Total Pembayaran</span>
                      <span id="total">Rp {total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Terms and Submit */}
                <div className="flex items-start mb-6">
                  <input
                    type="checkbox"
                    id="terms"
                    name="terms"
                    required
                    className="mt-1 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                    Saya menyetujui{" "}
                    <a href="#" className="text-indigo-600 hover:underline">
                      syarat dan ketentuan
                    </a>{" "}
                    yang berlaku
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center"
                >
                  <i className="fas fa-paper-plane mr-2"></i>
                  Kirim Pesanan
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>
            Butuh bantuan? Hubungi kami di{" "}
            <a href="mailto:help@example.com" className="text-indigo-600 hover:underline">
              help@example.com
            </a>{" "}
            atau{" "}
            <a href="tel:+6281234567890" className="text-indigo-600 hover:underline">
              0812-3456-7890
            </a>
          </p>
        </div>
      </div>

      {/* Inline CSS untuk animasi dan font */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

        body {
          font-family: 'Poppins', sans-serif;
        }

        .form-container {
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .input-focus:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
        }

        .animate-bounce {
          animation: bounce 2s infinite;
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(-5px);
          }
          50% {
            transform: translateY(5px);
          }
        }
      `}</style>
    </div>
  );
};

export default ProduksiSusuPage;