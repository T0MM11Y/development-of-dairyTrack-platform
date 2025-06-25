import { useEffect, useState } from "react";
import { getSymptomById, updateSymptom } from "../../../../controllers/symptomController";
import Swal from "sweetalert2"; // pastikan sudah di-import di atas


const SymptomEditPage = ({ symptomId, onClose, onSaved }) => {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);


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
      const symptom = await getSymptomById(symptomId);
      const userData = JSON.parse(localStorage.getItem("user"));

      setCurrentUser(userData);

      setForm({
        ...symptom,
        edited_by: userData?.user_id || userData?.id || "",
      });
    } catch (err) {
      console.error("Error fetching data:", err);
  setError("Failed to fetch symptom data.");
    } finally {
      setLoading(false);
    }
  };

  if (symptomId) fetchData();
}, [symptomId]);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setSubmitting(true);
  setError("");

  try {
    await updateSymptom(symptomId, form);

    Swal.fire({
      icon: "success",
      title: "Success",
      text: "Symptom data has been successfully updated.",
      timer: 1500,
      showConfirmButton: false,
    });

    if (onSaved) onSaved();
  } catch (err) {
    setError("Failed to update symptom data.");

    Swal.fire({
      icon: "error",
      title: "Failed to Update",
      text: "An error occurred while updating symptom data.",
    });
  } finally {
    setSubmitting(false);
  }
};


 return (
  <div
    className="modal fade show d-block"
      style={{ background: submitting ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.5)", minHeight: "100vh", paddingTop: "3rem" }}
  >
    <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
      <div className="modal-content">
        <div className="modal-header">
          <h4 className="modal-title text-info fw-bold">
            Edit Symptom Data
          </h4>
          <button className="btn-close" onClick={onClose} disabled={submitting}></button>
        </div>
        <div className="modal-body">
          {error && <p className="text-danger text-center">{error}</p>}
          {loading || !form ? (
<p className="text-center">Loading symptom data...</p>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="row">
                {Object.entries(form).map(([key, value]) => {
                  if (key === "id" || key === "health_check") return null;

                  const options = selectOptions[key];
                  if (options) {
                    return (
                      <div key={key} className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">
                          {key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </label>
                        <select
                          name={key}
                          value={value}
                          onChange={handleChange}
                          className="form-select"
                          required
                        >
                          {options.map((opt, i) => (
                            <option key={i} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
              <button
                type="submit"
                className="btn btn-info w-100 fw-semibold"
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

export default SymptomEditPage;
