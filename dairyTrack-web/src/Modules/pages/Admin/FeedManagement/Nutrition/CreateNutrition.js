// NutritionCreatePage.js
import { useState, useEffect } from "react";
import { addNutrition } from "../../../../controllers/nutritionController";
import Swal from "sweetalert2";

const NutritionCreatePage = ({ onClose, onSaved }) => {
  const [form, setForm] = useState({
    name: "",
    unit: "",
    created_by: "",
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    if (userData.user_id) {
      setCurrentUser(userData);
      setForm((prev) => ({
        ...prev,
        created_by: userData.user_id || userData.id || "",
      }));
    } else {
      Swal.fire({
        icon: "error",
        title: "Sesi Berakhir",
        text: "Token tidak ditemukan. Silakan login kembali.",
      });
      localStorage.removeItem("user");
      window.location.href = "/";
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Menampilkan Sweet Alert konfirmasi sebelum menyimpan
    const result = await Swal.fire({
      title: "Konfirmasi",
      text: `Apakah Anda yakin ingin menambahkan nutrisi "${form.name}" dengan satuan "${form.unit}"?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Simpan",
      cancelButtonText: "Batal"
    });
    
    // Jika user membatalkan, hentikan proses
    if (!result.isConfirmed) {
      return;
    }
    
    setSubmitting(true);
    setError("");

    try {
      const response = await addNutrition({
        name: form.name.trim(),
        unit: form.unit.trim(),
      });
      console.log("NutritionCreatePage - addNutrition Response:", response);
      if (response.success) {
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: response.message || "Nutrisi berhasil disimpan.",
          timer: 1500,
          showConfirmButton: false,
        });
        if (onSaved) onSaved();
        onClose();
      } else {
        throw new Error(response.message || "Gagal menyimpan nutrisi.");
      }
    } catch (err) {
      const message = err.message || "Terjadi kesalahan saat menyimpan nutrisi.";
      setError(message);
      Swal.fire({
        icon: "error",
        title: "Gagal Menyimpan",
        text: message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal show d-block"
      style={{
        background: submitting ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.5)",
        minHeight: "100vh",
        paddingTop: "3rem",
      }}
    >
      <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title text-info fw-bold">Tambah Nutrisi</h4>
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
                <label className="form-label fw-bold">Nama Nutrisi</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Satuan</label>
                <input
                  type="text"
                  name="unit"
                  value={form.unit}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>

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
                  value={form.created_by}
                />
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

export default NutritionCreatePage;