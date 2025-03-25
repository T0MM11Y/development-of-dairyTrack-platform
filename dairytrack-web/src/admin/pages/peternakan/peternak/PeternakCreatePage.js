import { useState } from "react";
import { createCow } from "../../../../api/peternakan/cow";
import { useNavigate } from "react-router-dom";

const CowCreatePage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    breed: "",
    birth_date: "",
    weight_kg: 0,
    reproductive_status: "",
    gender: "",
    entry_date: "",
    lactation_status: false,
    lactation_phase: "",
    farmer: 2, // Ganti sesuai ID peternak valid
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = type === "checkbox" ? checked : value;

    if (name === "weight_kg") {
      finalValue = parseFloat(value) || 0;
    }

    setForm({ ...form, [name]: finalValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createCow(form);
      navigate("/admin/peternakan/sapi");
    } catch (err) {
      console.error("Create cow error:", err);
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
                  onChange={handleChange}
                  required
                  className="w-full border px-2 py-1"
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
                <input
                  type="text"
                  name="reproductive_status"
                  value={form.reproductive_status}
                  onChange={handleChange}
                  className="w-full border px-2 py-1"
                />
              </td>
            </tr>
            <tr>
              <td className="p-2">Gender</td>
              <td className="p-2">
                <input
                  type="text"
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  required
                  className="w-full border px-2 py-1"
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
                <input
                  type="text"
                  name="lactation_phase"
                  value={form.lactation_phase}
                  onChange={handleChange}
                  className="w-full border px-2 py-1"
                />
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
          </tbody>
        </table>

        <div className="mt-4">
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
          >
            Simpan
          </button>
        </div>
      </form>
    </div>
  );
};

export default CowCreatePage;
