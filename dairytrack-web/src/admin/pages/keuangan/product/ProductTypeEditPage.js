import { useEffect, useState } from "react";
import {
  getProductTypeById,
  updateProductType,
} from "../../../../api/keuangan/productType";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";


const ProductTypeEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [newImage, setNewImage] = useState(null);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getProductTypeById(id);
        setForm(res);
        if (res.image_url) {
          setImagePreview(res.image_url);
        }
      } catch (err) {
        console.error("Error fetching product type:", err);
        setError("Gagal mengambil data tipe produk.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImage(file);
      // Create a preview URL for the selected image
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const formatRupiah = (number) => {
    if (!number || isNaN(number)) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("product_name", form.product_name);
      formData.append("product_description", form.product_description);
      formData.append("price", Number(form.price));
      formData.append("unit", form.unit);

      // Only append image if a new one was selected
      if (newImage) {
        formData.append("image", newImage);
      }

      await updateProductType(id, formData);
      navigate("/admin/keuangan/type-product");
    } catch (err) {
      console.error("Error updating product type:", err);
      setError("Gagal memperbarui data tipe produk: " + err.message);
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
            <h4 className="modal-title text-info fw-bold">{t('product.edit_product_type')}
            </h4>
            <button
              className="btn-close"
              onClick={() => navigate("/admin/keuangan/type-product")}
              disabled={submitting}
            ></button>
          </div>
          <div className="modal-body">
            {error && <p className="text-danger text-center">{error}</p>}
            {loading || !form ? (
              <p className="text-center">{t('product.loading_product_type')}
...</p>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="row">
                  {/* Product Name */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">
                    {t('product.product_name')}

                    </label>
                    <input
                      type="text"
                      name="product_name"
                      value={form.product_name || ""}
                      onChange={handleChange}
                      className="form-control"
                      disabled={submitting}
                      required
                    />
                  </div>

                  {/* Price */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">
                    {t('product.price_per_unit')}

                    </label>
                    <input
                      type="number"
                      name="price"
                      value={form.price || ""}
                      onChange={handleChange}
                      className="form-control"
                      disabled={submitting}
                      required
                    />
                    <div className="form-text text-muted mt-1">
                      Total: {formatRupiah(form.price)}
                    </div>
                  </div>

                  {/* Unit */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">{t('product.unit')}
                    </label>
                    <select
                      name="unit"
                      value={form.unit || ""}
                      onChange={handleChange}
                      className="form-control"
                      disabled={submitting}
                      required
                    >
                      <option value="">-- {t('product.select_unit')}
                      --</option>
                      <option value="bottle">{t('product.bottle')}
                      </option>
                      <option value="liter">{t('product.liter')}
                      </option>
                      <option value="pcs">{t('product.pcs')}
                      </option>
                      <option value="kilogram">{t('product.kilogram')}
                      </option>
                    </select>
                  </div>
                  {/* Description */}
                  <div className="col-12 mb-3">
                    <label className="form-label fw-semibold">
                    {t('product.product_description')}

                    </label>
                    <textarea
                      name="product_description"
                      value={form.product_description || ""}
                      onChange={handleChange}
                      className="form-control"
                      disabled={submitting}
                      rows="3"
                      required
                    ></textarea>
                  </div>

                  {/* Current Image Preview */}
                  {imagePreview && (
                    <div className="col-12 mb-3">
                      <label className="form-label fw-semibold">
                      {t('product.current_image')}

                      </label>
                      <div className="text-center mb-2">
                        <img
                          src={imagePreview}
                          alt="Product Preview"
                          style={{ maxHeight: "200px", maxWidth: "100%" }}
                          className="border rounded"
                        />
                      </div>
                    </div>
                  )}

                  {/* Image Upload */}
                  <div className="col-12 mb-3">
                    <label className="form-label fw-semibold">
                    {t('product.change_image_optional')}

                    </label>
                    <input
                      type="file"
                      name="image"
                      onChange={handleFileChange}
                      className="form-control"
                      disabled={submitting}
                      accept="image/*"
                    />
                    <small className="text-muted">
                    {t('product.leave_blank')}

                    </small>
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

export default ProductTypeEditPage;
