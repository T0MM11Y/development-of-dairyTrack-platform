import { useEffect, useState } from "react";
import { getFarmerById, updateFarmer } from "../../../../api/peternakan/farmer";

const FarmerEditPage = ({ farmerId, onClose, onFarmerUpdated }) => {
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const farmer = await getFarmerById(farmerId);
        setForm(farmer);
      } catch (err) {
        console.error("Error fetching farmer data:", err);
        setError("Gagal mengambil data peternak.");
      } finally {
        setLoading(false);
      }
    };

    if (farmerId) {
      fetchData();
    }
  }, [farmerId]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let finalValue = type === "number" ? parseInt(value, 10) || 0 : value;
    setForm({ ...form, [name]: finalValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updateFarmer(farmerId, form);
      onFarmerUpdated();
      onClose();
    } catch (err) {
      console.error("Failed to update farmer:", err);
      setError("Gagal memperbarui data peternak. Coba lagi!");
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
            <h4 className="modal-title text-info fw-bold">
              Edit Data Peternak
            </h4>
            <button
              className="btn-close"
              onClick={onClose}
              disabled={submitting}
            ></button>
          </div>
          <div className="modal-body">
            {error && <p className="text-danger text-center">{error}</p>}
            {loading ? (
              <p className="text-center">Memuat data peternak...</p>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="form-control"
                      disabled={submitting}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">Nama Depan</label>
                    <input
                      type="text"
                      name="first_name"
                      value={form.first_name}
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
                      Nama Belakang
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={form.last_name}
                      onChange={handleChange}
                      required
                      className="form-control"
                      disabled={submitting}
                    />
                  </div>
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
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">Kontak</label>
                    <input
                      type="text"
                      name="contact"
                      value={form.contact}
                      onChange={handleChange}
                      required
                      className="form-control"
                      disabled={submitting}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">Agama</label>
                    <select
                      name="religion"
                      value={form.religion}
                      onChange={handleChange}
                      className="form-select"
                      disabled={submitting}
                    >
                      <option value="Islam">Islam</option>
                      <option value="Kristen">Kristen</option>
                      <option value="Katolik">Katolik</option>
                      <option value="Hindu">Hindu</option>
                      <option value="Buddha">Buddha</option>
                    </select>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">Alamat</label>
                    <input
                      type="text"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      required
                      className="form-control"
                      disabled={submitting}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">
                      Jenis Kelamin
                    </label>
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      className="form-select"
                      disabled={submitting}
                    >
                      <option value="Male">Laki-laki</option>
                      <option value="Female">Perempuan</option>
                    </select>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">
                      Jumlah Ternak
                    </label>
                    <input
                      type="number"
                      name="total_cattle"
                      value={form.total_cattle}
                      onChange={handleChange}
                      className="form-control"
                      min="0"
                      disabled // Menonaktifkan input
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-semibold">
                      Tanggal Bergabung
                    </label>
                    <input
                      type="date"
                      name="join_date"
                      value={form.join_date}
                      onChange={handleChange}
                      required
                      className="form-control"
                      disabled={submitting}
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold">Status</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="form-select"
                    disabled={submitting}
                  >
                    <option value="Active">Aktif</option>
                    <option value="Inactive">Tidak Aktif</option>
                  </select>
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

export default FarmerEditPage;
