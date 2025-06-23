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
      "Mata merah",
      "Mata tidak cemerlang dan atau tidak bersih",
      "Terdapat kotoran atau lendir pada mata",
    ],
    mouth_condition: [
      "Normal",
      "Mulut berbusa",
      "Mulut mengeluarkan lendir",
      "Mulut terdapat kotoran (terutama di sudut mulut)",
      "Warna bibir pucat",
      "Mulut berbau tidak enak",
      "Terdapat luka di mulut",
    ],
    nose_condition: [
      "Normal",
      "Hidung mengeluarkan ingus",
      "Hidung mengeluarkan darah",
      "Di sekitar lubang hidung terdapat kotoran",
    ],
    anus_condition: [
      "Normal",
      "Kotoran terlihat terlalu keras atau terlalu cair (mencret)",
      "Kotoran terdapat bercak darah",
    ],
    leg_condition: [
      "Normal",
      "Kaki bengkak",
      "Kaki terdapat luka",
      "Luka pada kuku kaki",
    ],
    skin_condition: [
      "Normal",
      "Kulit terlihat tidak bersih (cemerlang)",
      "Terdapat benjolan atau bentol-bentol",
      "Terdapat luka pada kulit",
      "Terdapat banyak kutu",
    ],
    behavior: [
      "Normal",
      "Nafsu makan berkurang, beda dari sapi lain",
      "Memisahkan diri dari kawanannya",
      "Seringkali dalam posisi duduk/tidur",
    ],
    weight_condition: [
      "Normal",
      "Terjadi penurunan bobot dibandingkan sebelumnya",
      "Terlihat tulang karena ADG semakin menurun",
    ],
    reproductive_condition: [
      "Normal",
      "Kelamin sulit mengeluarkan urine",
      "Kelamin berlendir",
      "Kelamin berdarah",
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
