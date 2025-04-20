import { useEffect, useState } from "react";
import { getCowById, updateCow } from "../../../../api/peternakan/cow";
import { getFarmers } from "../../../../api/peternakan/farmer";
import Swal from "sweetalert2";

const CowEditPage = ({ cowId, onClose, onCowUpdated }) => {
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cow = await getCowById(cowId);
        const farmerList = await getFarmers();
        setForm(cow);
        setFarmers(farmerList);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Gagal mengambil data sapi atau peternak.");
      } finally {
        setLoading(false);
      }
    };

    if (cowId) {
      fetchData();
    }
  }, [cowId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = type === "checkbox" ? checked : value;

    if (name === "weight_kg") {
      finalValue = value ? Math.max(0, parseFloat(value)) : "";
    }

    // Handle lactation_status checkbox
    if (name === "lactation_status") {
      setForm((prevForm) => ({
        ...prevForm,
        lactation_status: checked,
        lactation_phase: checked ? prevForm.lactation_phase : "Dry", // Set to Dry when unchecked
      }));
      return;
    }

    // Handle lactation_phase dropdown
    if (name === "lactation_phase") {
      setForm((prevForm) => ({
        ...prevForm,
        lactation_phase: value,
      }));
      return;
    }

    setForm((prevForm) => ({ ...prevForm, [name]: finalValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updateCow(cowId, form);
      await Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Data sapi berhasil diperbarui.",
      });
      onCowUpdated();
      onClose();
    } catch (err) {
      console.error("Failed to update cow:", err);
      setError("Gagal memperbarui data sapi. Coba lagi!");
      await Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: "Gagal memperbarui data sapi. Coba lagi!",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal show d-block"
      style={{ background: submitting ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title text-info fw-bold">Edit Data Sapi</h4>
            <button
              className="btn-close"
              onClick={onClose}
              disabled={submitting}
            ></button>
          </div>
          <div className="modal-body">
            {error && <p className="text-danger text-center">{error}</p>}
            {loading ? (
              <p className="text-center">Memuat data sapi...</p>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">Nama</label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className="form-control"
                      disabled={submitting}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">Jenis</label>
                    <input
                      type="text"
                      className="form-control"
                      value={form.breed}
                      readOnly
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">
                      Tanggal Lahir
                    </label>
                    <input
                      type="date"
                      name="birth_date"
                      value={form.birth_date}
                      onChange={handleChange}
                      required
                      className="form-control"
                      disabled={submitting}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">Berat (kg)</label>
                    <input
                      type="number"
                      name="weight_kg"
                      value={form.weight_kg}
                      onChange={handleChange}
                      required
                      className="form-control"
                      min="0"
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">
                      Status Reproduksi
                    </label>
                    <select
                      name="reproductive_status"
                      value={form.reproductive_status}
                      onChange={handleChange}
                      className="form-select"
                      disabled={submitting}
                    >
                      <option value="Pregnant">Pregnant</option>
                      <option value="Open">Open</option>
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">
                      Tanggal Masuk
                    </label>
                    <input
                      type="date"
                      name="entry_date"
                      value={form.entry_date}
                      onChange={handleChange}
                      required
                      className="form-control"
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">
                      Fase Laktasi
                    </label>
                    <select
                      name="lactation_phase"
                      value={form.lactation_phase}
                      onChange={handleChange}
                      className="form-select"
                      disabled={!form.lactation_status} // Disable if lactation_status is unchecked
                    >
                      {form.lactation_status
                        ? // Jika laktasi aktif, tampilkan opsi tanpa "Dry"
                          ["Early", "Mid", "Late"].map((phase) => (
                            <option key={phase} value={phase}>
                              {phase}
                            </option>
                          ))
                        : // Jika laktasi tidak aktif, tampilkan semua opsi
                          ["Early", "Mid", "Late", "Dry"].map((phase) => (
                            <option key={phase} value={phase}>
                              {phase}
                            </option>
                          ))}
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">Peternak</label>
                    <select
                      name="farmer"
                      value={form.farmer_id}
                      onChange={handleChange}
                      className="form-select"
                      required
                      disabled={submitting || loading}
                    >
                      <option value="">Pilih Peternak</option>
                      {farmers.map((farmer) => (
                        <option key={farmer.id} value={farmer.id}>
                          {farmer.first_name} {farmer.last_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-3 d-flex align-items-center">
                  <input
                    type="checkbox"
                    className="form-check-input me-2"
                    name="lactation_status"
                    checked={form.lactation_status}
                    onChange={handleChange}
                    disabled={submitting}
                  />
                  <label className="form-check-label fw-semibold">
                    Status Laktasi Aktif
                  </label>
                </div>

                <button
                  type="submit"
                  className="btn btn-info w-100 fw-semibold"
                  disabled={submitting}
                >
                  {submitting ? "Memperbarui..." : "Perbarui Data"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CowEditPage;
