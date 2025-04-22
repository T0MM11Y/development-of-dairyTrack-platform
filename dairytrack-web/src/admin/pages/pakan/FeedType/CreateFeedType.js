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

      if (response?.success) {
        Swal.fire({
          title: "Sukses!",
          text: "Jenis pakan berhasil ditambahkan.",
          icon: "success",
          confirmButtonText: "OK",
        });

        onSuccess(response.data); // Kirim data baru ke parent
        setName(""); // Reset form
      } else {
        throw new Error(response?.message || "Gagal menambahkan jenis pakan.");
      }
    } catch (error) {
      console.error("Create Error:", error.message);
      const errorMessage = error.message.includes("sudah ada")
        ? error.message // Use the exact message from the API
        : "Gagal menambahkan jenis pakan: " + error.message;
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
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        backdropFilter: "blur(5px)",
        zIndex: 1050,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <div
        className="modal-dialog"
        style={{
          maxWidth: "500px",
          margin: "auto",
        }}
      >
        <div
          className="modal-content shadow-lg"
          style={{
            borderRadius: "12px",
            boxShadow: "0 8px 30px rgba(0, 0, 0, 0.2)",
            border: "none",
          }}
        >
          <div
            className="modal-header"
            style={{
              backgroundColor: "#f8f9fa",
              borderBottom: "1px solid #e9ecef",
              padding: "15px 20px",
            }}
          >
            <h5
              className="modal-title fw-bold"
              style={{ color: "#17a2b8", fontSize: "1.5rem" }}
            >
              Tambah Jenis Pakan
            </h5>
            <button
              className="btn-close"
              onClick={onClose}
              disabled={loading}
              style={{ fontSize: "1.2rem" }}
            ></button>
          </div>
          <div className="modal-body" style={{ padding: "20px" }}>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="feedTypeName" className="form-label fw-semibold">
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
                  style={{
                    borderRadius: "8px",
                    padding: "10px",
                    fontSize: "1rem",
                  }}
                />
              </div>
              <div className="d-flex justify-content-between mt-4">
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={onClose}
                  disabled={loading}
                  style={{
                    borderRadius: "8px",
                    padding: "8px 20px",
                    fontSize: "1rem",
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-info"
                  disabled={loading}
                  style={{
                    borderRadius: "8px",
                    padding: "8px 20px",
                    fontSize: "1rem",
                  }}
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
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateFeedTypeModal;