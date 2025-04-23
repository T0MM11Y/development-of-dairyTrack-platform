import { useState } from "react";
import { createNutrition } from "../../../../api/pakan/nutrient";
import Swal from "sweetalert2";

const CreateNutritionPage = ({ onNutritionAdded, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    unit: "gram",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await createNutrition(formData);
      if (response.success) {
        Swal.fire("Berhasil!", response.message || "Nutrisi berhasil ditambahkan.", "success");
        onNutritionAdded();
        onClose();
      } else {
        Swal.fire("Gagal", response.message || "Terjadi kesalahan.", "error");
      }
    } catch (error) {
      // Handle specific backend errors
      const errorMessage = error.message.includes("sudah ada")
        ? error.message
        : error.message === "Name is required"
        ? "Nama nutrisi wajib diisi."
        : "Terjadi kesalahan saat menambahkan nutrisi.";
      Swal.fire("Gagal", errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      tabIndex="-1"
      role="dialog"
    >
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Tambah Nutrisi</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            />
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="name" className="form-label">
                  Nama Nutrisi
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Masukkan nama nutrisi"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="unit" className="form-label">
                  Satuan
                </label>
                <select
                  className="form-control"
                  id="unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  required
                >
                  <option value="gram">gram</option>
                  <option value="%">%</option>
                  <option value="MJ/kg">MJ/kg</option>
                  <option value="kcal/kg">kcal/kg</option>
                  <option value="mg">mg</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Batal
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  />
                ) : null}
                Simpan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateNutritionPage;