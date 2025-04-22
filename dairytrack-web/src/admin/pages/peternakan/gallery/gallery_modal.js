import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  createGallery,
  updateGallery,
} from "../../../../api/peternakan/gallery";

const GalleryModal = ({ show, handleClose, handleSave, initialData }) => {
  const [formData, setFormData] = useState({
    tittle: "",
    photo: null,
  });
  const [photoPreview, setPhotoPreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [photoName, setPhotoName] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData({
        tittle: initialData.tittle || "",
        photo: null, // Reset photo untuk menghindari pengiriman ulang file lama
      });
      setPhotoPreview(initialData.photo || null);
      setPhotoName(initialData.photo ? initialData.photo.split("/").pop() : ""); // Ambil nama file dari URL foto
    } else {
      resetForm(); // Reset form jika tidak ada initialData
    }
  }, [initialData]);

  const resetForm = () => {
    setFormData({ tittle: "", photo: null });
    setPhotoPreview(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validasi file harus berupa gambar
      if (!file.type.startsWith("image/")) {
        Swal.fire({
          title: "Error!",
          text: "File yang diunggah harus berupa gambar.",
          icon: "error",
          confirmButtonText: "OK",
        });
        return;
      }
      setFormData((prev) => ({ ...prev, photo: file }));
      setPhotoPreview(URL.createObjectURL(file));
      setPhotoName(file.name); // Set nama file baru
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.tittle || (!formData.photo && !initialData?.photo)) {
      Swal.fire({
        title: "Error!",
        text: "Semua field wajib diisi.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("tittle", formData.tittle);

      // Tambahkan file foto jika ada
      if (formData.photo) {
        formDataToSend.append("photo", formData.photo);
      }

      let response;
      if (initialData) {
        response = await updateGallery(initialData.id, formDataToSend);
      } else {
        response = await createGallery(formDataToSend);
      }

      // Periksa apakah respons memiliki data yang diharapkan
      if (response && response.data) {
        Swal.fire({
          title: "Sukses!",
          text: initialData
            ? "Galeri berhasil diperbarui."
            : "Galeri berhasil ditambahkan.",
          icon: "success",
          confirmButtonText: "OK",
        });
        handleSave(response.data); // Kirim data ke parent
        resetForm(); // Reset form setelah berhasil
        handleClose(); // Tutup modal setelah berhasil
      } else {
        throw new Error("Respons tidak valid dari server.");
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text:
          error.message ||
          "Terjadi kesalahan saat menyimpan data. Silakan coba lagi.",
        icon: "error",
        confirmButtonText: "OK",
      });
      console.error("Error in handleSubmit:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    resetForm(); // Reset form saat modal ditutup
    handleClose(); // Panggil fungsi handleClose dari parent
  };

  if (!show) return null;

  return (
    <div
      className="modal show d-block"
      style={{ background: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title text-info fw-bold">
              {initialData ? "Edit Gallery" : "Tambah Gallery"}
            </h4>
            <button
              className="btn-close"
              onClick={handleModalClose}
              disabled={loading}
            ></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group mb-3">
                <label htmlFor="galleryTittle" className="form-label">
                  Judul Gallery
                </label>
                <input
                  type="text"
                  id="galleryTittle"
                  className="form-control"
                  name="tittle"
                  value={formData.tittle}
                  onChange={handleChange}
                  placeholder="Masukkan judul gallery"
                  required
                />
              </div>
              <div className="form-group mb-3">
                <label htmlFor="galleryPhoto" className="form-label">
                  Foto
                </label>
                {photoPreview && (
                  <div className="mb-3">
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="img-thumbnail"
                      style={{ maxWidth: "200px", maxHeight: "200px" }}
                    />
                  </div>
                )}
                <input
                  type="file"
                  id="galleryPhoto"
                  className="form-control"
                  onChange={handlePhotoChange}
                  required={!initialData}
                />
                {photoName && (
                  <small className="text-muted">
                    File saat ini: {photoName}
                  </small>
                )}
              </div>
              <button
                type="submit"
                className="btn btn-info w-100"
                disabled={loading}
              >
                {loading ? "Menyimpan..." : "Simpan"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalleryModal;
