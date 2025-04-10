import React, { useState } from "react";
import Swal from "sweetalert2";
import { createFeedType } from "../../../../api/pakan/feedType";

const CreateFeedTypeModal = ({ onClose, onSuccess }) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      Swal.fire({
        title: "Error!",
        text: "Nama jenis pakan harus diisi.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    const confirm = await Swal.fire({
      title: "Apakah Anda yakin?",
      text: "Jenis pakan akan ditambahkan.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, tambahkan!",
      cancelButtonText: "Batal",
    });

    if (!confirm.isConfirmed) return;

    setLoading(true);
    try {
      const response = await createFeedType({ name });
      console.log("API Response:", response);

      if (response?.success === true) {
        Swal.fire({
          title: "Sukses!",
          text: "Jenis pakan berhasil ditambahkan.",
          icon: "success",
          confirmButtonText: "OK",
        });

        onSuccess(response.data);
        setName("");
      } else {
        // If success is false, throw the error with the backend message
        throw new Error(response.message || "Terjadi kesalahan saat menambahkan jenis pakan.");
      }
    } catch (error) {
      console.error("Create Error:", error);

      // Use the error message directly, whether from the thrown error or a network issue
      const errorMessage = error.message || "Terjadi kesalahan yang tidak diketahui.";

      console.log("Detailed error info:", {
        message: error.message,
        response: error, // Log the full error object for debugging
      });

      Swal.fire({
        title: "Error!",
        text: errorMessage,
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1050 }}
    >
      <div className="modal-dialog">
        <div className="modal-content shadow-lg">
          <div className="modal-header">
            <h5 className="modal-title fw-bold text-info">
              Tambah Jenis Pakan
            </h5>
            <button
              className="btn-close"
              onClick={onClose}
              disabled={loading}
            ></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="feedTypeName" className="form-label">
                  Nama Jenis Pakan
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="feedTypeName"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Contoh: Konsentrat"
                />
              </div>
              <button
                type="submit"
                className="btn btn-info w-100"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Menyimpan...
                  </>
                ) : (
                  "Tambah"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateFeedTypeModal;