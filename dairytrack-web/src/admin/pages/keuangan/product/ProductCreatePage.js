import { useState, useEffect } from "react";
import { createProductStock } from "../../../../api/keuangan/product";
import { getProductTypes } from "../../../../api/keuangan/productType";
import { showAlert } from "../../../../admin/pages/keuangan/utils/alert";

const ProductStockCreateModal = ({ onClose, onProductAdded }) => {
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
        const res = await getProductTypes();
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
      product_type: Number(form.product_type),
      quantity: Number(form.initial_quantity),
    };

    if (!formData.product_type) {
      setError("Tipe produk tidak valid.");
      setSubmitting(false);
      await showAlert({
        type: "error",
        title: "Gagal Menyimpan",
        text: "Tipe produk tidak valid.",
      });
      return;
    }

    try {
      await createProductStock(formData);
      await showAlert({
        type: "success",
        title: "Berhasil",
        text: "Stok produk berhasil disimpan.",
      });

      if (onProductAdded) onProductAdded(formData);
      onClose();
    } catch (err) {
      let message = "Gagal menyimpan stok produk.";
      if (err.response && err.response.data && err.response.data.error) {
        const errorMessage = err.response.data.error;
        message = errorMessage.replace(/^\['|'\]$/g, "");
      } else {
        message = err.message;
      }
      setError(message);
      await showAlert({
        type: "error",
        title: "Gagal Menyimpan",
        text: message,
      });
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
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1050,
      }}
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby="modalTitle"
    >
      <div
        className="modal-dialog modal-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h4 id="modalTitle" className="modal-title text-info fw-bold">
              Tambah Stok Produk
            </h4>
            <button
              className="btn-close"
              onClick={onClose}
              disabled={submitting}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            {error && <p className="text-danger text-center">{error}</p>}
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-info" role="status">
                  <span className="visually-hidden">Memuat...</span>
                </div>
                <p className="mt-2">Memuat data produk...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold">Tipe Produk</label>
                  <select
                    name="product_type"
                    value={form.product_type}
                    onChange={handleChange}
                    className="form-select"
                    required
                    disabled={submitting}
                  >
                    <option value="">-- Pilih Tipe Produk --</option>
                    {productTypes.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.product_name}
                      </option>
                    ))}
                  </select>
                </div>
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
                    disabled={submitting}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">
                    Tanggal & Waktu Produksi
                  </label>
                  <input
                    type="datetime-local"
                    name="production_at"
                    value={form.production_at}
                    onChange={handleChange}
                    className="form-control"
                    required
                    disabled={submitting}
                  />
                </div>
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
                    disabled={submitting}
                  />
                </div>
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
                    disabled={submitting}
                  />
                </div>
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

export default ProductStockCreateModal;
