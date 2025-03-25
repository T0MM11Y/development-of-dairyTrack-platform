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

  useEffect(() => {
    const fetchFarmers = async () => {
      try {
        const farmerList = await getFarmers();
        setFarmers(farmerList);
      } catch (err) {
        console.error("Gagal mengambil data peternak:", err);
      }
    };

    fetchFarmers();
    setForm({
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
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = type === "checkbox" ? checked : value;

    if (name === "weight_kg") {
      finalValue = value ? parseFloat(value) : "";
    }

    setForm({ ...form, [name]: finalValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createCow(form);
      navigate("/admin/peternakan/sapi");
    } catch (err) {
      console.error("Gagal membuat data sapi:", err);
      setError("Gagal membuat data sapi: " + err.message);
    }
  };

  return (
    <div className="card" style={{ width: "100%", marginTop: "8rem" }}>
      <div className="card-body">
        <h4 className="card-title">Tambah Data Sapi</h4>
        {error && <p className="text-danger">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Nama</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Jenis</label>
            <input
              type="text"
              className="form-control"
              value={form.breed}
              readOnly
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Tanggal Lahir</label>
            <input
              type="date"
              name="birth_date"
              value={form.birth_date}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Berat (kg)</label>
            <input
              type="number"
              name="weight_kg"
              value={form.weight_kg}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Status Reproduksi</label>
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
            <label className="form-label">Tanggal Masuk</label>
            <input
              type="date"
              name="entry_date"
              value={form.entry_date}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Fase Laktasi</label>
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
          <div className="mb-3 form-check">
            <input
              type="checkbox"
              className="form-check-input"
              name="lactation_status"
              checked={form.lactation_status}
              onChange={handleChange}
            />
            <label className="form-check-label">Status Laktasi Aktif</label>
          </div>
          <div className="mb-3">
            <label className="form-label">Peternak</label>
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
          <button type="submit" className="btn btn-primary">
            Simpan
          </button>
        </form>
      </div>
    </div>
  );
};

export default CowCreatePage;
