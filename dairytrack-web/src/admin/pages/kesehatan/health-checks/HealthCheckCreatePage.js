import { useEffect, useState } from "react";
import { createHealthCheck } from "../../../../api/kesehatan/healthCheck";
import { getHealthChecks } from "../../../../api/kesehatan/healthCheck";

import { getCows } from "../../../../api/peternakan/cow";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";

const HealthCheckCreatePage = ({ onClose, onSaved }) => {
  const { t } = useTranslation();
  
  const [cows, setCows] = useState([]);
  const [healthChecks, setHealthChecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const [form, setForm] = useState({
    cow_id: "",
    rectal_temperature: "",
    heart_rate: "",
    respiration_rate: "",
    rumination: "",
  });

  const fetchData = async () => {
    try {
      const [cowsRes, healthChecksRes] = await Promise.all([
        getCows(),
        getHealthChecks(),
      ]);
      setCows(cowsRes);
      setHealthChecks(healthChecksRes);
    } catch (err) {
      setError("Gagal mengambil data sapi atau pemeriksaan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await createHealthCheck(form);
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Data pemeriksaan berhasil disimpan.",
        timer: 1500,
        showConfirmButton: false,
      });

      if (onSaved) onSaved();
      await fetchData(); // refresh data after submit
      setForm({
        cow_id: "",
        rectal_temperature: "",
        heart_rate: "",
        respiration_rate: "",
        rumination: "",
      });
    } catch (err) {
      let message = "Gagal menyimpan data pemeriksaan.";
      if (err.response && err.response.data) {
        message = err.response.data.message || message;
      }
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

  // ✨ Ini filter cows yang bener kayak Flutter
  const availableCows = cows.filter((cow) => {
    const hasUnfinished = healthChecks.some(
      (h) => h?.cow?.id === cow.id && (h?.status || '').toLowerCase() !== 'handled'
    );
    return !hasUnfinished;
  });
  
  
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
          <div className="modal-header">
            <h4 className="modal-title text-info fw-bold">{t('healthcheck.add')}</h4>
            <button className="btn-close" onClick={onClose} disabled={submitting}></button>
          </div>
          <div className="modal-body">
            {error && <p className="text-danger text-center">{error}</p>}
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-info" role="status" />
                <p className="mt-2">{t('healthcheck.loading_cows')}...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold">{t('healthcheck.cow')}</label>
                  <select
  name="cow_id"
  value={form.cow_id}
  onChange={handleChange}
  className="form-select"
  required
>
  <option value="">-- {t('healthcheck.select_cow')} --</option>
  {availableCows.map((cow) => (
    <option key={cow.id} value={cow.id}>
      {cow.name} ({cow.breed})
    </option>
  ))}
</select>

{/* Tambahkan pesan kalau kosong */}
{availableCows.length === 0 && (
  <div className="text-warning mt-2">
    Semua sapi sudah dalam pemeriksaan aktif.
  </div>
)}

                  {availableCows.length === 0 && (
                    <p className="text-warning mt-2">
                      Semua sapi sudah dalam pemeriksaan aktif.
                    </p>
                  )}
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">{t('healthcheck.rectal_temperature')} (°C)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="rectal_temperature"
                      value={form.rectal_temperature}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">{t('healthcheck.heart_rate')}</label>
                    <input
                      type="number"
                      name="heart_rate"
                      value={form.heart_rate}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">{t('healthcheck.respiration_rate')}</label>
                    <input
                      type="number"
                      name="respiration_rate"
                      value={form.respiration_rate}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">{t('healthcheck.rumination')}</label>
                    <input
                      type="number"
                      step="0.1"
                      name="rumination"
                      value={form.rumination}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>
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

export default HealthCheckCreatePage;
