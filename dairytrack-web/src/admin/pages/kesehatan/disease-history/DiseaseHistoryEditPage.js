import { useEffect, useState } from "react";
import {
  getDiseaseHistoryById,
  updateDiseaseHistory,
} from "../../../../api/kesehatan/diseaseHistory";
import { getCows } from "../../../../api/peternakan/cow";
import { useNavigate, useParams } from "react-router-dom";

const DiseaseHistoryEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    cow: "",
    disease_name: "",
    description: "",
  });

  const [cowName, setCowName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cowData = await getCows();
        const res = await getDiseaseHistoryById(id);

        const cowId = res.cow || ""; // ✅ fix: gunakan 'cow', bukan 'cow_id'
        const cowInfo = cowData.find((c) => c.id === cowId);

        setForm({
          cow: cowId,
          disease_name: res.disease_name || "",
          description: res.description || "",
        });

        setCowName(
          cowInfo
            ? `${cowInfo.name} (${cowInfo.breed})`
            : "Data sapi tidak ditemukan"
        );
      } catch (err) {
        console.error("Gagal mengambil data:", err);
        setError("Gagal memuat data riwayat penyakit.");
      } finally {
        setLoading(false);
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
      await updateDiseaseHistory(id, form);
      navigate("/admin/kesehatan/riwayat");
    } catch (err) {
      console.error("Gagal memperbarui data:", err);
      setError("Gagal memperbarui data. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center p-4">
        <div className="spinner-border text-info" role="status"></div>
        <p className="mt-2">Memuat data riwayat penyakit...</p>
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
            <h4 className="modal-title text-info fw-bold">
              Edit Riwayat Penyakit
            </h4>
            <button
              className="btn-close"
              onClick={() => navigate("/admin/kesehatan/riwayat")}
              disabled={submitting}
            ></button>
          </div>
          <div className="modal-body">
            {error && <p className="text-danger text-center">{error}</p>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-bold">Sapi</label>
                <input
                  type="text"
                  className="form-control"
                  value={cowName}
                  readOnly
                  disabled
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Nama Penyakit</label>
                <input
                  type="text"
                  name="disease_name"
                  value={form.disease_name}
                  onChange={handleChange}
                  className="form-control"
                  disabled={submitting}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Deskripsi</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="form-control"
                  rows={4}
                  disabled={submitting}
                  required
                ></textarea>
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

export default DiseaseHistoryEditPage;
