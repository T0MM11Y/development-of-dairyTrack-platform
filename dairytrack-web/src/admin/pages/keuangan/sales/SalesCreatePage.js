import { useState, useEffect } from "react";
import { createOrder } from "../../../../api/keuangan/order";
import { getProductStocks } from "../../../../api/keuangan/product";
import { useNavigate } from "react-router-dom";

const SalesCreatePage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    customer_name: "",
    email: "",
    phone_number: "",
    location: "",
    shipping_cost: "",
    status: "Requested",
    order_items: [],
  });
  const [availableProducts, setAvailableProducts] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [newItem, setNewItem] = useState({ product_type: "", quantity: "" });

  // Fetch available products on mount
  useEffect(() => {
    const loadAvailableStock = async () => {
      try {
        const response = await getProductStocks();
        // Kelompokkan berdasarkan product_type dan ambil data yang diperlukan
        const groupedProducts = response.reduce((acc, product) => {
          if (product.status === "available") {
            const type = product.product_type;
            if (!acc[type]) {
              acc[type] = {
                product_type: type,
                product_name: product.product_type_detail.product_name,
                total_quantity: 0,
                image: product.product_type_detail.image,
              };
            }
            acc[type].total_quantity += product.quantity;
          }
          return acc;
        }, {});
        setAvailableProducts(Object.values(groupedProducts));
      } catch (err) {
        setError("Gagal memuat stok produk: " + err.message);
      }
    };
    loadAvailableStock();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (e) => {
    const { name, value } = e.target;
    setNewItem((prev) => ({ ...prev, [name]: value }));
  };

  const addOrderItem = () => {
    if (!newItem.product_type || !newItem.quantity) {
      setError("Pilih produk dan masukkan jumlah");
      return;
    }

    const selectedProduct = availableProducts.find(
      (p) => p.product_type === parseInt(newItem.product_type)
    );

    if (!selectedProduct) {
      setError("Produk tidak ditemukan");
      return;
    }

    const requestedQuantity = parseInt(newItem.quantity);
    if (selectedProduct.total_quantity < requestedQuantity) {
      setError(
        `Stok ${selectedProduct.product_name} tidak cukup. Tersedia: ${selectedProduct.total_quantity}`
      );
      return;
    }

    // Cek apakah produk dengan product_type yang sama sudah ada
    const existingItemIndex = form.order_items.findIndex(
      (item) => item.product_type === parseInt(newItem.product_type)
    );

    if (existingItemIndex !== -1) {
      // Jika sudah ada, tambahkan quantity-nya
      const updatedItems = [...form.order_items];
      const newQuantity = updatedItems[existingItemIndex].quantity + requestedQuantity;
      
      // Validasi stok lagi setelah penggabungan
      if (selectedProduct.total_quantity < newQuantity) {
        setError(
          `Stok ${selectedProduct.product_name} tidak cukup. Tersedia: ${selectedProduct.total_quantity}`
        );
        return;
      }
      
      updatedItems[existingItemIndex].quantity = newQuantity;
      
      setForm((prev) => ({
        ...prev,
        order_items: updatedItems,
      }));
    } else {
      // Jika belum ada, tambahkan sebagai item baru
      setForm((prev) => ({
        ...prev,
        order_items: [
          ...prev.order_items,
          {
            product_type: parseInt(newItem.product_type),
            quantity: requestedQuantity,
          },
        ],
      }));
    }
    
    setNewItem({ product_type: "", quantity: "" });
    setError("");
  };

  const removeOrderItem = (index) => {
    setForm((prev) => ({
      ...prev,
      order_items: prev.order_items.filter((_, i) => i !== index),
    }));
  };
  
  // Fungsi untuk menambah jumlah item
  const incrementItemQuantity = (index) => {
    const updatedItems = [...form.order_items];
    const currentItem = updatedItems[index];
    const selectedProduct = availableProducts.find(
      (p) => p.product_type === currentItem.product_type
    );
    
    // Cek apakah masih ada stok tersedia
    if (currentItem.quantity + 1 > selectedProduct.total_quantity) {
      setError(
        `Stok ${selectedProduct.product_name} tidak cukup. Tersedia: ${selectedProduct.total_quantity}`
      );
      return;
    }
    
    updatedItems[index].quantity += 1;
    
    setForm((prev) => ({
      ...prev,
      order_items: updatedItems,
    }));
    setError("");
  };
  
  // Fungsi untuk mengurangi jumlah item
  const decrementItemQuantity = (index) => {
    const updatedItems = [...form.order_items];
    const currentItem = updatedItems[index];
    
    if (currentItem.quantity <= 1) {
      // Jika quantity hanya 1, hapus item
      removeOrderItem(index);
      return;
    }
    
    updatedItems[index].quantity -= 1;
    
    setForm((prev) => ({
      ...prev,
      order_items: updatedItems,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    if (form.order_items.length === 0) {
      setError("Tambahkan minimal satu item pesanan");
      setSubmitting(false);
      return;
    }

    const payload = {
      ...form,
      shipping_cost: form.shipping_cost ? parseInt(form.shipping_cost) : undefined,
    };

    try {
      await createOrder(payload);
      navigate("/admin/keuangan/sales");
    } catch (err) {
      setError("Gagal membuat pesanan: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal show d-block"
      style={{
        background: submitting ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.5)",
        minHeight: "100vh",
        paddingTop: "3rem",
      }}
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title text-info fw-bold">Buat Pesanan</h4>
            <button
              className="btn-close"
              onClick={() => navigate("/admin/keuangan/sales")}
              disabled={submitting}
            ></button>
          </div>
          <div className="modal-body">
            {error && <p className="text-danger text-center">{error}</p>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-bold">Nama Pelanggan</label>
                <input
                  type="text"
                  name="customer_name"
                  value={form.customer_name}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">Nomor Telepon</label>
                <input
                  type="tel"
                  name="phone_number"
                  value={form.phone_number}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">Lokasi</label>
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">Biaya Pengiriman</label>
                <input
                  type="number"
                  name="shipping_cost"
                  value={form.shipping_cost}
                  onChange={handleChange}
                  className="form-control"
                  placeholder="Kosongkan jika tidak ada"
                />
              </div>

              {/* Order Items Section */}
              <div className="mb-3">
                <label className="form-label fw-bold">Item Pesanan</label>
                <div className="row mb-2">
                  <div className="col-md-6">
                    <select
                      name="product_type"
                      value={newItem.product_type}
                      onChange={handleItemChange}
                      className="form-control"
                    >
                      <option value="">-- Pilih Produk --</option>
                      {availableProducts.map((product) => (
                        <option
                          key={product.product_type}
                          value={product.product_type}
                        >
                          {product.product_name} (Stok: {product.total_quantity})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-4">
                    <input
                      type="number"
                      name="quantity"
                      value={newItem.quantity}
                      onChange={handleItemChange}
                      className="form-control"
                      placeholder="Jumlah"
                      min="1"
                    />
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
                {form.order_items.length > 0 && (
                  <div className="mt-3">
                    <h6>Daftar Item:</h6>
                    <ul className="list-group">
                      {form.order_items.map((item, index) => {
                        const product = availableProducts.find(
                          (p) => p.product_type === item.product_type
                        );
                        return (
                          <li
                            key={index}
                            className="list-group-item d-flex align-items-center"
                          >
                            <img
                              src={product?.image}
                              alt={product?.product_name}
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
                            <div className="flex-grow-1">
                              {product?.product_name}
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
                )}
              </div>

              <button
                type="submit"
                className="btn btn-info w-100"
                disabled={submitting}
              >
                {submitting ? "Menyimpan..." : "Buat Pesanan"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesCreatePage;