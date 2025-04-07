import { useState } from "react";
import { createProductType } from "../../../../api/keuangan/productType";
import { useNavigate } from "react-router-dom";

const ProductTypeCreatePage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    product_name: "",
    product_description: "",
    image: null,
    price: "",
    unit: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
    formData.append("price", Number(form.price)); // Pastikan price dalam bentuk angka
    formData.append("unit", form.unit);

    // Debugging: Tampilkan data yang dikirim
    for (const pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }

    try {
      await createProductType(formData);
      navigate("/admin/keuangan/type-product");
    } catch (err) {
      console.error("Gagal menyimpan tipe produk:", err);
      setError("Gagal menyimpan tipe produk: " + err.message);
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
              Tambah Tipe Produk
            </h4>
            <button
              className="btn-close"
              onClick={() => navigate("/admin/keuangan/type-product")}
              disabled={submitting}
            ></button>
          </div>
          <div className="modal-body">
            {error && <p className="text-danger text-center">{error}</p>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-bold">Nama Produk</label>
                <input
                  type="text"
                  name="product_name"
                  value={form.product_name}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">Deskripsi Produk</label>
                <textarea
                  name="product_description"
                  value={form.product_description}
                  onChange={handleChange}
                  className="form-control"
                  required
                ></textarea>
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">Gambar Produk</label>
                <input
                  type="file"
                  name="image"
                  onChange={handleFileChange}
                  className="form-control"
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">Harga</label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">Satuan</label>
                <input
                  type="text"
                  name="unit"
                  value={form.unit}
                  onChange={handleChange}
                  className="form-control"
                  required
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductTypeCreatePage;
