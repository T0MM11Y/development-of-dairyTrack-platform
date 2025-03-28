import { useEffect, useState } from "react";
import { createSymptom } from "../../../../api/kesehatan/symptom";
import { getHealthChecks } from "../../../../api/kesehatan/healthCheck";
import { useNavigate } from "react-router-dom";

const SymptomCreatePage = () => {
  const navigate = useNavigate();
  const [healthChecks, setHealthChecks] = useState([]);
  const [form, setForm] = useState({
    health_check: "",
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

  useEffect(() => {
    const fetchHealthChecks = async () => {
      try {
        const res = await getHealthChecks();
        setHealthChecks(res);
      } catch (err) {
        console.error("Gagal mengambil data pemeriksaan:", err);
      }
    };
    fetchHealthChecks();
  }, []);

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
              <td className="p-2">Pemeriksaan</td>
              <td className="p-2">
                <select
                  name="health_check"
                  value={form.health_check}
                  onChange={handleChange}
                  className="w-full border px-2 py-1"
                  required
                >
                  <option value="">-- Pilih Pemeriksaan --</option>
                  {healthChecks.map((hc) => (
                    <option key={hc.id} value={hc.id}>
                      {hc.checkup_date} - {hc.rectal_temperature}°C
                    </option>
                  ))}
                </select>
              </td>
            </tr>

            {/* Sisa field tetap seperti sebelumnya */}
            {[
              ["eye_condition", "Kondisi Mata"],
              ["mouth_condition", "Kondisi Mulut"],
              ["nose_condition", "Kondisi Hidung"],
              ["anus_condition", "Kondisi Anus"],
              ["leg_condition", "Kondisi Kaki"],
              ["skin_condition", "Kondisi Kulit"],
              ["behavior", "Perilaku"],
              ["weight_condition", "Berat Badan"],
              ["body_temperature", "Suhu Tubuh"],
              ["reproductive_condition", "Kondisi Kelamin"],
              ["treatment_status", "Status Penanganan"],
            ].map(([name, label]) => (
              <tr key={name}>
                <td className="p-2">{label}</td>
                <td className="p-2">
                  <input
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                    className="w-full border px-2 py-1"
                  />
                </td>
              </tr>
            ))}
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

export default SymptomCreatePage;
