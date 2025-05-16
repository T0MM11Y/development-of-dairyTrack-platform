import { useState, useEffect } from "react";
import { createSymptom } from "../../../../controllers/symptomController";
import { getSymptoms } from '../../../../controllers/symptomController';
import { getHealthChecks } from "../../../../controllers/healthCheckController";
import { listCows } from "../../../../controllers/cowsController";
import Swal from "sweetalert2"; // pastikan sudah di-import
import { useMemo } from "react";
import { listCowsByUser } from "../../../../../Modules/controllers/cattleDistributionController";


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
    created_by: "",

  });
  const [symptoms, setSymptoms] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
      const [userManagedCows, setUserManagedCows] = useState([]);


const rawCows = currentUser?.role_id === 1 ? cows : userManagedCows;

const filteredHealthChecks = useMemo(() => {
  return healthChecks.filter((hc) => {
    const sudahAdaSymptom = symptoms.some((symptom) => {
      return String(symptom.health_check) === String(hc.id);
    });

    const isCowAccessible = rawCows.some((cow) => cow.id === hc.cow.id);

    return (
      hc.needs_attention &&
      hc.status !== "handled" &&
      !sudahAdaSymptom &&
      isCowAccessible // ✅ hanya health check milik sapi yang bisa diakses user
    );
  });
}, [healthChecks, symptoms, rawCows]);

  
     // Add this near other useEffect hooks
      useEffect(() => {
        const fetchUserManagedCows = async () => {
          if (currentUser?.user_id) {
            try {
              const { success, cows } = await listCowsByUser(currentUser.user_id);
              if (success && cows) {
                setUserManagedCows(cows);
              }
            } catch (err) {
              console.error("Error fetching user's cows:", err);
            }
          }
        };
    
        fetchUserManagedCows();
      }, [currentUser]);
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
      const userData = JSON.parse(localStorage.getItem("user"));
      if (userData?.user_id || userData?.id) {
        setCurrentUser(userData); // ✅ tambahkan ini
        setForm((prev) => ({
          ...prev,
          created_by: userData.user_id || userData.id,
        }));
      }

      const [hcData, cowData, symptomData] = await Promise.all([
        getHealthChecks(),
        listCows(),
        getSymptoms(),
      ]);
      setHealthChecks(hcData);
      setCows(Array.isArray(cowData) ? cowData : cowData.cows || []);
      setSymptoms(symptomData);
    } catch (err) {
      console.error("Gagal mengambil data:", err);
      setError("Gagal mengambil data pemeriksaan, sapi, atau gejala.");
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
    setError("");
  
    try {
      await createSymptom(form);
  
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Data gejala berhasil disimpan.",
        timer: 1500,
        showConfirmButton: false,
      });
  
      if (onSaved) onSaved();
    } catch (err) {
      setError("Gagal menyimpan data gejala: " + err.message);
  
      Swal.fire({
        icon: "error",
        title: "Gagal Menyimpan",
        text: "Terjadi kesalahan saat menyimpan data gejala.",
      });
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
            <p className="text-center">Memuat daftar pemeriksaan...</p>
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
                  {filteredHealthChecks.map((hc) => {
                    const cow = cows.find((c) => c.id === hc.cow || c.id === hc.cow?.id);
                    return (
                      <option key={hc.id} value={hc.id}>
                        {cow ? `${cow.name}` : "Sapi tidak ditemukan"} - 
                        Suhu: {hc.rectal_temperature}°C, 
                        Detak Jantung: {hc.heart_rate} bpm/menit, 
                        Pernapasan: {hc.respiration_rate} bpm/menit, 
                        Rumenasi: {hc.rumination} kontraksi/menit
                      </option>
                    );
                  })}
                </select>
                {filteredHealthChecks.length === 0 && (
  <div className="text-warning mt-2">
    Tidak ada data pemeriksaan yang tersedia. Mungkin semua pemeriksaan telah ditangani, 
    sudah memiliki gejala, atau tidak termasuk dalam daftar sapi yang Anda kelola.
  </div>
)}
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
               <div className="mb-3">
                <label className="form-label fw-bold">Diperiksa oleh</label>
                <input
                  type="text"
                  className="form-control bg-light"
                  value={currentUser?.name || "Tidak diketahui"}
                  disabled
                />
                <input type="hidden" name="checked_by" value={form.checked_by} />
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
