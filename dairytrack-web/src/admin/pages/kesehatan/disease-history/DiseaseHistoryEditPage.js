import { useEffect, useState } from "react";
import {
  getDiseaseHistoryById,
  updateDiseaseHistory,
} from "../../../../api/kesehatan/diseaseHistory";

const DiseaseHistoryEditPage = ({ historyId, onClose, onSaved }) => {
  const [form, setForm] = useState({
    disease_name: "",
    description: "",
  });

  const [disease, setDisease] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getDiseaseHistoryById(historyId);

        setForm({
          disease_name: res.disease_name || "",
          description: res.description || "",
        });

        setDisease(res); // berisi cow, health_check, symptom
      } catch (err) {
        console.error("Gagal mengambil data:", err);
        setError("Gagal memuat data riwayat penyakit.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [historyId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updateDiseaseHistory(historyId, form);
      if (onSaved) onSaved();
    } catch (err) {
      console.error("Gagal memperbarui data:", err);
      setError("Gagal memperbarui data. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal fade show d-block"
      style={{
        background: submitting ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.5)",
        minHeight: "100vh",
        paddingTop: "3rem",
      }}
    >
      <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title text-info fw-bold">Edit Riwayat Penyakit</h4>
            <button className="btn-close" onClick={onClose} disabled={submitting}></button>
          </div>
          <div className="modal-body">
            {error && <p className="text-danger text-center">{error}</p>}
            {loading ? (
              <p className="text-center">Memuat data riwayat penyakit...</p>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Info sapi */}
                {disease?.health_check?.cow && (
                  <div className="mb-3">
                    <label className="form-label fw-bold">Sapi</label>
                    <input
                      type="text"
                      value={`${disease.health_check.cow.name} (${disease.health_check.cow.breed})`}
                      className="form-control"
                      readOnly
                      disabled
                    />
                  </div>
                )}

                {/* Info pemeriksaan */}
                {disease?.health_check && (
                  <div className="mb-3">
                    <label className="form-label fw-bold">Detail Pemeriksaan</label>
                    <div className="p-2 border bg-light rounded small">
                      <div><strong>Suhu:</strong> {disease.health_check.rectal_temperature} °C</div>
                      <div><strong>Denyut Jantung:</strong> {disease.health_check.heart_rate}</div>
                      <div><strong>Napas:</strong> {disease.health_check.respiration_rate}</div>
                      <div><strong>Ruminasi:</strong> {disease.health_check.rumination}</div>
                      <div><strong>Tanggal:</strong> {new Date(disease.health_check.checkup_date).toLocaleString("id-ID")}</div>
                    </div>
                  </div>
                )}

                {/* Info gejala */}
                {disease?.symptom && (
                  <div className="mb-3">
                    <label className="form-label fw-bold">Gejala</label>
                    <div className="p-2 bg-light border rounded small">
                      {Object.entries(disease.symptom)
                        .filter(([k, v]) => !["id", "health_check", "created_at"].includes(k) && v)
                        .map(([k, v]) => (
                          <div key={k}>
                            <strong>{k.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}:</strong> {v}
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Input penyakit */}
                <div className="mb-3">
                  <label className="form-label fw-bold">Nama Penyakit</label>
                  <input
                    type="text"
                    name="disease_name"
                    value={form.disease_name}
                    onChange={handleChange}
                    className="form-control"
                    required
                    disabled={submitting}
                  />
                </div>

                {/* Deskripsi */}
                <div className="mb-3">
                  <label className="form-label fw-bold">Deskripsi</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    className="form-control"
                    rows={3}
                    required
                    disabled={submitting}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-info w-100"
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

export default DiseaseHistoryEditPage;
