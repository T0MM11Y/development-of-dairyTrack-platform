import { useState } from "react";
import { createSymptom } from "../../../../api/kesehatan/symptom";
import { useNavigate } from "react-router-dom";

const SymptomCreatePage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    health_check: 8, // Ubah ID ini sesuai dengan pemeriksaan yang valid
    eye_condition: "",
    mouth_condition: "",
    nose_condition: "",
    anus_condition: "",
    leg_condition: "",
    skin_condition: "",
    behavior: "",
    weight_condition: "",
    body_temperature: "",
    reproductive_condition: "",
    treatment_status: "Not Treated",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createSymptom(form);
      navigate("/admin/kesehatan/gejala");
    } catch (err) {
      alert("Gagal menyimpan data gejala: " + err.message);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Tambah Gejala Sapi</h2>
      <form onSubmit={handleSubmit}>
        <table className="table-auto w-full max-w-2xl text-sm">
          <tbody>
            <tr>
              <td className="p-2">Kondisi Mata</td>
              <td className="p-2">
                <input
                  name="eye_condition"
                  value={form.eye_condition}
                  onChange={handleChange}
                  className="w-full border px-2 py-1"
                />
              </td>
            </tr>
            <tr>
              <td className="p-2">Kondisi Mulut</td>
              <td className="p-2">
                <input
                  name="mouth_condition"
                  value={form.mouth_condition}
                  onChange={handleChange}
                  className="w-full border px-2 py-1"
                />
              </td>
            </tr>
            <tr>
              <td className="p-2">Kondisi Hidung</td>
              <td className="p-2">
                <input
                  name="nose_condition"
                  value={form.nose_condition}
                  onChange={handleChange}
                  className="w-full border px-2 py-1"
                />
              </td>
            </tr>
            <tr>
              <td className="p-2">Kondisi Anus</td>
              <td className="p-2">
                <input
                  name="anus_condition"
                  value={form.anus_condition}
                  onChange={handleChange}
                  className="w-full border px-2 py-1"
                />
              </td>
            </tr>
            <tr>
              <td className="p-2">Kondisi Kaki</td>
              <td className="p-2">
                <input
                  name="leg_condition"
                  value={form.leg_condition}
                  onChange={handleChange}
                  className="w-full border px-2 py-1"
                />
              </td>
            </tr>
            <tr>
              <td className="p-2">Kondisi Kulit</td>
              <td className="p-2">
                <input
                  name="skin_condition"
                  value={form.skin_condition}
                  onChange={handleChange}
                  className="w-full border px-2 py-1"
                />
              </td>
            </tr>
            <tr>
              <td className="p-2">Perilaku</td>
              <td className="p-2">
                <input
                  name="behavior"
                  value={form.behavior}
                  onChange={handleChange}
                  className="w-full border px-2 py-1"
                />
              </td>
            </tr>
            <tr>
              <td className="p-2">Berat Badan</td>
              <td className="p-2">
                <input
                  name="weight_condition"
                  value={form.weight_condition}
                  onChange={handleChange}
                  className="w-full border px-2 py-1"
                />
              </td>
            </tr>
            <tr>
              <td className="p-2">Suhu Tubuh</td>
              <td className="p-2">
                <input
                  name="body_temperature"
                  value={form.body_temperature}
                  onChange={handleChange}
                  className="w-full border px-2 py-1"
                />
              </td>
            </tr>
            <tr>
              <td className="p-2">Kondisi Kelamin</td>
              <td className="p-2">
                <input
                  name="reproductive_condition"
                  value={form.reproductive_condition}
                  onChange={handleChange}
                  className="w-full border px-2 py-1"
                />
              </td>
            </tr>
            <tr>
              <td className="p-2">Status Penanganan</td>
              <td className="p-2">
                <input
                  name="treatment_status"
                  value={form.treatment_status}
                  onChange={handleChange}
                  className="w-full border px-2 py-1"
                />
              </td>
            </tr>
          </tbody>
        </table>

        <div className="mt-4">
          <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
            Simpan
          </button>
        </div>
      </form>
    </div>
  );
};

export default SymptomCreatePage;
