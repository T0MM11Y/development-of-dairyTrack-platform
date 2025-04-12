import { useEffect, useState } from "react";
import { createDiseaseHistory } from "../../../../api/kesehatan/diseaseHistory";
import { getHealthChecks } from "../../../../api/kesehatan/healthCheck";
import { getSymptoms } from "../../../../api/kesehatan/symptom";
import { getCows } from "../../../../api/peternakan/cow";

const DiseaseHistoryCreatePage = ({ onClose, onSaved }) => {
  const [form, setForm] = useState({
    health_check: "",
    disease_name: "",
    description: "",
  });

  const [healthChecks, setHealthChecks] = useState([]);
  const [symptoms, setSymptoms] = useState([]);
  const [cows, setCows] = useState([]);
  const [selectedCheck, setSelectedCheck] = useState(null);
  const [selectedSymptom, setSelectedSymptom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hcData, symData, cowData] = await Promise.all([
          getHealthChecks(),
          getSymptoms(),
          getCows(),
        ]);
        setHealthChecks(hcData);
        setSymptoms(symData);
        setCows(cowData);
      } catch (err) {
        console.error(err);
        setError("Gagal memuat data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
  
    let finalValue = value;
  
    if (name === "health_check") {
      finalValue = parseInt(value); // ✅ pastikan dikirim dalam bentuk angka
      const check = healthChecks.find((c) => c.id === finalValue);
      const sym = symptoms.find((s) => s.health_check === finalValue);
      setSelectedCheck(check || null);
      setSelectedSymptom(sym || null);
    }
  
    setForm((prev) => ({
      ...prev,
      [name]: finalValue,
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createDiseaseHistory(form);
      if (onSaved) onSaved();
    } catch (err) {
      console.error(err);
      setError("Gagal menyimpan data riwayat penyakit.");
    } finally {
      setSubmitting(false);
    }
  };

  const getCowInfo = (check) => {
    const cowId = typeof check?.cow === "object" ? check.cow.id : check?.cow;
    const cow = cows.find((c) => c.id === cowId);
    return cow ? `${cow.name} (${cow.breed})` : "-";
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
            <h4 className="modal-title text-info fw-bold">Tambah Riwayat Penyakit</h4>
            <button className="btn-close" onClick={onClose} disabled={submitting}></button>
          </div>
          <div className="modal-body">
            {error && <p className="text-danger text-center">{error}</p>}
            {loading ? (
              <p className="text-center">Memuat data...</p>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Pilih Pemeriksaan */}
                <div className="mb-3">
                  <label className="form-label fw-bold">Pilih Pemeriksaan</label>
                  <select
                    name="health_check"
                    value={form.health_check}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="">-- Pilih Pemeriksaan --</option>
                    {symptoms.map((sym) => {
                      const check = healthChecks.find((c) => c.id === sym.health_check);
                      const cowId = typeof check?.cow === "object" ? check.cow.id : check?.cow;
                      const cow = cows.find((c) => c.id === cowId);
                      return (
                        <option key={sym.id} value={check?.id}>
                          {cow ? `${cow.name} (${cow.breed})` : "Sapi tidak ditemukan"} - {sym.eye_condition} / {sym.behavior}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Info Pemeriksaan */}
                {selectedCheck && (
                  <div className="mb-3">
                    <label className="form-label fw-bold">Suhu Rektal</label>
                    <input
                      type="text"
                      value={`${selectedCheck.rectal_temperature} °C`}
                      className="form-control"
                      readOnly
                    />
                  </div>
                )}

                {selectedCheck && (
                  <div className="mb-3">
                    <label className="form-label fw-bold">Sapi</label>
                    <input
                      type="text"
                      value={getCowInfo(selectedCheck)}
                      className="form-control"
                      readOnly
                    />
                  </div>
                )}

                {selectedSymptom && (
                  <div className="mb-3">
                    <label className="form-label fw-bold">Gejala</label>
                    <div className="p-2 bg-light rounded border small">
                      {Object.entries(selectedSymptom)
                        .filter(
                          ([key, val]) =>
                            !["id", "health_check", "created_at"].includes(key) &&
                            typeof val === "string" &&
                            val.toLowerCase() !== "normal"
                        )
                        .map(([key, val]) => (
                          <div key={key}>
                            <strong>{key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}:</strong> {val}
                          </div>
                        ))}

                      {Object.entries(selectedSymptom).filter(
                        ([key, val]) =>
                          !["id", "health_check", "created_at"].includes(key) &&
                          (typeof val !== "string" || val.toLowerCase() === "normal")
                      ).length ===
                        Object.entries(selectedSymptom).filter(
                          ([key]) => !["id", "health_check", "created_at"].includes(key)
                        ).length && <div>Semua kondisi normal</div>}
                    </div>
                  </div>
                )}

                {/* Input Penyakit & Deskripsi */}
                <div className="mb-3">
                  <label className="form-label fw-bold">Nama Penyakit</label>
                  <input
                    type="text"
                    name="disease_name"
                    value={form.disease_name}
                    onChange={handleChange}
                    className="form-control"
                    required
                    disabled={!form.health_check}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Deskripsi</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    className="form-control"
                    rows={3}
                    required
                    disabled={!form.health_check}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-info w-100"
                  disabled={submitting || !form.health_check}
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

export default DiseaseHistoryCreatePage;
