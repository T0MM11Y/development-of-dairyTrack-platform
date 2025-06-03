// src/pages/Admin/FeedManagement/FeedStock/EditFeedStock.js
import { useState, useEffect } from "react";
import { getFeedStockById, updateFeedStock } from "../../../../controllers/feedStockController";
import Swal from "sweetalert2";
import { Button } from "react-bootstrap";

const EditFeedStock = ({ id, onClose, onSaved }) => {
  const [form, setForm] = useState(null);
  const [originalStock, setOriginalStock] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
  const userData = JSON.parse(localStorage.getItem("user") || "{}");
  if (userData.user_id && userData.token) {
    setCurrentUser(userData);
  } else {
    localStorage.removeItem("user");
    window.location.href = "/";
  }
}, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getFeedStockById(id);
        if (response.success) {
          setForm({
            stock: response.data.stock || 0,
            feed_name: response.data.feed_name || "",
            updated_at: response.data.updated_at || "",
          });
          setOriginalStock(response.data.stock);
        } else {
          throw new Error(response.message || "Stok pakan tidak ditemukan.");
        }
      } catch (err) {
        setError("Gagal memuat data stok pakan.");
        Swal.fire({
          icon: "error",
          title: "Gagal Memuat",
          text: "Gagal memuat data stok pakan.",
        });
      } finally {
        setLoading(false);
      }
    };
    if (currentUser) {
      fetchData();
    }
  }, [id, currentUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value === "" ? "" : parseFloat(value) || 0,
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
    if (parseFloat(form.stock) === parseFloat(originalStock)) {
      Swal.fire({
        icon: "info",
        title: "Tidak Ada Perubahan",
        text: "Stok pakan tidak berubah.",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Konfirmasi Perubahan",
      text: `Apakah anda yakin mau mengubah stok pakan "${form.feed_name}" dari ${originalStock} menjadi ${form.stock}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Ubah!",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) {
      onClose();
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        stock: parseFloat(form.stock) || 0,
      };
      const response = await updateFeedStock(id, payload);
      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: response.message || "Stok pakan berhasil diperbarui.",
          timer: 1500,
          showConfirmButton: false,
        });
        if (onSaved) onSaved();
        onClose();
      } else {
        throw new Error(response.message || "Gagal memperbarui stok pakan.");
      }
    } catch (err) {
      console.error("Update error:", err);
      Swal.fire({
        icon: "error",
        title: "Gagal Memperbarui",
        text: err.message || "Terjadi kesalahan saat memperbarui data.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal fade show d-block"
      style={{ background: "rgba(0,0,0,0.5)", minHeight: "100vh" }}
      tabIndex="-1"
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header bg-light border-bottom">
            <h4 className="modal-title text-info fw-bold">Edit Stok Pakan</h4>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body p-4">
            {error && <p className="text-danger text-center mb-4">{error}</p>}
            {loading || !form ? (
              <div className="text-center py-5">
                <div className="spinner-border text-info" role="status" />
                <p className="mt-2">Memuat data...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Nama Pakan</label>
                    <input
                      type="text"
                      value={form.feed_name}
                      className="form-control bg-light"
                      readOnly
                      disabled
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Stok</label>
                    <input
                      type="number"
                      name="stock"
                      value={formatNumber(form.stock)}
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
                    <label className="form-label fw-bold">Diperbarui oleh</label>
                    <input
                      type="text"
                      className="form-control bg-light"
                      value={currentUser?.name || "Tidak diketahui"}
                      readOnly
                      disabled
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Tanggal Diperbarui</label>
                    <input
                      type="text"
                      className="form-control bg-light"
                      value={
                        form.updated_at
                          ? new Date(form.updated_at).toLocaleString("id-ID")
                          : "Belum diperbarui"
                      }
                      readOnly
                      disabled
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-info w-100 mt-3"
                  disabled={submitting}
                >
                  {submitting ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditFeedStock;