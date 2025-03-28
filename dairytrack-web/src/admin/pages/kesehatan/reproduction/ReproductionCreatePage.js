import { useState, useEffect } from "react";
import { createReproduction } from "../../../../api/kesehatan/reproduction";
import { getCows } from "../../../../api/peternakan/cow";
import { useNavigate } from "react-router-dom";

const ReproductionCreatePage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    cow: "",
    birth_interval: "",
    service_period: "",
    conception_rate: "",
  });

  const [cows, setCows] = useState([]);

  useEffect(() => {
    const fetchCows = async () => {
      try {
        const data = await getCows();
        setCows(data);
      } catch (err) {
        alert("Gagal memuat data sapi: " + err.message);
      }
    };
    fetchCows();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createReproduction(form);
      navigate("/admin/kesehatan/reproduksi");
    } catch (err) {
      alert("Gagal menyimpan data reproduksi: " + err.message);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Tambah Reproduksi Sapi</h2>
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
                  className="w-full border px-2 py-1"
                  required
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
              <td className="p-2">Interval Kelahiran (hari)</td>
              <td className="p-2">
                <input
                  type="number"
                  name="birth_interval"
                  value={form.birth_interval}
                  onChange={handleChange}
                  className="w-full border px-2 py-1"
                  required
                />
              </td>
            </tr>
            <tr>
              <td className="p-2">Masa Layanan (hari)</td>
              <td className="p-2">
                <input
                  type="number"
                  name="service_period"
                  value={form.service_period}
                  onChange={handleChange}
                  className="w-full border px-2 py-1"
                  required
                />
              </td>
            </tr>
            <tr>
              <td className="p-2">Tingkat Konsepsi (%)</td>
              <td className="p-2">
                <input
                  type="number"
                  name="conception_rate"
                  value={form.conception_rate}
                  onChange={handleChange}
                  className="w-full border px-2 py-1"
                  required
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

export default ReproductionCreatePage;
