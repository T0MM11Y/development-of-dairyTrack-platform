import { useEffect, useState } from "react";
import {
  getProductStockById,
  updateProductStock,
} from "../../../../api/keuangan/product";
import { getProductTypes } from "../../../../api/keuangan/productType";
import { showAlert } from "../../../../admin/pages/keuangan/utils/alert";
import { useTranslation } from "react-i18next";


const ProductEditPage = ({ productId, onProductUpdated, onClose }) => {
  const [form, setForm] = useState(null);
  const [productTypes, setProductTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getProductStockById(productId);
        setForm({
          ...res,
          production_at: res.production_at.split("T")[0],
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
      await showAlert({
        type: "success",
        title: "Berhasil",
        text: "Stok produk berhasil diperbarui.",
      });
      onProductUpdated();
    } catch (err) {
      console.error("Error updating product:", err);
      let message = "Gagal memperbarui data produk.";
      if (err.response && err.response.data && err.response.data.error) {
        message = err.response.data.error.replace(/^\['|'\]$/g, "");
      } else {
        message = err.message;
      }
      setError(message);
      await showAlert({
        type: "error",
        title: "Gagal Memperbarui",
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
      <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <h4 id="modalTitle" className="modal-title text-info fw-bold">
            {t('product.edit_product_data')}

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
            {loading || !form ? (
              <div className="text-center py-5">
                <div className="spinner-border text-info" role="status">
                  <span className="visually-hidden">{t('product.loading')}
                  ...</span>
                </div>
                <p className="mt-2">{t('product.loading_product_data')}
                ...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="row">
                  {/* Initial Quantity */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">
                    {t('product.initial_quantity')}

                    </label>
                    <input
                      type="number"
                      name="initial_quantity"
                      value={form.initial_quantity || ""}
                      onChange={handleChange}
                      className="form-control"
                      disabled={submitting}
                      required
                    />
                  </div>

                  {/* Quantity */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">{t('product.quantity')}
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={form.quantity || ""}
                      onChange={handleChange}
                      className="form-control"
                      disabled={submitting}
                      required
                    />
                  </div>

                  {/* Total Milk Used */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">
                    {t('product.total_milk_used')}
                    (L)
                    </label>
                    <input
                      type="number"
                      name="total_milk_used"
                      value={form.total_milk_used || ""}
                      onChange={handleChange}
                      className="form-control"
                      step="0.01"
                      disabled={submitting}
                      required
                    />
                  </div>

                  {/* Status */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">{t('product.status')}
                    </label>
                    <select
                      name="status"
                      value={form.status || ""}
                      onChange={handleChange}
                      className="form-select"
                      disabled={submitting}
                      required
                    >
                      <option value="available">{t('product.available')}
                      </option>
                      <option value="contamination">{t('product.contamination')}
                      </option>
                    </select>
                  </div>

                  {/* Product Type */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">
                    {t('product.product_type')}

                    </label>
                    <select
                      name="product_type"
                      value={form.product_type || ""}
                      onChange={handleChange}
                      className="form-select"
                      disabled={submitting}
                      required
                    >
                      <option value="">-- {t('product.product_type')}
                      --</option>
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
                    {t('product.production_date')}

                    </label>
                    <input
                      type="date"
                      name="production_at"
                      value={form.production_at || ""}
                      onChange={handleChange}
                      className="form-control"
                      disabled={submitting}
                      required
                    />
                  </div>

                  {/* Expiry Date */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">{t('product.expiry_date')}
                    </label>
                    <input
                      type="date"
                      name="expiry_at"
                      value={form.expiry_at || ""}
                      onChange={handleChange}
                      className="form-control"
                      disabled={submitting}
                      required
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
        </div>
      </div>
    </div>
  );
};

export default ProductEditPage;