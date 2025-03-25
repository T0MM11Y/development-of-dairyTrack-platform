import { useState, useEffect } from "react";
import { createCow } from "../../../../api/peternakan/cow";
import { useNavigate } from "react-router-dom";
import { getFarmers } from "../../../../api/peternakan/peternak";

const CowCreatePage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    breed: "Girolando", // Tidak dapat diedit
    birth_date: "",
    weight_kg: "",
    reproductive_status: "Open",
    gender: "Female", // Tidak dapat diedit
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

    // Reset form saat halaman dimuat kembali
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
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Tambah Data Sapi</h2>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="max-w-2xl">
        <table className="w-full text-sm">
          <tbody>
            <tr>
              <td className="p-2">Nama</td>
              <td className="p-2">
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full border px-2 py-1"
                />
              </td>
            </tr>
            <tr>
              <td className="p-2">Jenis</td>
              <td className="p-2">
                <input
                  type="text"
                  name="breed"
                  value={form.breed}
                  readOnly
                  className="w-full border px-2 py-1 bg-gray-100"
                />
              </td>
            </tr>
            <tr>
              <td className="p-2">Tanggal Lahir</td>
              <td className="p-2">
                <input
                  type="date"
                  name="birth_date"
                  value={form.birth_date}
                  onChange={handleChange}
                  required
                  className="w-full border px-2 py-1"
                />
              </td>
            </tr>
            <tr>
              <td className="p-2">Berat (kg)</td>
              <td className="p-2">
                <input
                  type="number"
                  name="weight_kg"
                  value={form.weight_kg}
                  onChange={handleChange}
                  required
                  className="w-full border px-2 py-1"
                />
              </td>
            </tr>
            <tr>
              <td className="p-2">Status Reproduksi</td>
              <td className="p-2">
                <select
                  name="reproductive_status"
                  value={form.reproductive_status}
                  onChange={handleChange}
                  className="w-full border px-2 py-1"
                >
                  <option value="Pregnant">Pregnant</option>
                  <option value="Open">Open</option>
                </select>
              </td>
            </tr>
            <tr>
              <td className="p-2">Gender</td>
              <td className="p-2">
                <input
                  type="text"
                  name="gender"
                  value={form.gender}
                  readOnly
                  className="w-full border px-2 py-1 bg-gray-100"
                />
              </td>
            </tr>
            <tr>
              <td className="p-2">Tanggal Masuk</td>
              <td className="p-2">
                <input
                  type="date"
                  name="entry_date"
                  value={form.entry_date}
                  onChange={handleChange}
                  required
                  className="w-full border px-2 py-1"
                />
              </td>
            </tr>
            <tr>
              <td className="p-2">Fase Laktasi</td>
              <td className="p-2">
                <select
                  name="lactation_phase"
                  value={form.lactation_phase}
                  onChange={handleChange}
                  className="w-full border px-2 py-1"
                >
                  <option value="Early">Early</option>
                  <option value="Mid">Mid</option>
                  <option value="Late">Late</option>
                  <option value="Dry">Dry</option>
                </select>
              </td>
            </tr>
            <tr>
              <td className="p-2">Status Laktasi</td>
              <td className="p-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="lactation_status"
                    checked={form.lactation_status}
                    onChange={handleChange}
                  />
                  Aktif
                </label>
              </td>
            </tr>
            <tr>
              <td className="p-2">Peternak</td>
              <td className="p-2">
                <select
                  name="farmer"
                  value={form.farmer}
                  onChange={handleChange}
                  className="w-full border px-2 py-1"
                  required
                >
                  <option value="">Pilih Peternak</option>
                  {farmers.map((farmer) => (
                    <option key={farmer.id} value={farmer.id}>
                      {farmer.first_name} {farmer.last_name}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="mt-4">
          <button
            type="submit"
            className="btn btn-info waves-effect waves-light"
          >
            Simpan
          </button>
        </div>
      </form>
    </div>
  );
};

export default CowCreatePage;
