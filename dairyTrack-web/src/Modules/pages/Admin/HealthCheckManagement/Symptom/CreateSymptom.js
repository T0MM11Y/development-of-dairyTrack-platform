import { useState, useEffect } from "react";
import { createSymptom } from "../../../../controllers/symptomController";
import { getSymptoms } from '../../../../controllers/symptomController';
import { getHealthChecks } from "../../../../controllers/healthCheckController";
import { listCows } from "../../../../controllers/cowsController";
import Swal from "sweetalert2"; // pastikan sudah di-import
import { useMemo } from "react";
import { listCowsByUser } from "../../../../../Modules/controllers/cattleDistributionController";


const SymptomCreatePage = ({ onClose, onSaved }) => {
  const [healthChecks, setHealthChecks] = useState([]);
  const [cows, setCows] = useState([]);
  const [form, setForm] = useState({
    health_check: "",
    eye_condition: "Normal",
    mouth_condition: "Normal",
    nose_condition: "Normal",
    anus_condition: "Normal",
    leg_condition: "Normal",
    skin_condition: "Normal",
    behavior: "Normal",
    weight_condition: "Normal",
    reproductive_condition: "Normal",
    created_by: "",

  });
  const [symptoms, setSymptoms] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
      const [userManagedCows, setUserManagedCows] = useState([]);


const rawCows = currentUser?.role_id === 1 ? cows : userManagedCows;

const filteredHealthChecks = useMemo(() => {
  return healthChecks.filter((hc) => {
    const sudahAdaSymptom = symptoms.some((symptom) => {
      return String(symptom.health_check) === String(hc.id);
    });

    const isCowAccessible = rawCows.some((cow) => cow.id === hc.cow.id);

    return (
      hc.needs_attention &&
      hc.status !== "handled" &&
      !sudahAdaSymptom &&
      isCowAccessible // ✅ hanya health check milik sapi yang bisa diakses user
    );
  });
}, [healthChecks, symptoms, rawCows]);

  
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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const selectOptions = {
    eye_condition: [
  "Normal",
  "Red eyes",
  "Eyes look dull or not clear",
  "Eyes have dirt or mucus"
],
  mouth_condition: [
  "Normal",
  "Foamy mouth",
  "Mouth has mucus",
  "Dirt in the mouth (especially at the corners)",
  "Pale lips",
  "Bad mouth odor",
  "Wounds in the mouth"
],
    nose_condition: [
  "Normal",
  "Runny nose",
  "Nosebleed",
  "Dirt around the nostrils"
],
   anus_condition: [
  "Normal",
  "Stool is too hard or too watery (diarrhea)",
  "Stool has blood spots"
],
    leg_condition: [
  "Normal",
  "Swollen leg",
  "Wound on the leg",
  "Injury on the hoof"
],

skin_condition: [
  "Normal",
  "Skin looks dirty or dull",
  "Lumps or bumps on the skin",
  "Wound on the skin",
  "Many lice on the skin"
],

behavior: [
  "Normal",
  "Reduced appetite, different from other cows",
  "Separates from the herd",
  "Often lying down or sitting"
],

weight_condition: [
  "Normal",
  "Weight loss compared to before",
  "Bones are visible due to decreasing weight gain (ADG)"
],

reproductive_condition: [
  "Normal",
  "Difficulty urinating",
  "Mucus from the genitals",
  "Bleeding from the genitals"
],
  };
useEffect(() => {
  const fetchData = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (userData?.user_id || userData?.id) {
        setCurrentUser(userData); // ✅ tambahkan ini
        setForm((prev) => ({
          ...prev,
          created_by: userData.user_id || userData.id,
        }));
      }

      const [hcData, cowData, symptomData] = await Promise.all([
        getHealthChecks(),
        listCows(),
        getSymptoms(),
      ]);
      setHealthChecks(hcData);
      setCows(Array.isArray(cowData) ? cowData : cowData.cows || []);
      setSymptoms(symptomData);
    } catch (err) {
      console.error("Failed to fetch data:", err);
setError("Failed to fetch health check, cow, or symptom data.");

    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);



  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
  
    try {
      await createSymptom(form);
  
      Swal.fire({
        icon: "success",
      title: "Success",
      text: "Symptom data has been successfully saved.",
        timer: 1500,
        showConfirmButton: false,
      });
  
      if (onSaved) onSaved();
    } catch (err) {
    setError("Failed to save symptom data: " + err.message);
  
      Swal.fire({
        icon: "error",
        title: "Failed to Save",
      text: "An error occurred while saving symptom data.",
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
          <h4 className="modal-title text-info fw-bold">Add Data Symptom</h4>
          <button
            className="btn-close"
            onClick={onClose}
            disabled={submitting}
          ></button>
        </div>
        <div className="modal-body">
          {error && <p className="text-danger text-center">{error}</p>}
          {loading ? (
<p className="text-center">Loading health check list...</p>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Pemeriksaan */}
              <div className="mb-3">
                <label className="form-label fw-bold">Health Check</label>
                <select
                  name="health_check"
                  value={form.health_check}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">-- Select Health Check --</option>
                  {filteredHealthChecks.map((hc) => {
                    const cow = cows.find((c) => c.id === hc.cow || c.id === hc.cow?.id);
                    return (
                      <option key={hc.id} value={hc.id}>
                        {cow ? `${cow.name}` : "Cow not found"}
                      </option>
                    );
                  })}
                </select>
                {filteredHealthChecks.length === 0 && (
  <div className="text-warning mt-2">
   No health check data available. All checks may have been handled, already have symptoms, or do not belong to the cows you manage.
  </div>
)}
              </div>

              {/* Gejala */}
              <div className="row">
                {Object.entries(selectOptions).map(([key, options]) => (
                  <div className="col-md-6 mb-3" key={key}>
                    <label className="form-label fw-bold">
                      {key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </label>
                    <select
                      name={key}
                      value={form[key]}
                      onChange={handleChange}
                      className="form-select"
                      required
                    >
                      {options.map((opt, idx) => (
                        <option key={idx} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
               <div className="mb-3">
                <label className="form-label fw-bold">created_by</label>
                <input
                  type="text"
                  className="form-control bg-light"
                  value={currentUser?.name || "Tidak diketahui"}
                  disabled
                />
                <input type="hidden" name="checked_by" value={form.checked_by} />
              </div>


              <button
                type="submit"
                className="btn btn-info w-100"
                disabled={submitting}
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

export default SymptomCreatePage;
