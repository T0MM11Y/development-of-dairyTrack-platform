import { useState, useEffect } from "react";
import { createProductStock } from "../../../../api/keuangan/product";
import { getProductTypes } from "../../../../api/keuangan/productType";
import { useNavigate } from "react-router-dom";

const ProductStockCreatePage = () => {
  const navigate = useNavigate();
  const [productTypes, setProductTypes] = useState([]);
  const [form, setForm] = useState({
    initial_quantity: "",
    production_at: "",
    expiry_at: "",
    total_milk_used: "",
    product_type: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProductTypes = async () => {
      try {
        const res = await getProductTypes(); // Ambil data Product Name dari API
        setProductTypes(res);
      } catch (err) {
        console.error("Gagal mengambil data produk:", err);
        setError("Gagal mengambil data produk.");
      } finally {
        setLoading(false);
      }
    };
    fetchProductTypes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = {
      initial_quantity: Number(form.initial_quantity),
      production_at: new Date(form.production_at).toISOString(),
      expiry_at: new Date(form.expiry_at).toISOString(),
      total_milk_used: parseFloat(form.total_milk_used).toFixed(2),
      status: "available",
      product_type: Number(form.product_type), // Pastikan ini ID yang dikirim
    };

    console.log("Data yang dikirim:", JSON.stringify(formData, null, 2));

    if (!formData.product_type) {
      setError("Tipe produk tidak valid.");
      setSubmitting(false);
      return;
    }

    try {
      await createProductStock(formData);
      navigate("/admin/keuangan/product");
    } catch (err) {
      console.error("Gagal menyimpan data stok produk:", err);
      if (err.response) {
        console.error("Response data:", err.response.data);
      }
      setError("Gagal menyimpan data stok produk: " + err.message);
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
            <h4 className="modal-title text-info fw-bold">
              Tambah Stok Produk
            </h4>
            <button
              className="btn-close"
              onClick={() => navigate("/admin/keuangan/product")}
              disabled={submitting}
            ></button>
          </div>
          <div className="modal-body">
            {error && <p className="text-danger text-center">{error}</p>}
            {loading ? (
              <p className="text-center">Memuat data produk...</p>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Product Type */}
                <div className="mb-3">
                  <label className="form-label fw-bold">Tipe Produk</label>
                  <select
                    name="product_type"
                    value={form.product_type}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="">-- Pilih Tipe Produk --</option>
                    {productTypes.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.product_name} {/* Menampilkan nama produk */}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Initial Quantity */}
                <div className="mb-3">
                  <label className="form-label fw-bold">Jumlah Awal</label>
                  <input
                    type="number"
                    name="initial_quantity"
                    value={form.initial_quantity}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Masukkan jumlah awal"
                    required
                  />
                </div>

                {/* Production Date - Changed to datetime-local */}
                <div className="mb-3">
                  <label className="form-label fw-bold">Tanggal & Waktu Produksi</label>
                  <input
                    type="datetime-local"
                    name="production_at"
                    value={form.production_at}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>

                {/* Expiry Date - Changed to datetime-local */}
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Tanggal & Waktu Kedaluwarsa
                  </label>
                  <input
                    type="datetime-local"
                    name="expiry_at"
                    value={form.expiry_at}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>

                {/* Total Milk Used */}
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Total Susu yang Digunakan (L)
                  </label>
                  <input
                    type="number"
                    name="total_milk_used"
                    value={form.total_milk_used}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Masukkan jumlah susu yang digunakan"
                    step="0.01"
                    required
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="btn btn-info w-100"
                  disabled={submitting}
                >
                  {submitting ? "Menyimpan..." : "Simpan"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductStockCreatePage;