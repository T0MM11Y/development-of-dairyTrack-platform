import { useState } from "react";
import { createFarmer } from "../../../../api/peternakan/farmer";
import "../../../../assets/admin/css/icons.min.css";

const FarmerCreatePage = ({ onFarmerAdded, onClose }) => {
  const [form, setForm] = useState({
    email: "",
    first_name: "",
    last_name: "",
    birth_date: "",
    contact: "",
    religion: "",
    address: "",
    gender: "Male",
    total_cattle: 0,
    join_date: "",
    status: "Active",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let finalValue = type === "number" ? parseInt(value, 10) || 0 : value;
    setForm((prevForm) => ({ ...prevForm, [name]: finalValue }));
  };

  const validateForm = () => {
    for (const key in form) {
      if (form[key] === "" || form[key] === null || form[key] === undefined) {
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Reset error message

    if (!validateForm()) {
      setError("Semua field wajib diisi!");
      return;
    }

    setSubmitting(true);
    try {
      console.log("Submitting farmer data:", form);
      await createFarmer(form);
      if (onFarmerAdded) onFarmerAdded();
      onClose();
    } catch (err) {
      console.error("Failed to create farmer:", err);
      setError(
        err.response?.data?.message || "Gagal membuat data peternak. Coba lagi!"
      );
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
              Tambah Data Peternak
            </h4>
            <button
              className="btn-close"
              onClick={onClose}
              disabled={submitting}
            ></button>
          </div>
          <div className="modal-body">
            {error && <p className="text-danger text-center">{error}</p>}
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="form-control"
                    placeholder="Masukkan email"
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Nama Depan</label>
                  <input
                    type="text"
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    required
                    className="form-control"
                    placeholder="Masukkan nama depan"
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Nama Belakang</label>
                  <input
                    type="text"
                    name="last_name"
                    value={form.last_name}
                    onChange={handleChange}
                    required
                    className="form-control"
                    placeholder="Masukkan nama belakang"
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Tanggal Lahir</label>
                  <input
                    type="date"
                    name="birth_date"
                    value={form.birth_date}
                    onChange={handleChange}
                    required
                    className="form-control"
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Kontak</label>
                  <input
                    type="text"
                    name="contact"
                    value={form.contact}
                    onChange={handleChange}
                    required
                    className="form-control"
                    placeholder="Masukkan nomor kontak"
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Agama</label>
                  <select
                    name="religion"
                    value={form.religion}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="">Pilih Agama</option>
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
                  <label className="form-label fw-bold">Alamat</label>
                  <input
                    type="text"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    required
                    className="form-control"
                    placeholder="Masukkan alamat"
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Jenis Kelamin</label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className="form-select"
                  >
                    <option value="Male">Laki-laki</option>
                    <option value="Female">Perempuan</option>
                  </select>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Jumlah Ternak</label>
                  <input
                    type="number"
                    name="total_cattle"
                    value={form.total_cattle}
                    onChange={handleChange}
                    className="form-control"
                    placeholder="Masukkan jumlah ternak"
                    min="0"
                    disabled // Menonaktifkan input
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">
                    Tanggal Bergabung
                  </label>
                  <input
                    type="date"
                    name="join_date"
                    value={form.join_date}
                    onChange={handleChange}
                    required
                    className="form-control"
                  />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="Active">Aktif</option>
                  <option value="Inactive">Tidak Aktif</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label fw-bold">Password</label>
                <div className="input-group input-group-sm">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    className="form-control"
                    placeholder="Masukkan password"
                    style={{
                      borderRadius: "8px",
                      border: "1px solid #ccc",
                      padding: "5px",
                      transition: "0.3s ease-in-out",
                    }}
                  />
                  <span
                    className="input-group-text"
                    style={{
                      cursor: "pointer",
                      background: "none",
                      border: "none",
                    }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i
                      className={showPassword ? "fa fa-eye-slash" : "fa fa-eye"}
                      style={{ fontSize: "1rem", color: "#666" }}
                    ></i>
                  </span>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default FarmerCreatePage;
