import { useEffect, useState } from "react";
import {
  getProductStockById,
  updateProductStock,
} from "../../../../api/keuangan/product";
import { getProductTypes } from "../../../../api/keuangan/productType";

const ProductEditPage = ({ productId, onProductUpdated, onClose }) => {
  const [form, setForm] = useState(null);
  const [productTypes, setProductTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getProductStockById(productId);
        setForm({
          ...res,
          production_at: res.production_at.split("T")[0], // Format untuk input date
          expiry_at: res.expiry_at.split("T")[0],
        });

        const typesRes = await getProductTypes();
        setProductTypes(typesRes);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Gagal mengambil data produk.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [productId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const updatedData = {
        initial_quantity: Number(form.initial_quantity),
        quantity: Number(form.quantity),
        total_milk_used: parseFloat(form.total_milk_used).toFixed(2),
        status: form.status,
        product_type: Number(form.product_type),
        production_at: new Date(form.production_at).toISOString(),
        expiry_at: new Date(form.expiry_at).toISOString(),
      };
      await updateProductStock(productId, updatedData);
      onProductUpdated();
    } catch (err) {
      console.error("Error updating product:", err);
      setError("Gagal memperbarui data produk.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="modal-header">
        <h4 className="modal-title text-info fw-bold">Edit Data Produk</h4>
        <button
          className="btn-close"
          onClick={onClose}
          disabled={submitting}
        ></button>
      </div>
      <div className="modal-body">
        {error && <p className="text-danger text-center">{error}</p>}
        {loading || !form ? (
          <p className="text-center">Memuat data produk...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="row">
              {/* Initial Quantity */}
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">
                  Initial Quantity
                </label>
                <input
                  type="number"
                  name="initial_quantity"
                  value={form.initial_quantity || ""}
                  onChange={handleChange}
                  className="form-control"
                  disabled={submitting}
                />
              </div>

              {/* Quantity */}
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  value={form.quantity || ""}
                  onChange={handleChange}
                  className="form-control"
                  disabled={submitting}
                />
              </div>

              {/* Total Milk Used */}
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">
                  Total Milk Used
                </label>
                <input
                  type="number"
                  name="total_milk_used"
                  value={form.total_milk_used || ""}
                  onChange={handleChange}
                  className="form-control"
                  step="0.01"
                  disabled={submitting}
                />
              </div>

              {/* Status */}
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">Status</label>
                <select
                  name="status"
                  value={form.status || ""}
                  onChange={handleChange}
                  className="form-select"
                  disabled={submitting}
                >
                  <option value="available">Available</option>
                  <option value="contamination">Contamination</option>
                </select>
              </div>

              {/* Product Type */}
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">Product Type</label>
                <select
                  name="product_type"
                  value={form.product_type || ""}
                  onChange={handleChange}
                  className="form-select"
                  disabled={submitting}
                >
                  <option value="">-- Pilih Tipe Produk --</option>
                  {productTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.product_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Production Date */}
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">
                  Production Date
                </label>
                <input
                  type="date"
                  name="production_at"
                  value={form.production_at || ""}
                  onChange={handleChange}
                  className="form-control"
                  disabled={submitting}
                />
              </div>

              {/* Expiry Date */}
              <div className="col-md-6 mb-3">
                <label className="form-label fw-semibold">Expiry Date</label>
                <input
                  type="date"
                  name="expiry_at"
                  value={form.expiry_at || ""}
                  onChange={handleChange}
                  className="form-control"
                  disabled={submitting}
                />
              </div>
            </div>
            <button
              type="submit"
              className="btn btn-info w-100 fw-semibold"
              disabled={submitting}
            >
              {submitting ? "Memperbarui..." : "Perbarui Data"}
            </button>
          </form>
        )}
      </div>
    </>
  );
};

export default ProductEditPage;