import { useState, useEffect } from "react";
import {
createHealthCheck
} from "../../../../controllers/healthCheckController";
import Swal from "sweetalert2";
import { listCowsByUser } from "../../../../../Modules/controllers/cattleDistributionController";

const HealthCheckCreatePage = ({ cows, healthChecks, onClose, onSaved }) => {
  const [form, setForm] = useState({
    cow_id: "",
    rectal_temperature: "",
    heart_rate: "",
    respiration_rate: "",
    rumination: "",
    checked_by: "",
  });

  const [currentUser, setCurrentUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [userManagedCows, setUserManagedCows] = useState([]);
   // Add this near other useEffect hooks
    useEffect(() => {
      const fetchUserManagedCows = async () => {
        if (currentUser?.user_id) {
          try {
            const { success, cows } = await listCowsByUser(currentUser.user_id);
            if (success && cows) {
              setUserManagedCows(cows);
            }
          } catch (err) {
            console.error("Error fetching user's cows:", err);
          }
        }
      };
  
      fetchUserManagedCows();
    }, [currentUser]);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData) {
      setCurrentUser(userData);
      setForm((prev) => ({
        ...prev,
        checked_by: userData.user_id || userData.id || "",
      }));
    }
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
        title: "Success",
text: "Health check data has been successfully saved.",

        timer: 1500,
        showConfirmButton: false,
      });

      if (onSaved) onSaved();

      setForm({
        cow_id: "",
        rectal_temperature: "",
        heart_rate: "",
        respiration_rate: "",
        rumination: "",
        checked_by: currentUser?.user_id || currentUser?.id || "",
      });
    } catch (err) {
      let message = "Failed to save health check data.";
      setError(message);
      Swal.fire({
        icon: "error",
        title: "Failed to Save",
        text: message,
      });
    } finally {
      setSubmitting(false);
    }
  };

const rawCows = currentUser?.role_id === 1 ? cows : userManagedCows;

const availableCows = Array.isArray(rawCows)
  ? rawCows.filter((cow) => {
      const hasActiveCheck = healthChecks.some((h) => {
        const status = (h?.status || "").toLowerCase();
        return h?.cow?.id === cow.id && status !== "handled" && status !== "healthy";
      });
      return !hasActiveCheck;
    })
  : [];



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
            <h4 className="modal-title text-info fw-bold">Add Health Check</h4>
            <button className="btn-close" onClick={onClose} disabled={submitting}></button>
          </div>
          <div className="modal-body">
            {error && <p className="text-danger text-center">{error}</p>}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
  <label className="form-label fw-bold">Cow</label>
<select
  name="cow_id"
  value={form.cow_id}
  onChange={handleChange}
  className="form-select"
  required
>
  <option value="">-- Select Cow --</option>
  {availableCows.map((cow) => (
    <option key={cow.id} value={cow.id}>
      {cow.name}
    </option>
  ))}
</select>
{Array.isArray(rawCows) && rawCows.length > 0 && availableCows.length === 0 && (
  <div className="text-warning mt-2">
    {
      rawCows.every((cow) =>
        healthChecks.some((h) => h?.cow?.id === cow.id && !["handled", "healthy"].includes((h.status || "").toLowerCase()))
      )
      ? "All cows are currently undergoing active (unfinished) health checks."
: "All cows have been checked and are currently unavailable for new health checks."
    }
  </div>
)}


</div>


              <div className="mb-3">
                <label className="form-label fw-bold">Created By</label>
                <input
                  type="text"
                  className="form-control bg-light"
                  value={currentUser?.name || "Tidak diketahui"}
                  disabled
                />
                <input type="hidden" name="checked_by" value={form.checked_by} />
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Rectal Temperature (°C)</label>
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
                  <label className="form-label fw-bold">Heart Rate (BPM/Minutes)</label>
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
                  <label className="form-label fw-bold">Respiration Rate (BPM/Minutes)</label>
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
                  <label className="form-label fw-bold">Rumination (contraction/minutes)</label>
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
                {submitting ? "Saving..." : "Save"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthCheckCreatePage;
