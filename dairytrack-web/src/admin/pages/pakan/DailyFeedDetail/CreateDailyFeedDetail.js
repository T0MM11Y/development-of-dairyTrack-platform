import { useState, useEffect } from "react";
import { createDailyFeedDetail } from "../../../../api/pakan/dailyFeedDetail";
import { getFeeds } from "../../../../api/pakan/feed";
import { getDailyFeeds } from "../../../../api/pakan/dailyFeed"; // Import API untuk mengambil data daily feed

const CreateDailyFeedDetailPage = ({ onDailyFeedDetailAdded, onClose }) => {
  const [feeds, setFeeds] = useState([]);
  const [dailyFeeds, setDailyFeeds] = useState([]); // State untuk daily feed
  const [form, setForm] = useState({
    dailyFeedId: "",
    feedId: "",
    quantity: "",
    session: "pagi",
    date: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleClose = () => {
    if (typeof onClose === "function") {
      onClose();
    } else {
      console.warn("onClose prop is not a function or not provided");
      const modal = document.querySelector(".modal");
      if (modal) {
        modal.style.display = "none";
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(""); // Reset error state jika request baru

      try {
        const feedData = await getFeeds(); // Ambil data feeds
        const dailyFeedData = await getDailyFeeds(); // Ambil data daily feeds

        // Log data untuk memastikan apa yang diterima dari API
        console.log("Feed data:", feedData);
        console.log("Daily feed data:", dailyFeedData);

        // Validasi dan set data pakan (feeds)
        if (feedData && feedData.feeds && Array.isArray(feedData.feeds)) {
          setFeeds(feedData.feeds); // Menyimpan data feeds
        } else {
          throw new Error("Data tidak valid. Tidak ada pakan yang ditemukan.");
        }

        // Validasi dan set data daily feeds
        if (
          dailyFeedData &&
          dailyFeedData.feeds &&
          Array.isArray(dailyFeedData.feeds)
        ) {
          setDailyFeeds(dailyFeedData.feeds); // Menyimpan data daily feeds dari `feeds` dalam response
        } else {
          throw new Error(
            "Data tidak valid. Tidak ada data daily feed ditemukan."
          );
        }
      } catch (err) {
        // Tangani kesalahan jika terjadi
        console.error("Failed to fetch data:", err);
        setError("Gagal mengambil data pakan atau data daily feed.");
      } finally {
        setLoading(false); // Set loading ke false setelah selesai
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    if (!form.dailyFeedId || !form.feedId || !form.quantity) {
      setError("Semua kolom wajib diisi!");
      setSubmitting(false);
      return;
    }

    const confirmSubmit = window.confirm(
      "Apakah Anda yakin ingin menambah detail pakan harian ini?"
    );
    if (!confirmSubmit) {
      setSubmitting(false);
      return;
    }

    try {
      const dailyFeedDetailData = {
        daily_feed_id: Number(form.dailyFeedId),
        feed_id: Number(form.feedId),
        quantity: Number(form.quantity),
        session: form.session,
        date: form.date, // Menggunakan tanggal dari form
      };

      console.log("Mengirim data detail pakan harian:", dailyFeedDetailData);

      const response = await createDailyFeedDetail(dailyFeedDetailData);

      if (response && response.success) {
        alert("Detail pakan harian berhasil ditambahkan!");
        if (typeof onDailyFeedDetailAdded === "function") {
          onDailyFeedDetailAdded();
        }
        handleClose(); // Close modal after successful submission
        window.location.href = "/admin/daily-feed-details"; // Redirect to the page showing details
      } else {
        throw new Error(
          (response && response.message) || "Gagal menyimpan data."
        );
      }
    } catch (err) {
      console.error("Gagal membuat detail pakan harian:", err);
      setError(err.message || "Terjadi kesalahan, coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal show d-block"
      style={{ background: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title text-info fw-bold">
              Tambah Detail Pakan Harian
            </h4>
            <button
              type="button"
              className="btn-close"
              onClick={handleClose}
              disabled={submitting}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            {error && <p className="text-danger text-center">{error}</p>}

            {loading ? (
              <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
                <p className="mt-2">Memuat data...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold">Pakan</label>
                  <select
                    name="feedId"
                    value={form.feedId}
                    onChange={handleChange}
                    className="form-select"
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
                  <label className="form-label fw-bold">Jumlah</label>
                  <input
                    type="number"
                    name="quantity"
                    value={form.quantity}
                    onChange={handleChange}
                    className="form-control"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Sesi</label>
                  <select
                    name="session"
                    value={form.session}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="pagi">Pagi</option>
                    <option value="siang">Siang</option>
                    <option value="sore">Sore</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Pilih Daily Feed</label>
                  <select
                    name="dailyFeedId"
                    value={form.dailyFeedId}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="">Pilih Daily Feed</option>
                    {dailyFeeds.map((dailyFeed) => (
                      <option key={dailyFeed.id} value={dailyFeed.id}>
                        {dailyFeed.date} {/* Menampilkan tanggal daily feed */}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="d-flex justify-content-between">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleClose}
                    disabled={submitting}
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="btn btn-info"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Menyimpan...
                      </>
                    ) : (
                      "SIMPAN"
                    )}
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

export default CreateDailyFeedDetailPage;
