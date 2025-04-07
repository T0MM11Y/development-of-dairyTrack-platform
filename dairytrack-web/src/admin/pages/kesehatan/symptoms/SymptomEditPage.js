import { useEffect, useState } from "react";
import { getSymptomById, updateSymptom } from "../../../../api/kesehatan/symptom";

const SymptomEditPage = ({ symptomId, onClose, onSaved }) => {
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getSymptomById(symptomId);
        setForm(res);
      } catch (err) {
        console.error("Error fetching symptom:", err);
        setError("Gagal mengambil data gejala.");
      } finally {
        setLoading(false);
      }
    };
    if (symptomId) {
      fetchData();
    }
  }, [symptomId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updateSymptom(symptomId, form);
      if (onSaved) onSaved();
    } catch (err) {
      console.error("Error updating symptom:", err);
      setError("Gagal memperbarui data gejala.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal fade show d-block"
      style={{ background: submitting ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title text-info fw-bold">Edit Data Gejala</h4>
            <button
              className="btn-close"
              onClick={onClose}
              disabled={submitting}
            ></button>
          </div>
          <div className="modal-body">
            {error && <p className="text-danger text-center">{error}</p>}
            {loading || !form ? (
              <p className="text-center">Memuat data gejala...</p>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="row">
                  {Object.entries(form).map(([key, value]) => {
                    if (key === "id" || key === "health_check") return null;
                    return (
                      <div key={key} className="col-md-6 mb-3">
                        <label className="form-label fw-semibold">
                          {key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </label>
                        <input
                          type="text"
                          name={key}
                          value={value || ""}
                          onChange={handleChange}
                          className="form-control"
                          disabled={submitting}
                        />
                      </div>
                    );
                  })}
                </div>
                <button
                  type="submit"
                  className="btn btn-info w-100 fw-semibold"
                  disabled={submitting}
                >
                  {submitting ? "Memperbarui..." : "Perbarui Data"}
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
