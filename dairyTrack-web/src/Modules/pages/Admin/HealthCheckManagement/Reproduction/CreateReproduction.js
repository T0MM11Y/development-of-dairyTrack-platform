import { useState, useEffect } from "react";
import { createReproduction } from "../../../../controllers/reproductionController";
import { listCows } from "../../../../controllers/cowsController";
import Swal from "sweetalert2"; // pastikan sudah di-import
import { listCowsByUser } from "../../../../../Modules/controllers/cattleDistributionController";



const ReproductionCreatePage = ({ onClose, onSaved }) => {
  const [form, setForm] = useState({
    cow: "",
    calving_date: "",
    previous_calving_date: "",
    insemination_date: "",
    total_insemination: "",
    successful_pregnancy: "1", // ✅ Default ke 1
    created_by: "", // ✅ tambahkan ini

  });

const [currentUser, setCurrentUser] = useState(null); // opsional

  const [cows, setCows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
  const fetchCows = async () => {
  try {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData?.user_id || userData?.id) {
      setCurrentUser(userData);
      setForm((prev) => ({
        ...prev,
        created_by: userData.user_id || userData.id,
      }));

      const { success, cows } = await listCowsByUser(userData.user_id || userData.id);
      if (success && Array.isArray(cows)) {
        setCows(cows);
      } else {
        setCows([]);
        console.warn("⚠️ No cows are managed by this user.");
      }
    }
  } catch (err) {
    setError("Failed to load cow data.");
    console.error("🐞 fetchCows error:", err);
  } finally {
    setLoading(false);
  }
};

  fetchCows();
}, []);



  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const calvingDate = new Date(form.calving_date);
    const prevCalvingDate = new Date(form.previous_calving_date);
    const inseminationDate = new Date(form.insemination_date);
    const totalIB = parseInt(form.total_insemination);
    const successIB = parseInt(form.successful_pregnancy);


    // 🧠 Validasi logika
    if (prevCalvingDate >= calvingDate) {
  setError("📌 Previous calving date must be earlier than the current calving date.");
      setSubmitting(false);
      return;
    }

    if (inseminationDate <= calvingDate) {
  setError("📌 Insemination date must be after the current calving date.");
      setSubmitting(false);
      return;
    }

    if (isNaN(totalIB) || totalIB < 1) {
  setError("📌 Total inseminations must be greater than 0.");
      setSubmitting(false);
      return;
    }

    if (isNaN(successIB) || successIB < 1 || successIB > totalIB) {
  setError("📌 Successful pregnancies must be at least 1 and cannot exceed the total number of inseminations.");
      setSubmitting(false);
      return;
    }

try {
  const payload = {
    ...form,
    total_insemination: parseInt(form.total_insemination),
    successful_pregnancy: parseInt(form.successful_pregnancy || 1),
  };

console.log("Reproduction payload sent:", payload);

  // ✅ Kirim ke backend
  await createReproduction(payload);
      Swal.fire({
        icon: "success",
       title: "Success",
  text: "Reproduction data has been successfully saved.",
        timer: 1500,
        showConfirmButton: false,
      });
      if (onSaved) onSaved();

      // 🔁 Reset form (optional)
      setForm({
        cow: "",
        calving_date: "",
        previous_calving_date: "",
        insemination_date: "",
        total_insemination: "",
        successful_pregnancy: "1",
      });
    } catch (err) {
  setError("❌ Failed to save reproduction data. Please ensure all data is valid.");
  
      Swal.fire({
        icon: "error",
     title: "Failed to Save",
    text: "An error occurred while saving reproduction data.",
      });
    } finally {
      setSubmitting(false);
    }
  };
  
 return (
  <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,0.5)", minHeight: "100vh", paddingTop: "3rem" }}>
    <div className="modal-dialog modal-lg">
      <div className="modal-content">
        <div className="modal-header">
          <h4 className="modal-title text-info fw-bold">Add Data</h4>
          <button className="btn-close" onClick={onClose} disabled={submitting}></button>
        </div>
        <div className="modal-body">
          {error && <div className="alert alert-danger text-center">{error}</div>}
          {loading ? (
            <p className="text-center">Loading cow data...</p>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Sapi */}
              <div className="mb-3">
                <label className="form-label fw-bold">Select Cow</label>
<select
  name="cow"
  value={form.cow}
  onChange={handleChange}
  className="form-select"
  required
  disabled={submitting}
>
  <option value="">-- Select Cow --</option>
  {Array.isArray(cows) &&
    cows
      .filter((cow) => cow.gender?.toLowerCase() === "female") // ✅ hanya betina
      .map((cow) => (
        <option key={cow.id} value={cow.id}>
          {cow.name} ({cow.breed})
        </option>
      ))}
</select>
 {/* ⚠️ Tampilkan peringatan jika tidak ada sapi betina */}
  {Array.isArray(cows) && cows.filter((cow) => cow.gender?.toLowerCase() === "female").length === 0 && (
    <div className="text-danger mt-2">
No female cows available. Please check your cow data.
    </div>
  )}
              </div>  

              {/* Tanggal-tanggal */}
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Current Calving Date</label>
                  <input
                    type="date"
                    name="calving_date"
                    value={form.calving_date}
                    onChange={handleChange}
                    className="form-control"
                    required
                    disabled={submitting}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Previous Calving Date</label>
                  <input
                    type="date"
                    name="previous_calving_date"
                    value={form.previous_calving_date}
                    onChange={handleChange}
                    className="form-control"
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              {/* Inseminasi */}
              <div className="row">
                <div className="col-md-6 mb-3">
    <label className="form-label fw-bold">Insemination Date</label>
                  <input
                    type="date"
                    name="insemination_date"
                    value={form.insemination_date}
                    onChange={handleChange}
                    className="form-control"
                    required
                    disabled={submitting}
                  />
                </div>
                <div className="col-md-3 mb-3">
    <label className="form-label fw-bold">Total Inseminations</label>
                  <input
                    type="number"
                    name="total_insemination"
                    value={form.total_insemination}
                    onChange={handleChange}
                    className="form-control"
                    min="1"
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-info w-100" disabled={submitting}>
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

export default ReproductionCreatePage;
