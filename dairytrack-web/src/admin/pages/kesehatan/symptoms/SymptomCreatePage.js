import { useState, useEffect } from "react";
import { createSymptom } from "../../../../api/kesehatan/symptom";
import { getHealthChecks } from "../../../../api/kesehatan/healthCheck";
import { getCows } from "../../../../api/peternakan/cow";

const SymptomCreatePage = ({ onClose, onSaved }) => {
  const [healthChecks, setHealthChecks] = useState([]);
  const [cows, setCows] = useState([]);
  const [form, setForm] = useState({
    health_check: "",
    eye_condition: "Normal",
    mouth_condition: "Normal",
    nose_condition: "Normal",
    anus_condition: "Normal",
    leg_condition: "Normal",
    skin_condition: "Normal",
    behavior: "Normal",
    weight_condition: "Normal",
    reproductive_condition: "Normal",
    treatment_status: "Not Treated",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const selectOptions = {
    eye_condition: [
      "Normal",
      "Mata merah",
      "Mata tidak cemerlang dan atau tidak bersih",
      "Terdapat kotoran atau lendir pada mata",
    ],
    mouth_condition: [
      "Normal",
      "Mulut berbusa",
      "Mulut mengeluarkan lendir",
      "Mulut terdapat kotoran (terutama di sudut mulut)",
      "Warna bibir pucat",
      "Mulut berbau tidak enak",
      "Terdapat luka di mulut",
    ],
    nose_condition: [
      "Normal",
      "Hidung mengeluarkan ingus",
      "Hidung mengeluarkan darah",
      "Di sekitar lubang hidung terdapat kotoran",
    ],
    anus_condition: [
      "Normal",
      "Kotoran terlihat terlalu keras atau terlalu cair (mencret)",
      "Kotoran terdapat bercak darah",
    ],
    leg_condition: [
      "Normal",
      "Kaki bengkak",
      "Kaki terdapat luka",
      "Luka pada kuku kaki",
    ],
    skin_condition: [
      "Normal",
      "Kulit terlihat tidak bersih (cemerlang)",
      "Terdapat benjolan atau bentol-bentol",
      "Terdapat luka pada kulit",
      "Terdapat banyak kutu",
    ],
    behavior: [
      "Normal",
      "Nafsu makan berkurang, beda dari sapi lain",
      "Memisahkan diri dari kawanannya",
      "Seringkali dalam posisi duduk/tidur",
    ],
    weight_condition: [
      "Normal",
      "Terjadi penurunan bobot dibandingkan sebelumnya",
      "Terlihat tulang karena ADG semakin menurun",
    ],
    reproductive_condition: [
      "Normal",
      "Kelamin sulit mengeluarkan urine",
      "Kelamin berlendir",
      "Kelamin berdarah",
    ],
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hcData, cowData] = await Promise.all([
          getHealthChecks(),
          getCows(),
        ]);
        setHealthChecks(hcData);
        setCows(cowData);
      } catch (err) {
        console.error("Gagal mengambil data:", err);
        setError("Gagal mengambil data pemeriksaan atau sapi.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createSymptom(form);
      if (onSaved) onSaved();
    } catch (err) {
      console.error("Gagal menyimpan data gejala:", err);
      setError("Gagal menyimpan data gejala: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal fade show d-block"
      style={{
        background: submitting ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.5)",
        minHeight: "100vh",
        paddingTop: "3rem",
      }}
    >
      <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title text-info fw-bold">Tambah Data Gejala</h4>
            <button
              className="btn-close"
              onClick={onClose}
              disabled={submitting}
            ></button>
          </div>
          <div className="modal-body">
            {error && <p className="text-danger text-center">{error}</p>}
            {loading ? (
              <p className="text-center">Memuat data pemeriksaan...</p>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Pemeriksaan */}
                <div className="mb-3">
                  <label className="form-label fw-bold">Pemeriksaan</label>
                  <select
                    name="health_check"
                    value={form.health_check}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="">-- Pilih Pemeriksaan --</option>
                    {healthChecks.map((hc) => {
                      const cow = cows.find((c) => c.id === hc.cow);
                      return (
                        <option key={hc.id} value={hc.id}>
                          {cow ? `${cow.name} (${cow.breed})` : "Sapi tidak ditemukan"} - {hc.rectal_temperature}°C
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Gejala */}
                <div className="row">
                  {Object.entries(selectOptions).map(([key, options]) => (
                    <div className="col-md-6 mb-3" key={key}>
                      <label className="form-label fw-bold">
                        {key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                      </label>
                      <select
                        name={key}
                        value={form[key]}
                        onChange={handleChange}
                        className="form-select"
                        required
                      >
                        {options.map((opt, idx) => (
                          <option key={idx} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>

                {/* Penanganan */}
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Status Penanganan</label>
                    <select
                      name="treatment_status"
                      value={form.treatment_status}
                      onChange={handleChange}
                      className="form-select"
                    >
                      <option value="Not Treated">Belum Ditangani</option>
                      <option value="Treated">Sudah Ditangani</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-info w-100"
                  disabled={submitting}
                >
                  {submitting ? "Menyimpan..." : "Simpan"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SymptomCreatePage;
