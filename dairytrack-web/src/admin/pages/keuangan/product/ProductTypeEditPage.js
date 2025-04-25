import { useEffect, useState } from "react";
import {
  getProductTypeById,
  updateProductType,
} from "../../../../api/keuangan/productType";
import { showAlert } from "../../../../admin/pages/keuangan/utils/alert";
import { useTranslation } from "react-i18next";

const ProductTypeEditModal = ({ productId, onClose, onProductUpdated }) => {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [newImage, setNewImage] = useState(null);
  const { t, i18n } = useTranslation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getProductTypeById(productId);
        // Konversi price dari string ke number untuk input type="number"
        setForm({
          ...res,
          price: parseFloat(res.price) || 0,
          unit: res.unit.toLowerCase(), // Normalisasi unit ke huruf kecil
        });
        if (res.image) {
          setImagePreview(res.image);
        }
      } catch (err) {
        console.error("Error fetching product type:", err);
        setError(
          t("product.error_fetching_data") ||
            "Gagal mengambil data tipe produk."
        );
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchData();
    }

    // Cleanup URL objek untuk mencegah memory leak
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [productId, t]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validasi ukuran file (misalnya, maks 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError(
          t("product.image_too_large") ||
            "Ukuran gambar terlalu besar (maks 5MB)."
        );
        return;
      }
      setNewImage(file);
      // Buat URL pratinjau
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
    setError("");

    try {
      const formData = new FormData();
      formData.append("product_name", form.product_name);
      formData.append("product_description", form.product_description);
      formData.append("price", Number(form.price));
      formData.append("unit", form.unit.toLowerCase()); // Normalisasi unit

      // Tambahkan gambar hanya jika ada gambar baru
      if (newImage) {
        formData.append("image", newImage);
      }

      await updateProductType(productId, formData);

      await showAlert({
        type: "success",
        title: t("product.success") || "Berhasil",
        text:
          t("product.product_updated") || "Tipe produk berhasil diperbarui.",
      });

      if (onProductUpdated) {
        onProductUpdated();
      }
    } catch (err) {
      console.error("Error updating product type:", err);
      const errorMessage =
        t("product.error_updating") ||
        "Gagal memperbarui data tipe produk: " + (err.message || "");
      setError(errorMessage);

      await showAlert({
        type: "error",
        title: t("product.error") || "Gagal Memperbarui",
        text: errorMessage,
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
        paddingTop: "3rem",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1050,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        overflow: "auto",
      }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title text-info fw-bold">
              {t("product.edit_product_type") || "Edit Tipe Produk"}
            </h4>
            <button
              className="btn-close"
              onClick={onClose}
              disabled={submitting}
              aria-label={t("product.close") || "Tutup"}
            ></button>
          </div>
          <div className="modal-body">
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
            {loading || !form ? (
              <div className="text-center py-4">
                <div className="spinner-border text-info" role="status">
                  <span className="visually-hidden">
                    {t("product.loading") || "Memuat..."}
                  </span>
                </div>
                <p className="mt-2">
                  {t("product.loading_product_type") || "Memuat tipe produk..."}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="row">
                  {/* Product Name */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">
                      {t("product.product_name") || "Nama Produk"}
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
                      {t("product.price") || "Harga"}
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={form.price || ""}
                      onChange={handleChange}
                      className="form-control"
                      disabled={submitting}
                      min="0"
                      step="0.01"
                      required
                    />
                    <div className="form-text text-muted mt-1">
                      {t("product.total") || "Total"}:{" "}
                      {formatRupiah(form.price)}
                    </div>
                  </div>
                  {/* Unit */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">
                      {t("product.unit") || "Satuan"}
                    </label>
                    <select
                      name="unit"
                      value={form.unit || ""}
                      onChange={handleChange}
                      className="form-control"
                      disabled={submitting}
                      required
                    >
                      <option value="">
                        {t("product.select_unit") || "-- Pilih Satuan --"}
                      </option>
                      <option value="bottle">
                        {t("product.bottle") || "Botol"}
                      </option>
                      <option value="liter">
                        {t("product.liter") || "Liter"}
                      </option>
                      <option value="pcs">{t("product.pcs") || "Pcs"}</option>
                      <option value="kilogram">
                        {t("product.kilogram") || "Kilogram"}
                      </option>
                    </select>
                  </div>
                  {/* Description */}
                  <div className="col-12 mb-3">
                    <label className="form-label fw-semibold">
                      {t("product.product_description") || "Deskripsi Produk"}
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
                        {t("product.current_image") || "Gambar Saat Ini"}
                      </label>
                      <div className="text-center mb-2">
                        <img
                          src={imagePreview}
                          alt={form.product_name || "Product Preview"}
                          style={{ maxHeight: "200px", maxWidth: "100%" }}
                          className="border rounded"
                          onError={(e) =>
                            (e.target.src = "/placeholder-image.jpg")
                          }
                        />
                      </div>
                    </div>
                  )}
                  {/* Image Upload */}
                  <div className="col-12 mb-3">
                    <label className="form-label fw-semibold">
                      {t("product.change_image") || "Ubah Gambar (Opsional)"}
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
                      {t("product.leave_blank") ||
                        "Biarkan kosong untuk tidak mengubah gambar."}
                    </small>
                  </div>
                </div>
                <button
                  type="submit"
                  className="btn btn-info w-100 fw-semibold"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      {t("product.updating") || "Memperbarui..."}
                    </>
                  ) : (
                    t("product.update_data") || "Perbarui Data"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductTypeEditModal;
