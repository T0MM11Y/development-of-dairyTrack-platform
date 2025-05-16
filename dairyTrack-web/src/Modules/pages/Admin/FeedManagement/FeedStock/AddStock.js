import { useState, useEffect } from "react";
import { addFeedStock } from "../../../../controllers/feedStockController";
import Swal from "sweetalert2";
import { Button } from "react-bootstrap";

const AddFeedStock = ({ feeds, onClose, onSaved }) => {
  const [form, setForm] = useState({
    feedId: "",
    additionalStock: "",
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    if (userData.user_id) {
      setCurrentUser(userData);
    } else {
      Swal.fire({
        icon: "error",
        title: "Sesi Berakhir",
        text: "Token tidak ditemukan. Silakan login kembali.",
      });
      localStorage.removeItem("user");
      window.location.href = "/";
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatNumber = (value) => {
    if (value === "" || isNaN(value)) return "";
    const num = parseFloat(value);
    if (Number.isInteger(num)) return num.toString();
    return num.toString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const payload = {
        feedId: parseInt(form.feedId),
        additionalStock: parseFloat(form.additionalStock) || 0,
      };

      const response = await addFeedStock(payload);
      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: response.message || "Stok pakan berhasil ditambahkan.",
          timer: 1500,
          showConfirmButton: false,
        });
        if (onSaved) onSaved();
        onClose();
      } else {
        throw new Error(response.message || "Gagal menambah stok pakan.");
      }
    } catch (err) {
      const message = err.message || "Terjadi kesalahan saat menambah stok pakan.";
      setError(message);
      Swal.fire({
        icon: "error",
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
        paddingTop: "3rem",
      }}
    >
      <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header bg-light border-bottom">
            <h4 className="modal-title text-info fw-bold">Tambah Stok Pakan</h4>
            <button
              className="btn-close"
              onClick={onClose}
              disabled={submitting}
            ></button>
          </div>
          <div className="modal-body p-4">
            {error && <p className="text-danger text-center mb-4">{error}</p>}

            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Nama Pakan</label>
                  <select
                    name="feedId"
                    value={form.feedId}
                    onChange={handleChange}
                    className="form-control"
                    required
                  >
                    <option value="">Pilih Pakan</option>
                    {feeds.map((feed) => (
                      <option key={feed.id} value={feed.id}>
                        {feed.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Tambahan Stok</label>
                  <input
                    type="number"
                    name="additionalStock"
                    value={formatNumber(form.additionalStock)}
                    onChange={handleChange}
                    className="form-control"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Dibuat oleh</label>
                  <input
                    type="text"
                    className="form-control bg-light"
                    value={currentUser?.name || "Tidak diketahui"}
                    disabled
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-info w-100 mt-3"
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

export default AddFeedStock;