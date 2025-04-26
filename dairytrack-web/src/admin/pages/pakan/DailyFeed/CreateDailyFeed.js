import { useState, useEffect } from "react";
import { createDailyFeed } from "../../../../api/pakan/dailyFeed";
import { getCows } from "../../../../api/peternakan/cow";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";

const CreateDailyFeedPage = ({ onDailyFeedAdded, onClose }) => {
  const [cows, setCows] = useState([]);
  const [form, setForm] = useState({
    cowId: "",
    feedDate: new Date().toISOString().split("T")[0],
    session: "Pagi",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [cowError, setCowError] = useState(false);
  const { t } = useTranslation();

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
      setError("");
      setCowError(false);

      try {
        const cowsData = await getCows().catch((err) => {
          console.error("Failed to fetch cows:", err);
          setCowError(true);
          return [];
        });

        setCows(cowsData);
        if (cowsData.length === 0) setCowError(true);
      } catch (error) {
        console.error("Error in fetchData:", error);
        setError("Terjadi kesalahan saat memuat data.");
      } finally {
        setLoading(false);
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

    const confirmResult = await Swal.fire({
      title: "Konfirmasi",
      text: "Apakah Anda yakin ingin menyimpan data pakan harian ini?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, simpan!",
      cancelButtonText: "Batal",
    });

    if (!confirmResult.isConfirmed) {
      return;
    }

    setSubmitting(true);
    setError("");

    if (!form.cowId || !form.feedDate || !form.session) {
      setError("Semua kolom wajib diisi!");
      setSubmitting(false);
      Swal.fire({
        title: "Error!",
        text: "Semua kolom wajib diisi!",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    try {
      const dailyFeedData = {
        cow_id: Number(form.cowId),
        date: form.feedDate,
        session: form.session,
      };

      const response = await createDailyFeed(dailyFeedData);
      console.log("API Response:", JSON.stringify(response, null, 2));

      if (response && response.success) {
        Swal.fire({
          title: "Berhasil!",
          text: "Data pakan harian berhasil ditambahkan!",
          icon: "success",
          timer: 2000,
          timerProgressBar: true,
        }).then(() => {
          if (typeof onDailyFeedAdded === "function") {
            onDailyFeedAdded();
          }
          handleClose();
        });
      } else {
        throw new Error(response?.message || "Gagal menyimpan data.");
      }
    } catch (err) {
      console.error("Gagal membuat data pakan harian:", err);
      let errorMessage = err.message;

      if (err.message.includes("sudah ada")) {
        // Cari nama sapi berdasarkan cowId
        const errorCowId = Number(form.cowId);
        const selectedCow = cows.find((cow) => cow.id === errorCowId);
        const cowName = selectedCow ? selectedCow.name : `ID ${errorCowId}`;
        // Format pesan error sesuai permintaan
        errorMessage = `Untuk sapi ${cowName} tanggal ${form.feedDate} sesi ${form.session} sudah ada. Silahkan cek kembali data yang ingin ditambahkan.`;
      } else {
        errorMessage = err.message || "Terjadi kesalahan, coba lagi.";
      }

      setError(errorMessage);
      Swal.fire({
        title: "Error!",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-dialog">
      <div className="modal-content">
        <div className="modal-header">
          <h4 className="modal-title text-info fw-bold">
            {t("dailyfeed.add_daily_feed")}
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
              <p className="mt-2">{t("dailyfeed.loading_data")}...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-bold">{t("dailyfeed.cow")}</label>
                <select
                  name="cowId"
                  value={form.cowId}
                  onChange={handleChange}
                  className={`form-select ${cowError ? "is-invalid" : ""}`}
                  required
                  disabled={cowError || cows.length === 0}
                >
                  <option value="">{t("dailyfeed.select_cow")}</option>
                  {cows.map((cow) => (
                    <option key={cow.id} value={cow.id}>
                      {cow.name}
                    </option>
                  ))}
                </select>
                {cowError && (
                  <div className="invalid-feedback d-block">
                    {t("dailyfeed.failed_load_cow")}
                  </div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">{t("dailyfeed.date")}</label>
                <input
                  type="date"
                  name="feedDate"
                  value={form.feedDate}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">{t("dailyfeed.session")}</label>
                <select
                  name="session"
                  value={form.session}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">{t("dailyfeed.select_session")}</option>
                  <option value="Pagi">{t("dailyfeed.morning")}</option>
                  <option value="Siang">{t("dailyfeed.afternoon")}</option>
                  <option value="Sore">{t("dailyfeed.evening")}</option>
                </select>
              </div>

              <div className="d-flex justify-content-between">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleClose}
                  disabled={submitting}
                >
                  {t("dailyfeed.cancel")}
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      {t("dailyfeed.saving")}...
                    </>
                  ) : (
                    t("dailyfeed.save")
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateDailyFeedPage;