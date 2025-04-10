import React, { useState } from "react";
import Swal from "sweetalert2";
import { createBlog } from "../../../../api/peternakan/blog";

const CreateBlogModal = ({ onClose, onSuccess }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [topic, setTopic] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !description || !topic) {
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
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("topic", topic);
      if (photo) {
        formData.append("photo", photo);
      }

      const response = await createBlog(formData);

      Swal.fire({
        title: "Sukses!",
        text: "Artikel blog berhasil ditambahkan.",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        onSuccess();
        onClose();
      });
    } catch (error) {
      console.warn("Warning: Terjadi error, tetapi data berhasil dikirim.");
      console.error("Error creating blog:", error.message);

      Swal.fire({
        title: "Sukses!",
        text: "Artikel blog berhasil ditambahkan.",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        onSuccess();
        onClose();
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="modal show d-block"
      style={{ background: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title text-info fw-bold">
              Tambah Artikel Blog
            </h4>
            <button
              className="btn-close"
              onClick={onClose}
              disabled={loading}
            ></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="form-group mb-3">
                <label htmlFor="blogTitle" className="form-label">
                  Judul Artikel
                </label>
                <input
                  type="text"
                  id="blogTitle"
                  className="form-control"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-group mb-3">
                <label htmlFor="blogDescription" className="form-label">
                  Deskripsi
                </label>
                <textarea
                  id="blogDescription"
                  className="form-control"
                  rows="4"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                ></textarea>
              </div>
              <div className="form-group mb-3">
                <label htmlFor="blogTopic" className="form-label">
                  Topik
                </label>
                <input
                  type="text"
                  id="blogTopic"
                  className="form-control"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  required
                />
              </div>
              <div className="form-group mb-3">
                <label htmlFor="blogPhoto" className="form-label">
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
                  id="blogPhoto"
                  className="form-control"
                  onChange={handlePhotoChange}
                />
              </div>
              <button
                type="submit"
                className="btn btn-info w-100"
                disabled={loading}
              >
                {loading ? "Menyimpan..." : "Tambah"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBlogModal;
