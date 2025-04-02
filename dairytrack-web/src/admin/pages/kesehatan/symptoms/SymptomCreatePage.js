import { useState, useEffect } from "react";
import { createSymptom } from "../../../../api/kesehatan/symptom";
import { getHealthChecks } from "../../../../api/kesehatan/healthCheck";
import { useNavigate } from "react-router-dom";

const SymptomCreatePage = () => {
  const navigate = useNavigate();
  const [healthChecks, setHealthChecks] = useState([]);
  const [form, setForm] = useState({
    health_check: "",
    eye_condition: "",
    mouth_condition: "",
    nose_condition: "",
    anus_condition: "",
    leg_condition: "",
    skin_condition: "",
    behavior: "",
    weight_condition: "",
    body_temperature: "",
    reproductive_condition: "",
    treatment_status: "Not Treated",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchHealthChecks = async () => {
      try {
        const res = await getHealthChecks();
        setHealthChecks(res);
      } catch (err) {
        console.error("Gagal mengambil data pemeriksaan:", err);
        setError("Gagal mengambil data pemeriksaan.");
      } finally {
        setLoading(false);
      }
    };
    fetchHealthChecks();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createSymptom(form);
      navigate("/admin/kesehatan/gejala"); // redirect setelah sukses
    } catch (err) {
      console.error("Gagal menyimpan data gejala:", err);
      setError("Gagal menyimpan data gejala: " + err.message);
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
            <h4 className="modal-title text-info fw-bold">Tambah Data Gejala</h4>
            <button
              className="btn-close"
              onClick={() => navigate("/admin/kesehatan/gejala")}
              disabled={submitting}
            ></button>
          </div>
          <div className="modal-body">
            {error && <p className="text-danger text-center">{error}</p>}
            {loading ? (
              <p className="text-center">Memuat data pemeriksaan...</p>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold">Pemeriksaan</label>
                  <select
                    name="health_check"
                    value={form.health_check}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="">-- Pilih Pemeriksaan --</option>
                    {healthChecks.map((hc) => (
                      <option key={hc.id} value={hc.id}>
                        {hc.checkup_date} - {hc.rectal_temperature}°C
                      </option>
                    ))}
                  </select>
                </div>

                <div className="row">
                  {[
                    ["eye_condition", "Kondisi Mata"],
                    ["mouth_condition", "Kondisi Mulut"],
                    ["nose_condition", "Kondisi Hidung"],
                    ["anus_condition", "Kondisi Anus"],
                    ["leg_condition", "Kondisi Kaki"],
                    ["skin_condition", "Kondisi Kulit"],
                    ["behavior", "Perilaku"],
                    ["weight_condition", "Berat Badan"],
                    ["body_temperature", "Suhu Tubuh"],
                    ["reproductive_condition", "Kondisi Kelamin"],
                    ["treatment_status", "Status Penanganan"],
                  ].map(([key, label]) => (
                    <div className="col-md-6 mb-3" key={key}>
                      <label className="form-label fw-bold">{label}</label>
                      <input
                        type="text"
                        name={key}
                        value={form[key]}
                        onChange={handleChange}
                        className="form-control"
                        placeholder={`Masukkan ${label.toLowerCase()}`}
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

export default SymptomCreatePage;
