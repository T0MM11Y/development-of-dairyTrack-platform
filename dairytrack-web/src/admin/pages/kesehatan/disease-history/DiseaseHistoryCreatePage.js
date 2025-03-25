import { useState, useEffect } from "react";
import { createDiseaseHistory } from "../../../../api/kesehatan/diseaseHistory";
import { getCows } from "../../../../api/kesehatan/cow";
import { useNavigate } from "react-router-dom";

const DiseaseHistoryCreatePage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    cow: "",
    disease_date: "",
    disease_name: "",
    description: "",
  });

  const [cows, setCows] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCows = async () => {
    const data = await getCows();
    setCows(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCows();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createDiseaseHistory(form);
    navigate("/admin/kesehatan/riwayat");
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Tambah Riwayat Penyakit</h2>
      <form onSubmit={handleSubmit}>
        <table className="table-auto w-full max-w-2xl text-sm">
          <tbody>
            <tr>
              <td className="p-2">Pilih Sapi</td>
              <td className="p-2">
                <select
                  name="cow"
                  value={form.cow}
                  onChange={handleChange}
                  required
                  className="w-full border px-2 py-1"
                >
                  <option value="">-- Pilih Sapi --</option>
                  {cows.map((cow) => (
                    <option key={cow.id} value={cow.id}>
                      {cow.name} ({cow.breed})
                    </option>
                  ))}
                </select>
              </td>
            </tr>
            <tr>
              <td className="p-2">Tanggal Penyakit</td>
              <td className="p-2">
                <input
                  type="date"
                  name="disease_date"
                  value={form.disease_date}
                  onChange={handleChange}
                  className="w-full border px-2 py-1"
                  required
                />
              </td>
            </tr>
            <tr>
              <td className="p-2">Nama Penyakit</td>
              <td className="p-2">
                <input
                  type="text"
                  name="disease_name"
                  value={form.disease_name}
                  onChange={handleChange}
                  className="w-full border px-2 py-1"
                  required
                />
              </td>
            </tr>
            <tr>
              <td className="p-2">Deskripsi</td>
              <td className="p-2">
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="w-full border px-2 py-1"
                  rows={3}
                />
              </td>
            </tr>
            <tr>
              <td colSpan="2" className="p-2 text-right">
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Simpan
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </form>
    </div>
  );
};

export default DiseaseHistoryCreatePage;
