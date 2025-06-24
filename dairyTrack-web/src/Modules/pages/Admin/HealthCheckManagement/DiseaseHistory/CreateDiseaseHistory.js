import { useEffect, useState } from "react";
import { createDiseaseHistory } from "../../../../controllers/diseaseHistoryController";
import { getHealthChecks } from "../../../../controllers/healthCheckController";
import { getSymptoms } from "../../../../controllers/symptomController";
import { listCows } from "../../../../controllers/cowsController";
import Swal from "sweetalert2";
import { listCowsByUser } from "../../../../../Modules/controllers/cattleDistributionController";


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
  const [currentUser, setCurrentUser] = useState(null);
const [userManagedCows, setUserManagedCows] = useState([]);


 useEffect(() => {
  const fetchData = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (userData?.user_id || userData?.id) {
        setCurrentUser(userData);
        setForm((prev) => ({
          ...prev,
          created_by: userData.user_id || userData.id,
        }));

        // 🔁 Ambil sapi yang dikelola user
        const { success, cows } = await listCowsByUser(userData.user_id || userData.id);
        if (success) setUserManagedCows(cows || []);
      }

      const [hcData, symData, cowData] = await Promise.all([
        getHealthChecks(),
        getSymptoms(),
        listCows(),
      ]);

      setHealthChecks(Array.isArray(hcData) ? hcData : []);
      setSymptoms(Array.isArray(symData) ? symData : []);
      setCows(Array.isArray(cowData) ? cowData : Array.isArray(cowData?.cows) ? cowData.cows : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load data.");
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
      finalValue = parseInt(value);
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
    setError("");

    try {
      await createDiseaseHistory(form);

      Swal.fire({
        icon: "success",
        title: "Success",
text: "Disease history has been successfully saved.",

        timer: 1500,
        showConfirmButton: false,
      });

      if (onSaved) onSaved();
    } catch (err) {
      setError("Failed to save disease history data.");

      Swal.fire({
        icon: "error",
       title: "Failed to Save",
text: "An error occurred while saving the disease history data.",

      });
    } finally {
      setSubmitting(false);
    }
  };

  const getCowInfo = (check) => {
    const cowId = typeof check?.cow === "object" ? check.cow.id : check?.cow;
    const cowArray = Array.isArray(cows) ? cows : [];
    const cow = cowArray.find((c) => c.id === cowId);
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
          <h4 className="modal-title text-info fw-bold">Add Disease History</h4>
          <button className="btn-close" onClick={onClose} disabled={submitting}></button>
        </div>
        <div className="modal-body">
          {error && <p className="text-danger text-center">{error}</p>}
          {loading ? (
            <p className="text-center">Loading  data...</p>
          ) : (
            <form onSubmit={handleSubmit}>
            {/* Pilih Pemeriksaan */}
<div className="mb-3">
  <label className="form-label fw-bold">Select Health Check</label>
  <select
    name="health_check"
    value={form.health_check}
    onChange={handleChange}
    className="form-select"
    required
  >
    <option value="">-- Select Health Check --</option>
{Array.isArray(healthChecks) &&
  healthChecks
    .filter((check) => {
      const status = (check.status || "").toLowerCase();
      const cowId = typeof check?.cow === "object" ? check.cow.id : check?.cow;
      const isOwned = userManagedCows.some((cow) => cow.id === cowId);
      return status !== "handled" && status !== "healthy" && isOwned;
    })
    .map((check) => {
      const cowId = typeof check?.cow === "object" ? check.cow.id : check?.cow;
      const cow = cows.find((c) => String(c.id) === String(cowId));

      return (
        <option key={check.id} value={check.id}>
          {cow ? `${cow.name} (${cow.breed})` : `ID: ${cowId} (sapi tidak ditemukan)` }
        </option>
      );
    })}



  </select>
  {Array.isArray(healthChecks) &&
  healthChecks.filter((check) => {
    const status = (check.status || "").toLowerCase();
    const cowId = typeof check?.cow === "object" ? check.cow.id : check?.cow;
    const isOwned = userManagedCows.some((cow) => cow.id === cowId);
    return status !== "handled" && status !== "healthy" && isOwned;
  }).length === 0 && (
   <div className="text-warning mt-2">
  No available health checks. They may have all been handled, marked as healthy, 
  or are not part of the cows you manage.
</div>

)}

</div>
{/* Info Sapi */}
{selectedCheck && (
  <div className="mb-3">
    <label className="form-label fw-bold">Cow</label>
    <input
      type="text"
      value={getCowInfo(selectedCheck)}
      className="form-control"
      readOnly
    />
  </div>
)}

              {/* Info Pemeriksaan */}
              {selectedCheck && (
                <>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Rectal Temperature</label>
                    <input
                      type="text"
                      value={`${selectedCheck.rectal_temperature} °C`}
                      className="form-control"
                      readOnly
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">Heart Rate</label>
                    <input
                      type="text"
                      value={`${selectedCheck.heart_rate} bpm/minutes`}
                      className="form-control"
                      readOnly
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">Respiration Rate</label>
                    <input
                      type="text"
                      value={`${selectedCheck.respiration_rate} bpm/minutes`}
                      className="form-control"
                      readOnly
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">Rumination</label>
                    <input
                      type="text"
                      value={`${selectedCheck.rumination} minutes`}
                      className="form-control"
                      readOnly
                    />
                  </div>
                </>
              )}

              {/* Info Gejala */}
              {selectedSymptom && (
                <div className="mb-3">
                  <label className="form-label fw-bold">Symptom</label>
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
                      ).length && <div>All symptom conditions are normal</div>}
                  </div>
                </div>
              )}
              {/* Dibuat oleh */}
<div className="mb-3">
  <label className="form-label fw-bold">Created by</label>
  <input
    type="text"
    className="form-control bg-light"
    value={currentUser?.name || "Tidak diketahui"}
    disabled
  />
  <input
    type="hidden"
    name="created_by"
    value={currentUser?.user_id || currentUser?.id || ""}
  />
</div>


              {/* Input Penyakit & Deskripsi */}
              <div className="mb-3">
                <label className="form-label fw-bold">Disease Name</label>
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
                <label className="form-label fw-bold">Description</label>
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
                {submitting ? "Saving..." : "Save"}
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
