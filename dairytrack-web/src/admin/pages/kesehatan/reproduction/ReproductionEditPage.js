import { useEffect, useState } from "react";
import { getReproductionById, updateReproduction } from "../../../../api/kesehatan/reproduction";
import { useNavigate, useParams } from "react-router-dom";

const ReproductionEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getReproductionById(id);
        setForm(res);
      } catch (err) {
        console.error("Gagal mengambil data:", err);
        setError("Gagal memuat data reproduksi.");
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updateReproduction(id, form);
      navigate("/admin/kesehatan/reproduksi");
    } catch (err) {
      console.error("Gagal memperbarui data:", err);
      setError("Gagal memperbarui data. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!form) {
    return (
      <div className="text-center p-4">
        <div className="spinner-border text-info" role="status"></div>
        <p className="mt-2">Memuat data reproduksi...</p>
      </div>
    );
  }

  return (
    <div
      className="modal show d-block"
      style={{
        background: submitting ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.5)",
        minHeight: "100vh",
        paddingTop: "3rem",
      }}
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title text-info fw-bold">Edit Data Reproduksi</h4>
            <button
              className="btn-close"
              onClick={() => navigate("/admin/kesehatan/reproduksi")}
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
                        type="text"
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
