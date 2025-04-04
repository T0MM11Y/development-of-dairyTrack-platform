import { useState } from "react";
import { createSupervisor } from "../../../../api/peternakan/supervisor";

const SupervisorCreatePage = ({ onSupervisorAdded, onClose }) => {
  const [form, setForm] = useState({
    email: "",
    first_name: "",
    last_name: "",
    contact: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Reset error message

    // Validasi form
    if (!validateForm()) {
      setError("Semua field wajib diisi!");
      return;
    }

    setSubmitting(true);
    try {
      console.log("Submitting supervisor data:", form);
      await createSupervisor(form);
      if (onSupervisorAdded) onSupervisorAdded();
      onClose();
    } catch (err) {
      console.error("Failed to create supervisor:", err);
      setError(
        err.response?.data?.message ||
          "Gagal membuat data supervisor. Coba lagi!"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const validateForm = () => {
    const requiredFields = [
      "email",
      "first_name",
      "last_name",
      "contact",
      "password",
    ];
    for (const field of requiredFields) {
      if (!form[field] || form[field].toString().trim() === "") {
        return false;
      }
    }
    return true;
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
              Tambah Data Supervisor
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
              <div className="mb-3">
                <label className="form-label fw-bold">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="form-control"
                  placeholder="Masukkan email supervisor"
                />
              </div>
              <div className="mb-3">
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
              <div className="mb-3">
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
              <div className="mb-3">
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

export default SupervisorCreatePage;
