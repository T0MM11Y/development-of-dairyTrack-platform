import { useEffect, useState } from "react";
import { getNutritionById, updateNutrition } from "../../../../api/pakan/nutrient";
import Swal from "sweetalert2";

const EditNutritionPage = ({ id, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    unit: "gram",
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchNutrition = async () => {
      try {
        setFetching(true);
        const response = await getNutritionById(id);
        console.log("getNutritionById Response:", response); // Debug log
        if (response.success && (response.data || response.nutrisi)) {
          const nutrition = response.data || response.nutrisi;
          setFormData({
            name: nutrition.name || "",
            unit: nutrition.unit || "gram",
          });
        } else {
          console.warn("Unexpected response structure or failure:", response);
          Swal.fire({
            title: "Gagal",
            text: response.message || "Nutrisi tidak ditemukan.",
            icon: "error",
            confirmButtonText: "Tutup",
          }).then(() => onClose());
        }
      } catch (error) {
        console.error("Error fetching nutrition:", error.message, error);
        Swal.fire({
          title: "Gagal",
          text: error.message || "Terjadi kesalahan saat memuat data nutrisi.",
          icon: "error",
          confirmButtonText: "Tutup",
        }).then(() => onClose());
      } finally {
        setFetching(false);
      }
    };

    fetchNutrition();
  }, [id, onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await updateNutrition(id, formData);
      console.log("updateNutrition Response:", response);
      if (response.success) {
        Swal.fire({
          title: "Berhasil!",
          text: response.message || "Nutrisi berhasil diperbarui.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        }).then(() => onClose());
      } else {
        Swal.fire("Gagal", response.message || "Terjadi kesalahan.", "error");
      }
    } catch (error) {
      const errorMessage = error.message.includes("sudah ada")
        ? error.message
        : error.message === "Nutrisi not found"
        ? "Nutrisi tidak ditemukan."
        : "Terjadi kesalahan saat memperbarui nutrisi.";
      Swal.fire("Gagal", errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div
        className="modal fade show d-block"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        tabIndex="-1"
        role="dialog"
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <div className="modal-body text-center">
              <div className="spinner-border text-primary" role="status" />
              <p className="mt-2">Memuat data nutrisi...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            <h5 className="modal-title">Edit Nutrisi</h5>
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

export default EditNutritionPage;