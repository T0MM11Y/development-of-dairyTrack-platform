import { useEffect, useState } from "react";
import { createHealthCheck } from "../../../../api/kesehatan/healthCheck";
import { getCows } from "../../../../api/peternakan/cow";
import { useNavigate } from "react-router-dom";

const HealthCheckCreatePage = () => {
  const navigate = useNavigate();
  const [cows, setCows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    cow: "",
    checkup_date: "",
    rectal_temperature: "",
    heart_rate: "",
    respiration_rate: "",
    rumination: "",
    treatment_status: "Not Treated",
  });

  useEffect(() => {
    const fetchCows = async () => {
      try {
        const res = await getCows();
        setCows(res);
      } catch (err) {
        setError("Gagal mengambil data sapi.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCows();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createHealthCheck(form);
      navigate("/admin/kesehatan/pemeriksaan");
    } catch (err) {
      setError("Gagal menyimpan data pemeriksaan.");
      console.error(err);
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
            <h4 className="modal-title text-info fw-bold">Tambah Pemeriksaan</h4>
            <button
              className="btn-close"
              onClick={() => navigate("/admin/kesehatan/pemeriksaan")}
              disabled={submitting}
            ></button>
          </div>
          <div className="modal-body">
            {error && <p className="text-danger text-center">{error}</p>}
            {loading ? (
              <p className="text-center">Memuat data sapi...</p>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold">Sapi</label>
                  <select
                    name="cow"
                    value={form.cow}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="">-- Pilih Sapi --</option>
                    {cows.map((cow) => (
                      <option key={cow.id} value={cow.id}>
                        {cow.name} ({cow.breed})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Tanggal Pemeriksaan</label>
                    <input
                      type="datetime-local"
                      name="checkup_date"
                      value={form.checkup_date}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Suhu Rektal (°C)</label>
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
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Denyut Jantung</label>
                    <input
                      type="number"
                      name="heart_rate"
                      value={form.heart_rate}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Frekuensi Napas</label>
                    <input
                      type="number"
                      name="respiration_rate"
                      value={form.respiration_rate}
                      onChange={handleChange}
                      className="form-control"
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Ruminasi</label>
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

                <div className="mb-4">
                  <label className="form-label fw-bold">Status Pengobatan</label>
                  <select
                    name="treatment_status"
                    value={form.treatment_status}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="Not Treated">Belum Diobati</option>
                    <option value="Treated">Sudah Diobati</option>
                  </select>
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
