import { useEffect, useState } from "react";
import { getHealthCheckById, updateHealthCheck } from "../../../../controllers/healthCheckController";
import { listCows } from "../../../../controllers/cowsController";
import Swal from "sweetalert2";

const HealthCheckEditPage = ({ healthCheckId, onClose, onSaved }) => {
  const [form, setForm] = useState(null);
  const [cowName, setCowName] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData) {
      setCurrentUser(userData);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [res, cowList] = await Promise.all([
          getHealthCheckById(healthCheckId),
          listCows(),
        ]);

        setForm(res);
        const cow = typeof res.cow === "object" ? res.cow : cowList.find((c) => c.id === res.cow);
        setCowName(cow ? `${cow.name} (${cow.breed})` : "Sapi tidak ditemukan");
      } catch (err) {
        setError("Gagal memuat data pemeriksaan.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [healthCheckId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        rectal_temperature: form.rectal_temperature,
        heart_rate: form.heart_rate,
        respiration_rate: form.respiration_rate,
        rumination: form.rumination,
        edited_by: currentUser?.user_id || currentUser?.id || null,
      };

      await updateHealthCheck(healthCheckId, payload);
      const updated = await getHealthCheckById(healthCheckId);

      Swal.fire({
        icon: "success",
       title: "Success",
text: "Health check data has been successfully updated.",

        timer: 1500,
        showConfirmButton: false,
      });

      if (onSaved) onSaved(updated);
      onClose();
    } catch (err) {
      console.error(err);
setError("Failed to update data.");
      Swal.fire({
        icon: "error",
       title: "Failed to Update",
text: "An error occurred while updating the data.",

      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal show d-block"
      style={{ background: submitting ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.5)", minHeight: "100vh", paddingTop: "3rem" }}
    >
      <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title text-info fw-bold">Edit Health Check</h4>
            <button className="btn-close" onClick={onClose} disabled={submitting}></button>
          </div>
          <div className="modal-body">
            {error && <p className="text-danger text-center">{error}</p>}
            {loading || !form ? (
              <div className="text-center py-5">
                <div className="spinner-border text-info" role="status" />
                <p className="mt-2">Loading data...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Cow</label>
                    <input type="text" className="form-control" value={cowName} disabled readOnly />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Checkup Date</label>
                    <input
                      type="text"
                      className="form-control"
                      value={new Date(form.checkup_date).toLocaleString("id-ID")}
                      readOnly
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">rectal_temperature (°C)</label>
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
                    <label className="form-label fw-bold">Heart Rate (bpm/minutes)</label>
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
                    <label className="form-label fw-bold">Respiration Rate (bpm/minutes)</label>
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
                    <label className="form-label fw-bold">Rumination (contraction/Minutes)</label>
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

                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Status</label>
                    <input
                      type="text"
                      className={`form-control fw-semibold ${
                        form.status === "handled" ? "text-success" : "text-warning"
                      }`}
                      value={form.status === "handled" ? "Sudah ditangani" : "Belum ditangani"}
                      readOnly
                      disabled
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-info w-100" disabled={submitting}>
{submitting ? "Saving..." : "Save Changes"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthCheckEditPage;
