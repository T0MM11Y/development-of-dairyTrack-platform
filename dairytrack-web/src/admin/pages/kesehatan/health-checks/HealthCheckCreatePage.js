import { useEffect, useState } from "react";
import { createHealthCheck } from "../../../../api/kesehatan/healthCheck";
import { getCows } from "../../../../api/peternakan/cow";
import { useNavigate } from "react-router-dom";

const HealthCheckCreatePage = () => {
  const navigate = useNavigate();
  const [cows, setCows] = useState([]);
  const [form, setForm] = useState({
    cow: "", // akan diisi dengan id dari dropdown
    checkup_date: "",
    rectal_temperature: "",
    heart_rate: "",
    respiration_rate: "",
    rumination: "",
    treatment_status: "Not Treated",
  });

  useEffect(() => {
    const fetchCows = async () => {
      try {
        const res = await getCows();
        setCows(res);
      } catch (err) {
        console.error("Gagal mengambil data sapi:", err);
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
    await createHealthCheck(form);
    navigate("/admin/kesehatan/pemeriksaan");
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Tambah Pemeriksaan</h2>
      <form onSubmit={handleSubmit}>
        <table className="table-auto">
          <tbody>
            <tr>
              <td className="p-2">Sapi</td>
              <td className="p-2">
                <select
                  name="cow"
                  value={form.cow}
                  onChange={handleChange}
                  className="border px-2 py-1 w-full"
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
              <td className="p-2">Tanggal Pemeriksaan</td>
              <td className="p-2">
                <input
                  type="datetime-local"
                  name="checkup_date"
                  value={form.checkup_date}
                  onChange={handleChange}
                  className="border px-2 py-1 w-full"
                  required
                />
              </td>
            </tr>
            <tr>
              <td className="p-2">Suhu Rektal (°C)</td>
              <td className="p-2">
                <input
                  type="number"
                  step="0.01"
                  name="rectal_temperature"
                  value={form.rectal_temperature}
                  onChange={handleChange}
                  className="border px-2 py-1 w-full"
                  required
                />
              </td>
            </tr>
            <tr>
              <td className="p-2">Denyut Jantung</td>
              <td className="p-2">
                <input
                  type="number"
                  name="heart_rate"
                  value={form.heart_rate}
                  onChange={handleChange}
                  className="border px-2 py-1 w-full"
                  required
                />
              </td>
            </tr>
            <tr>
              <td className="p-2">Frekuensi Napas</td>
              <td className="p-2">
                <input
                  type="number"
                  name="respiration_rate"
                  value={form.respiration_rate}
                  onChange={handleChange}
                  className="border px-2 py-1 w-full"
                  required
                />
              </td>
            </tr>
            <tr>
              <td className="p-2">Ruminasi</td>
              <td className="p-2">
                <input
                  type="number"
                  step="0.1"
                  name="rumination"
                  value={form.rumination}
                  onChange={handleChange}
                  className="border px-2 py-1 w-full"
                  required
                />
              </td>
            </tr>
            <tr>
              <td className="p-2">Status Pengobatan</td>
              <td className="p-2">
                <select
                  name="treatment_status"
                  value={form.treatment_status}
                  onChange={handleChange}
                  className="border px-2 py-1 w-full"
                >
                  <option value="Not Treated">Belum Diobati</option>
                  <option value="Treated">Sudah Diobati</option>
                </select>
              </td>
            </tr>
            <tr>
              <td colSpan="2" className="p-2">
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

export default HealthCheckCreatePage;
