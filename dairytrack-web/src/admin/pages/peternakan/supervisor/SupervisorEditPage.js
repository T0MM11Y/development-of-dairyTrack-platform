import { useEffect, useState } from "react";
import {
  getSupervisorById,
  updateSupervisor,
} from "../../../../api/peternakan/supervisor";
import Swal from "sweetalert2";

const SupervisorEditPage = ({ supervisorId, onClose, onSupervisorUpdated }) => {
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supervisor = await getSupervisorById(supervisorId);
        setForm(supervisor);
      } catch (err) {
        console.error("Error fetching supervisor data:", err);
        setError("Gagal mengambil data supervisor.");
      } finally {
        setLoading(false);
      }
    };

    if (supervisorId) {
      fetchData();
    }
  }, [supervisorId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await updateSupervisor(supervisorId, form);
      onSupervisorUpdated();
      onClose();

      Swal.fire({
        title: "Success!",
        text: "Supervisor berhasil diperbarui.",
        icon: "success",
      });
    } catch (err) {
      console.error("Failed to update supervisor:", err);
      const errorMessage =
        err.response?.data?.message ||
        "Gagal memperbarui data supervisor. Coba lagi!";
      setError(errorMessage);

      Swal.fire({
        title: "Error!",
        text: errorMessage,
        icon: "error",
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
            <h4 className="modal-title text-info fw-bold">
              Edit Data Supervisor
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
              <p className="text-center">Memuat data supervisor...</p>
            ) : (
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
                    disabled={submitting}
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
                    disabled={submitting}
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
                    disabled={submitting}
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
                    disabled={submitting}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold">Jenis Kelamin</label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    required
                    className="form-control"
                    disabled={submitting}
                  >
                    <option value="">Pilih Jenis Kelamin</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="btn btn-info w-100 fw-bold"
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

export default SupervisorEditPage;
