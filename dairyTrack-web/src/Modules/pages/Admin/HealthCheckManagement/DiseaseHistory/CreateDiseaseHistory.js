import { useEffect, useState } from "react";
import { createDiseaseHistory } from "../../../../controllers/diseaseHistoryController";
import { getHealthChecks } from "../../../../controllers/healthCheckController";
import { getSymptoms } from "../../../../controllers/symptomController";
import { listCows } from "../../../../controllers/cowsController";
import Swal from "sweetalert2";
import { listCowsByUser } from "../../../../../Modules/controllers/cattleDistributionController";


const DiseaseHistoryCreatePage = ({ onClose, onSaved }) => {
  const [form, setForm] = useState({
    health_check: "",
    disease_name: "",
    description: "",
  });

  const [healthChecks, setHealthChecks] = useState([]);
  const [symptoms, setSymptoms] = useState([]);
  const [cows, setCows] = useState([]);
  const [selectedCheck, setSelectedCheck] = useState(null);
  const [selectedSymptom, setSelectedSymptom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
const [userManagedCows, setUserManagedCows] = useState([]);


 useEffect(() => {
  const fetchData = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      if (userData?.user_id || userData?.id) {
        setCurrentUser(userData);
        setForm((prev) => ({
          ...prev,
          created_by: userData.user_id || userData.id,
        }));

        // 🔁 Ambil sapi yang dikelola user
        const { success, cows } = await listCowsByUser(userData.user_id || userData.id);
        if (success) setUserManagedCows(cows || []);
      }

      const [hcData, symData, cowData] = await Promise.all([
        getHealthChecks(),
        getSymptoms(),
        listCows(),
      ]);

      setHealthChecks(Array.isArray(hcData) ? hcData : []);
      setSymptoms(Array.isArray(symData) ? symData : []);
      setCows(Array.isArray(cowData) ? cowData : Array.isArray(cowData?.cows) ? cowData.cows : []);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);




  const handleChange = (e) => {
    const { name, value } = e.target;

    let finalValue = value;

    if (name === "health_check") {
      finalValue = parseInt(value);
      const check = healthChecks.find((c) => c.id === finalValue);
      const sym = symptoms.find((s) => s.health_check === finalValue);
      setSelectedCheck(check || null);
      setSelectedSymptom(sym || null);
    }

    setForm((prev) => ({
      ...prev,
      [name]: finalValue,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await createDiseaseHistory(form);

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Riwayat penyakit berhasil disimpan.",
        timer: 1500,
        showConfirmButton: false,
      });

      if (onSaved) onSaved();
    } catch (err) {
      setError("Gagal menyimpan data riwayat penyakit.");

      Swal.fire({
        icon: "error",
        title: "Gagal Menyimpan",
        text: "Terjadi kesalahan saat menyimpan data riwayat penyakit.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getCowInfo = (check) => {
    const cowId = typeof check?.cow === "object" ? check.cow.id : check?.cow;
    const cowArray = Array.isArray(cows) ? cows : [];
    const cow = cowArray.find((c) => c.id === cowId);
    return cow ? `${cow.name} (${cow.breed})` : "-";
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
          <h4 className="modal-title text-info fw-bold">Tambah Riwayat Penyakit</h4>
          <button className="btn-close" onClick={onClose} disabled={submitting}></button>
        </div>
        <div className="modal-body">
          {error && <p className="text-danger text-center">{error}</p>}
          {loading ? (
            <p className="text-center">Memuat data...</p>
          ) : (
            <form onSubmit={handleSubmit}>
            {/* Pilih Pemeriksaan */}
<div className="mb-3">
  <label className="form-label fw-bold">Pilih Pemeriksaan</label>
  <select
    name="health_check"
    value={form.health_check}
    onChange={handleChange}
    className="form-select"
    required
  >
    <option value="">-- Pilih Pemeriksaan --</option>
{Array.isArray(healthChecks) &&
  healthChecks
    .filter((check) => {
      const status = (check.status || "").toLowerCase();
      const cowId = typeof check?.cow === "object" ? check.cow.id : check?.cow;
      const isOwned = userManagedCows.some((cow) => cow.id === cowId);
      return status !== "handled" && status !== "healthy" && isOwned;
    })
    .map((check) => {
      const cowId = typeof check?.cow === "object" ? check.cow.id : check?.cow;
      const cow = cows.find((c) => String(c.id) === String(cowId));

      return (
        <option key={check.id} value={check.id}>
          {cow ? `${cow.name} (${cow.breed})` : `ID: ${cowId} (sapi tidak ditemukan)` }
        </option>
      );
    })}



  </select>
  {Array.isArray(healthChecks) &&
  healthChecks.filter((check) => {
    const status = (check.status || "").toLowerCase();
    const cowId = typeof check?.cow === "object" ? check.cow.id : check?.cow;
    const isOwned = userManagedCows.some((cow) => cow.id === cowId);
    return status !== "handled" && status !== "healthy" && isOwned;
  }).length === 0 && (
    <div className="text-warning mt-2">
      Tidak ada pemeriksaan yang tersedia. Mungkin semua sudah ditangani, sudah sehat, 
      atau tidak termasuk dalam daftar sapi yang Anda kelola.
    </div>
)}

</div>
{/* Info Sapi */}
{selectedCheck && (
  <div className="mb-3">
    <label className="form-label fw-bold">Sapi</label>
    <input
      type="text"
      value={getCowInfo(selectedCheck)}
      className="form-control"
      readOnly
    />
  </div>
)}

              {/* Info Pemeriksaan */}
              {selectedCheck && (
                <>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Suhu Rektal</label>
                    <input
                      type="text"
                      value={`${selectedCheck.rectal_temperature} °C`}
                      className="form-control"
                      readOnly
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">Denyut Jantung</label>
                    <input
                      type="text"
                      value={`${selectedCheck.heart_rate} bpm`}
                      className="form-control"
                      readOnly
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">Laju Pernapasan</label>
                    <input
                      type="text"
                      value={`${selectedCheck.respiration_rate} bpm`}
                      className="form-control"
                      readOnly
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-bold">Ruminasi</label>
                    <input
                      type="text"
                      value={`${selectedCheck.rumination} menit`}
                      className="form-control"
                      readOnly
                    />
                  </div>
                </>
              )}

              {/* Info Gejala */}
              {selectedSymptom && (
                <div className="mb-3">
                  <label className="form-label fw-bold">Gejala</label>
                  <div className="p-2 bg-light rounded border small">
                    {Object.entries(selectedSymptom)
                      .filter(
                        ([key, val]) =>
                          !["id", "health_check", "created_at"].includes(key) &&
                          typeof val === "string" &&
                          val.toLowerCase() !== "normal"
                      )
                      .map(([key, val]) => (
                        <div key={key}>
                          <strong>{key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}:</strong> {val}
                        </div>
                      ))}

                    {Object.entries(selectedSymptom).filter(
                      ([key, val]) =>
                        !["id", "health_check", "created_at"].includes(key) &&
                        (typeof val !== "string" || val.toLowerCase() === "normal")
                    ).length ===
                      Object.entries(selectedSymptom).filter(
                        ([key]) => !["id", "health_check", "created_at"].includes(key)
                      ).length && <div>Semua kondisi gejala normal</div>}
                  </div>
                </div>
              )}
              {/* Dibuat oleh */}
<div className="mb-3">
  <label className="form-label fw-bold">Dibuat oleh</label>
  <input
    type="text"
    className="form-control bg-light"
    value={currentUser?.name || "Tidak diketahui"}
    disabled
  />
  <input
    type="hidden"
    name="created_by"
    value={currentUser?.user_id || currentUser?.id || ""}
  />
</div>


              {/* Input Penyakit & Deskripsi */}
              <div className="mb-3">
                <label className="form-label fw-bold">Nama Penyakit</label>
                <input
                  type="text"
                  name="disease_name"
                  value={form.disease_name}
                  onChange={handleChange}
                  className="form-control"
                  required
                  disabled={!form.health_check}
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Deskripsi</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className="form-control"
                  rows={3}
                  required
                  disabled={!form.health_check}
                />
              </div>

              <button
                type="submit"
                className="btn btn-info w-100"
                disabled={submitting || !form.health_check}
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

export default DiseaseHistoryCreatePage;
