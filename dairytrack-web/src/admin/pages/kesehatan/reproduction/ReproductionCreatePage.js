import { useState, useEffect } from "react";
import { createReproduction } from "../../../../api/kesehatan/reproduction";
import { getCows } from "../../../../api/peternakan/cow";
import { useNavigate } from "react-router-dom";

const ReproductionCreatePage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    cow: "",
    birth_interval: "",
    service_period: "",
    conception_rate: "",
  });

  const [cows, setCows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCows = async () => {
      try {
        const data = await getCows();
        setCows(data);
      } catch (err) {
        setError("Gagal memuat data sapi.");
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
      await createReproduction(form);
      navigate("/admin/kesehatan/reproduksi");
    } catch (err) {
      setError("Gagal menyimpan data reproduksi.");
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
            <h4 className="modal-title text-info fw-bold">Tambah Data Reproduksi</h4>
            <button
              className="btn-close"
              onClick={() => navigate("/admin/kesehatan/reproduksi")}
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
                  <label className="form-label fw-bold">Pilih Sapi</label>
                  <select
                    name="cow"
                    value={form.cow}
                    onChange={handleChange}
                    className="form-select"
                    required
                    disabled={submitting}
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
                    <label className="form-label fw-bold">Interval Kelahiran (hari)</label>
                    <input
                      type="number"
                      name="birth_interval"
                      value={form.birth_interval}
                      onChange={handleChange}
                      className="form-control"
                      required
                      min="0"
                      disabled={submitting}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Masa Layanan (hari)</label>
                    <input
                      type="number"
                      name="service_period"
                      value={form.service_period}
                      onChange={handleChange}
                      className="form-control"
                      required
                      min="0"
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold">Tingkat Konsepsi (%)</label>
                  <input
                    type="number"
                    name="conception_rate"
                    value={form.conception_rate}
                    onChange={handleChange}
                    className="form-control"
                    required
                    min="0"
                    disabled={submitting}
                  />
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

export default ReproductionCreatePage;
