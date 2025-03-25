import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCowById, updateCow } from "../../../../api/kesehatan/cow";

const CowEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const cow = await getCowById(id);
      setForm(cow);
    };
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === "checkbox" ? checked : value;
    setForm({ ...form, [name]: finalValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateCow(id, form);
    navigate("/admin/kesehatan/sapi");
  };

  if (!form) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Edit Data Sapi</h2>
      <form onSubmit={handleSubmit}>
        <table className="table-auto w-full max-w-2xl text-sm">
          <tbody>
            <tr>
              <td className="p-2">Nama</td>
              <td className="p-2">
                <input type="text" name="name" value={form.name} onChange={handleChange} className="border px-2 py-1 w-full" />
              </td>
            </tr>
            <tr>
              <td className="p-2">Jenis</td>
              <td className="p-2">
                <input type="text" name="breed" value={form.breed} onChange={handleChange} className="border px-2 py-1 w-full" />
              </td>
            </tr>
            <tr>
              <td className="p-2">Tanggal Lahir</td>
              <td className="p-2">
                <input type="date" name="birth_date" value={form.birth_date} onChange={handleChange} className="border px-2 py-1 w-full" />
              </td>
            </tr>
            <tr>
              <td className="p-2">Berat (kg)</td>
              <td className="p-2">
                <input type="number" name="weight_kg" value={form.weight_kg} onChange={handleChange} className="border px-2 py-1 w-full" />
              </td>
            </tr>
            <tr>
              <td className="p-2">Status Reproduksi</td>
              <td className="p-2">
                <input type="text" name="reproductive_status" value={form.reproductive_status} onChange={handleChange} className="border px-2 py-1 w-full" />
              </td>
            </tr>
            <tr>
              <td className="p-2">Gender</td>
              <td className="p-2">
                <input type="text" name="gender" value={form.gender} onChange={handleChange} className="border px-2 py-1 w-full" />
              </td>
            </tr>
            <tr>
              <td className="p-2">Tanggal Masuk</td>
              <td className="p-2">
                <input type="date" name="entry_date" value={form.entry_date} onChange={handleChange} className="border px-2 py-1 w-full" />
              </td>
            </tr>
            <tr>
              <td className="p-2">Fase Laktasi</td>
              <td className="p-2">
                <input type="text" name="lactation_phase" value={form.lactation_phase} onChange={handleChange} className="border px-2 py-1 w-full" />
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
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
            Perbarui Data
          </button>
        </div>
      </form>
    </div>
  );
};

export default CowEditPage;
