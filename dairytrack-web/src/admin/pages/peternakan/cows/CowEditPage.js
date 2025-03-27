import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCowById, updateCow } from "../../../../api/peternakan/cow";

const CowEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cow = await getCowById(id);
        setForm(cow);
      } catch (err) {
        console.error("Error fetching cow data:", err);
        setError("Gagal mengambil data sapi.");
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = type === "checkbox" ? checked : value;
    if (name === "weight_kg") {
      finalValue = value ? Math.max(0, parseFloat(value)) : "";
    }
    setForm({ ...form, [name]: finalValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateCow(id, form);
      navigate("/admin/peternakan/sapi");
    } catch (err) {
      console.error("Failed to update cow:", err);
      setError("Gagal memperbarui data sapi. Coba lagi!");
    }
  };

  if (!form) return <div className="text-center py-4">Memuat data...</div>;

  return (
    <div
      className="card shadow-lg p-4 bg-white rounded"
      style={{ width: "30%", margin: "12rem auto" }}
    >
      <div className="card-body">
        <h4 className="card-title text-center mb-4 text-info">
          Edit Data Sapi
        </h4>
        {error && <p className="text-danger text-center">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-bold">Nama</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label fw-bold">Jenis</label>
            <input
              type="text"
              className="form-control"
              value={form.breed}
              readOnly
            />
          </div>
          <div className="mb-3">
            <label className="form-label fw-bold">Tanggal Lahir</label>
            <input
              type="date"
              name="birth_date"
              value={form.birth_date}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label fw-bold">Berat (kg)</label>
            <input
              type="number"
              name="weight_kg"
              value={form.weight_kg}
              onChange={handleChange}
              className="form-control"
              min="0"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label fw-bold">Status Reproduksi</label>
            <select
              name="reproductive_status"
              value={form.reproductive_status}
              onChange={handleChange}
              className="form-select"
            >
              <option value="Pregnant">Pregnant</option>
              <option value="Open">Open</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label fw-bold">Tanggal Masuk</label>
            <input
              type="date"
              name="entry_date"
              value={form.entry_date}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label fw-bold">Fase Laktasi</label>
            <select
              name="lactation_phase"
              value={form.lactation_phase}
              onChange={handleChange}
              className="form-select"
            >
              <option value="Early">Early</option>
              <option value="Mid">Mid</option>
              <option value="Late">Late</option>
              <option value="Dry">Dry</option>
            </select>
          </div>
          <div className="mb-3 d-flex align-items-center gap-2">
            <input
              type="checkbox"
              name="lactation_status"
              checked={form.lactation_status}
              onChange={handleChange}
              className="form-check-input"
            />
            <label className="form-check-label fw-bold">
              Status Laktasi Aktif
            </label>
          </div>
          <button
            type="submit"
            className="btn btn-info w-100 py-2 mt-3 fw-bold"
          >
            Perbarui Data
          </button>
        </form>
      </div>
    </div>
  );
};

export default CowEditPage;
