import { useState } from "react";
import { createProductType } from "../../../../api/keuangan/productType";
import { showAlert } from "../../../../admin/pages/keuangan/utils/alert";
import { useTranslation } from "react-i18next";


const ProductTypeCreateModal = ({ onClose, onSaved }) => {
  const [form, setForm] = useState({
    product_name: "",
    product_description: "",
    image: null,
    price: "",
    unit: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { t } = useTranslation();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setForm((prev) => ({ ...prev, image: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData();
    formData.append("product_name", form.product_name);
    formData.append("product_description", form.product_description);
    if (form.image) {
      formData.append("image", form.image);
    }
    formData.append("price", Number(form.price));
    formData.append("unit", form.unit);

    try {
      await createProductType(formData);
      await showAlert({
        type: "success",
        title: "Berhasil",
        text: "Tipe produk berhasil disimpan.",
      });

      if (onSaved) onSaved(formData);
      onClose();
    } catch (err) {
      let message = "Gagal menyimpan tipe produk.";
      if (err.response && err.response.data) {
        message = err.response.data.message || message;
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

  const formatRupiah = (number) => {
    if (!number) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
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
      <div
        className="modal-dialog modal-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title text-info fw-bold">
            {t('product.add_product_type')}

            </h4>
            <button
              className="btn-close"
              onClick={onClose}
              disabled={submitting}
            ></button>
          </div>
          <div className="modal-body">
            {error && <p className="text-danger text-center">{error}</p>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-bold">{t('product.product_name')}
                </label>
                <input
                  type="text"
                  name="product_name"
                  value={form.product_name}
                  onChange={handleChange}
                  className="form-control"
                  required
                  disabled={submitting}
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">{t('product.product_description')}
                </label>
                <textarea
                  name="product_description"
                  value={form.product_description}
                  onChange={handleChange}
                  className="form-control"
                  required
                  disabled={submitting}
                ></textarea>
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">{t('product.product_image')}
                </label>
                <input
                  type="file"
                  name="image"
                  onChange={handleFileChange}
                  className="form-control"
                  disabled={submitting}
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">{t('product.price_per_unit')}
                </label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  className="form-control"
                  required
                  disabled={submitting}
                />
                <div className="form-text text-muted mt-1">
                  Total: {formatRupiah(form.price)}
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">{t('product.unit')}
                </label>
                <select
                  name="unit"
                  value={form.unit}
                  onChange={handleChange}
                  className="form-control"
                  required
                  disabled={submitting}
                >
                  <option value="">-- {t('product.select_unit')}
                  --</option>
                  <option value="Bootle">{t('product.bottle')}
                  </option>
                  <option value="Liter">{t('product.liter')}
                  </option>
                  <option value="Pcs">{t('product.pcs')}
                  </option>
                  <option value="Kilogram">{t('product.kilogram')}
                  </option>
                </select>
              </div>
              <button
                type="submit"
                className="btn btn-info w-100"
                disabled={submitting}
              >
                {submitting ? "Menyimpan..." : "Simpan"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductTypeCreateModal;