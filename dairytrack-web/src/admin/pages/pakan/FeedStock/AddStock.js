import { useState, useEffect } from "react";
import { getFeeds } from "../../../../api/pakan/feed";
import { AddFeedStock } from "../../../../api/pakan/feedstock";
import Swal from "sweetalert2";

const AddFeedStockPage = ({ preFeedId, onStockAdded, onClose }) => {
  const [feeds, setFeeds] = useState([]);
  const [form, setForm] = useState({
    feedId: preFeedId || "",
    additionalStock: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFeeds = async () => {
      try {
        setLoading(true);
        const response = await getFeeds();
        console.log("getFeeds Response:", response);
        if (response.success && (response.data || response.feeds || response.pakan)) {
          setFeeds(response.data || response.feeds || response.pakan);
        } else {
          throw new Error("Gagal mengambil data pakan.");
        }
      } catch (err) {
        setError(err.message || "Gagal memuat data pakan.");
        console.error("Error fetching feeds:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeeds();
  }, []);

  useEffect(() => {
    // Sync form.feedId with preFeedId when it changes
    setForm((prev) => ({ ...prev, feedId: preFeedId || "" }));
  }, [preFeedId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "additionalStock" ? Number(value) || "" : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.feedId) {
      setError("Pilih pakan terlebih dahulu.");
      return;
    }
    if (!form.additionalStock || form.additionalStock <= 0) {
      setError("Masukkan jumlah stok tambahan yang valid (lebih dari 0).");
      return;
    }

    const confirm = await Swal.fire({
      title: "Yakin ingin menambah stok?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, tambah",
      cancelButtonText: "Batal",
    });

    if (!confirm.isConfirmed) return;

    setSubmitting(true);

    try {
      const feedData = {
        feedId: Number(form.feedId),
        additionalStock: Number(form.additionalStock),
      };
      const response = await AddFeedStock(feedData);
      console.log("addFeedStock Response:", response);

      if (response.success) {
        await Swal.fire({
          title: "Berhasil!",
          text: response.message || "Stok pakan berhasil ditambahkan.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        onStockAdded();
      } else {
        throw new Error(response.message || "Gagal menambah stok pakan.");
      }
    } catch (err) {
      console.error("Error adding stock:", err);
      const errorMessage = err.message.includes("not found")
        ? "Pakan tidak ditemukan."
        : err.message || "Terjadi kesalahan saat menambah stok.";
      await Swal.fire({
        title: "Gagal!",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "OK",
      });
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Tambah Stok Pakan</h5>
            <button
              className="btn-close"
              onClick={onClose}
              disabled={submitting}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            {error && <div className="alert alert-danger">{error}</div>}
            {loading ? (
              <div className="text-center">
                <div className="spinner-border text-primary" role="status" />
                <p>Memuat data pakan...</p>
              </div>
            ) : feeds.length === 0 ? (
              <p className="text-gray-500">Tidak ada data pakan yang tersedia.</p>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold">Pakan</label>
                  <select
                    name="feedId"
                    value={form.feedId}
                    onChange={handleChange}
                    className="form-select"
                    disabled={submitting || !!preFeedId}
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
                <div className="mb-3">
                  <label className="form-label fw-bold">Stok Tambahan (kg)</label>
                  <input
                    type="number"
                    name="additionalStock"
                    value={form.additionalStock}
                    onChange={handleChange}
                    className="form-control"
                    min="0.01"
                    step="0.01"
                    placeholder="Masukkan jumlah stok"
                    disabled={submitting}
                    required
                  />
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={onClose}
                    disabled={submitting}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      />
                    ) : null}
                    Simpan
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddFeedStockPage;
