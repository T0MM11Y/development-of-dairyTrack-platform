import { useState, useEffect } from "react";
import { createCow } from "../../../../api/peternakan/cow";
import { useNavigate } from "react-router-dom";
import { getFarmers } from "../../../../api/peternakan/peternak";

const CowCreatePage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    breed: "Girolando",
    birth_date: "",
    weight_kg: "",
    reproductive_status: "Open",
    gender: "Female",
    entry_date: "",
    lactation_status: false,
    lactation_phase: "Early",
    farmer: "",
  });

  const [error, setError] = useState("");
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFarmers = async () => {
      try {
        const farmerList = await getFarmers();
        setFarmers(farmerList);
      } catch (err) {
        console.error("Error fetching farmers:", err);
        setError("Gagal mengambil data peternak.");
      } finally {
        setLoading(false);
      }
    };

    fetchFarmers();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = type === "checkbox" ? checked : value;

    if (name === "weight_kg") {
      finalValue = value ? Math.max(0, parseFloat(value)) : "";
    }

    setForm((prevForm) => ({ ...prevForm, [name]: finalValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createCow(form);
      navigate("/admin/peternakan/sapi");
    } catch (err) {
      console.error("Failed to create cow:", err);
      setError(
        err.response?.data?.message || "Gagal membuat data sapi. Coba lagi!"
      );
    }
  };

  return (
    <div
      className="card shadow-lg p-4 bg-white rounded"
      style={{ width: "30%", margin: "12rem auto" }}
    >
      <div className="card-body">
        <h4 className="card-title text-center mb-4 text-info">
          Tambah Data Sapi
        </h4>
        {error && <p className="text-danger text-center">{error}</p>}
        {loading ? (
          <p className="text-center">Memuat data peternak...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Nama</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="form-control"
                  placeholder="Masukkan nama sapi"
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Jenis</label>
                <input
                  type="text"
                  className="form-control"
                  value={form.breed}
                  readOnly
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Tanggal Lahir</label>
                <input
                  type="date"
                  name="birth_date"
                  value={form.birth_date}
                  onChange={handleChange}
                  required
                  className="form-control"
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Berat (kg)</label>
                <input
                  type="number"
                  name="weight_kg"
                  value={form.weight_kg}
                  onChange={handleChange}
                  required
                  className="form-control"
                  placeholder="Masukkan berat sapi"
                  min="0"
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
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
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Tanggal Masuk</label>
                <input
                  type="date"
                  name="entry_date"
                  value={form.entry_date}
                  onChange={handleChange}
                  required
                  className="form-control"
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
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
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Peternak</label>
                <select
                  name="farmer"
                  value={form.farmer}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Pilih Peternak</option>
                  {farmers.map((farmer) => (
                    <option key={farmer.id} value={farmer.id}>
                      {farmer.first_name} {farmer.last_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-3 d-flex align-items-center gap-2">
              <input
                type="checkbox"
                className="form-check-input"
                name="lactation_status"
                checked={form.lactation_status}
                onChange={handleChange}
              />
              <label className="form-check-label fw-bold">
                Status Laktasi Aktif
              </label>
            </div>

            <button
              type="submit"
              className="btn btn-info w-100 py-2 mt-3 fw-bold"
            >
              Simpan
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default CowCreatePage;
