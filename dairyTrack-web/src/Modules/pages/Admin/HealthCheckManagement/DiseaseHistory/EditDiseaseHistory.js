import { useEffect, useState } from "react";
import {
  getDiseaseHistoryById,
  updateDiseaseHistory,
} from "../../../../controllers/diseaseHistoryController";
import Swal from "sweetalert2";


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
        console.error("Failed to fetch data:", err);
setError("Failed to load disease history data.");

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
  setError("");

  try {
    const userData = JSON.parse(localStorage.getItem("user"));
    const userId = userData?.user_id || userData?.id;

    const payload = {
      ...form,
      edited_by: userId, // ✅ tambahkan field edited_by
    };

    await updateDiseaseHistory(historyId, payload);

    Swal.fire({
      icon: "success",
     title: "Success",
text: "Disease history data has been successfully updated.",

      timer: 1500,
      showConfirmButton: false,
    });

    if (onSaved) onSaved();
  } catch (err) {
setError("Failed to update data. Please try again.");

    Swal.fire({
      icon: "error",
      title: "Failed to Update",
text: "An error occurred while updating the disease history data.",

    });
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
<h4 className="modal-title text-info fw-bold">Edit Disease History</h4>
          <button className="btn-close" onClick={onClose} disabled={submitting}></button>
        </div>
        <div className="modal-body">
          {error && <p className="text-danger text-center">{error}</p>}
          {loading ? (
<p className="text-center">Loading disease history data...</p>
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
                  <label className="form-label fw-bold">Health Check Details</label>
                  <div className="p-2 border bg-light rounded small">
                    <div><strong>Temperature:</strong> {disease.health_check.rectal_temperature} °C</div>
                    <div><strong>Heart Rate:</strong> {disease.health_check.heart_rate}</div>
                    <div><strong>Respiration:</strong> {disease.health_check.respiration_rate}</div>
                    <div><strong>Rumination:</strong> {disease.health_check.rumination}</div>
                    <div><strong>Checkup Date:</strong> {new Date(disease.health_check.checkup_date).toLocaleString("id-ID")}</div>
                  </div>
                </div>
              )}

              {/* Info gejala */}
              {disease?.symptom && (
                <div className="mb-3">
                  <label className="form-label fw-bold">Symptom</label>
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
                <label className="form-label fw-bold">Disease Name</label>
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
                <label className="form-label fw-bold">Description</label>
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
                {submitting ? "Updating..." : "Update Data"}
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
