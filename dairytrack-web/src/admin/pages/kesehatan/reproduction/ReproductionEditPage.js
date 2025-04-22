import { useEffect, useState } from "react";
import {
  getReproductionById,
  updateReproduction,
} from "../../../../api/kesehatan/reproduction";

const ReproductionEditPage = ({ reproductionId, onClose, onSaved }) => {
  const [form, setForm] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getReproductionById(reproductionId);
        setForm(res);
      } catch (err) {
        console.error("Gagal mengambil data:", err);
        setError("Gagal memuat data reproduksi.");
      }
    };
    if (reproductionId) fetchData();
  }, [reproductionId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updateReproduction(reproductionId, form);
      if (onSaved) onSaved();
    } catch (err) {
      console.error("Gagal memperbarui data:", err);
      setError("Gagal memperbarui data. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!form) {
    return (
      <div className="modal fade show d-block" style={{ background: "rgba(0,0,0,0.5)", minHeight: "100vh" }}>
        <div className="modal-dialog modal-lg">
          <div className="modal-content p-4 text-center">
            <div className="spinner-border text-info" role="status" />
            <p className="mt-2">Memuat data reproduksi...</p>
          </div>
        </div>
      </div>
    );
  }

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
            <h4 className="modal-title text-info fw-bold">Edit Data Reproduksi</h4>
            <button
              className="btn-close"
              onClick={onClose}
              disabled={submitting}
            ></button>
          </div>
          <div className="modal-body">
            {error && <p className="text-danger text-center">{error}</p>}
            <form onSubmit={handleSubmit}>
              <div className="row">
                {Object.entries(form).map(([key, value]) => {
                  if (key === "id" || key === "cow") return null;
                  return (
                    <div className="col-md-6 mb-3" key={key}>
                      <label className="form-label fw-bold">
                        {key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                      </label>
                      <input
                        type="number"
                        name={key}
                        value={value}
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
                className="btn btn-info w-100"
                disabled={submitting}
              >
                {submitting ? "Memperbarui..." : "Perbarui Data"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReproductionEditPage;
