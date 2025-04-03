import { useState, useEffect } from "react";
import { createProductStock} from "../../../../api/keuangan/product";
import {getProductTypes} from "../../../../api/keuangan/productType";
import { useNavigate } from "react-router-dom";

const ProductStockCreatePage = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    product: "",
    quantity: "",
    warehouse_location: "",
    supplier: "",
    received_date: "",
    expiry_date: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await getProductTypes();
        setProducts(res);
      } catch (err) {
        console.error("Gagal mengambil data produk:", err);
        setError("Gagal mengambil data produk.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createProductStock(form);
      navigate("/admin/product-stock");
    } catch (err) {
      console.error("Gagal menyimpan data stok produk:", err);
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
            <h4 className="modal-title text-info fw-bold">Tambah Stok Produk</h4>
            <button
              className="btn-close"
              onClick={() => navigate("/admin/product-stock")}
              disabled={submitting}
            ></button>
          </div>
          <div className="modal-body">
            {error && <p className="text-danger text-center">{error}</p>}
            {loading ? (
              <p className="text-center">Memuat data produk...</p>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold">Produk</label>
                  <select
                    name="product"
                    value={form.product}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="">-- Pilih Produk --</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} - {product.sku}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="row">
                  {["quantity", "warehouse_location", "supplier", "received_date", "expiry_date"].map((key) => (
                    <div className="col-md-6 mb-3" key={key}>
                      <label className="form-label fw-bold">{key.replace("_", " ").toUpperCase()}</label>
                      <input
                        type={key.includes("date") ? "date" : "text"}
                        name={key}
                        value={form[key]}
                        onChange={handleChange}
                        className="form-control"
                        placeholder={`Masukkan ${key.replace("_", " ")}`}
                      />
                    </div>
                  ))}
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

export default ProductStockCreatePage;
