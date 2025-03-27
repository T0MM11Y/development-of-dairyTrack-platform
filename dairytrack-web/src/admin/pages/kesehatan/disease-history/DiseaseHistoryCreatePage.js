import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createDiseaseHistory } from "../../../../api/kesehatan/diseaseHistory";
import { getCows } from "../../../../api/peternakan/cow";
import { getHealthChecks } from "../../../../api/kesehatan/healthCheck";
import { getSymptoms } from "../../../../api/kesehatan/symptom";

const DiseaseHistoryCreatePage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    cow: "",
    health_check: "",
    symptom: "",
    disease_date: "",
    disease_name: "",
    description: "",
  });

  const [cows, setCows] = useState([]);
  const [healthChecks, setHealthChecks] = useState([]);
  const [symptoms, setSymptoms] = useState([]);
  const [filteredSymptoms, setFilteredSymptoms] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const cowData = await getCows();
      const hcData = await getHealthChecks();
      const symptomData = await getSymptoms();

      setCows(cowData);
      setHealthChecks(hcData);
      setSymptoms(symptomData);
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "cow") {
      const cowId = parseInt(value);
      const relatedHealthCheck = healthChecks.find((h) => h.cow === cowId);
      const healthCheckId = relatedHealthCheck ? relatedHealthCheck.id : "";

      const filteredSymps = symptoms.filter((s) => s.health_check === healthCheckId);

      setForm((prev) => ({
        ...prev,
        cow: value,
        health_check: healthCheckId || "",
        symptom: "",
      }));

      setFilteredSymptoms(filteredSymps);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createDiseaseHistory({
      cow: form.cow,
  disease_date: form.disease_date,
  disease_name: form.disease_name,
  description: form.description,
  symptom: form.symptom, // ini penting
  health_check: form.health_check, // ✅ pastikan ini juga dikirim

    });
    navigate("/admin/kesehatan/riwayat");
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Tambah Riwayat Penyakit</h2>
      <form onSubmit={handleSubmit} className="max-w-2xl">
        <div className="mb-3">
          <label className="block mb-1">Pilih Sapi</label>
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
        </div>

        {form.health_check ? (
          <div className="mb-3">
            <label className="block mb-1">Pilih Gejala</label>
            <select
              name="symptom"
              value={form.symptom}
              onChange={handleChange}
              className="w-full border px-2 py-1"
              required
            >
              <option value="">-- Pilih Gejala --</option>
              {filteredSymptoms.map((symp) => (
                <option key={symp.id} value={symp.id}>
                  {symp.eye_condition} / {symp.behavior}
                </option>
              ))}
            </select>
          </div>
        ) : (
          form.cow && (
            <p className="text-sm text-red-600 mb-2">
              Sapi ini belum memiliki pemeriksaan kesehatan.
            </p>
          )
        )}

        <div className="mb-3">
          <label className="block mb-1">Tanggal Penyakit</label>
          <input
            type="date"
            name="disease_date"
            value={form.disease_date}
            onChange={handleChange}
            className="w-full border px-2 py-1"
            required
          />
        </div>

        <div className="mb-3">
          <label className="block mb-1">Nama Penyakit</label>
          <input
            type="text"
            name="disease_name"
            value={form.disease_name}
            onChange={handleChange}
            className="w-full border px-2 py-1"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1">Deskripsi</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows="3"
            className="w-full border px-2 py-1"
          />
        </div>

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Simpan
        </button>
      </form>
    </div>
  );
};

export default DiseaseHistoryCreatePage;
