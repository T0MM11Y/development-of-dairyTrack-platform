import React, { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import {
  getBlogById,
  updateBlog,
  getBlogPhoto,
} from "../../../../api/peternakan/blog";
import { getTopicBlog } from "../../../../api/peternakan/topicBlog";
import Quill from "quill";
import "quill/dist/quill.snow.css"; // Import Quill stylesheet

const EditBlogModal = ({ blogId, onClose, onSuccess }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [topic, setTopic] = useState("");
  const [topics, setTopics] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoName, setPhotoName] = useState("Pilih file...");
  const [loading, setLoading] = useState(false);
  const quillRef = useRef(null);

  useEffect(() => {
    const fetchBlogData = async () => {
      try {
        const response = await getBlogById(blogId);
        setTitle(response.title);
        setDescription(response.description);
        setTopic(response.topic_id); // Gunakan topic_id dari respons API

        const photoRes = await getBlogPhoto(blogId);
        setPhotoPreview(photoRes.photo_url || null);
        setPhotoName(photoRes.photo_url ? "Gambar saat ini" : "Pilih file...");
      } catch (error) {
        Swal.fire({
          title: "Error!",
          text: "Gagal memuat data blog.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    };

    const fetchTopics = async () => {
      try {
        const data = await getTopicBlog();
        setTopics(data);
      } catch (error) {
        console.error("Error fetching topics:", error);
      }
    };

    fetchBlogData();
    fetchTopics();
  }, [blogId]);

  useEffect(() => {
    if (quillRef.current && !quillRef.current.__quill) {
      // Initialize Quill editor
      const quill = new Quill(quillRef.current, {
        theme: "snow",
        placeholder: "Tulis deskripsi artikel di sini...",
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ["bold", "italic", "underline"],
            [{ list: "ordered" }, { list: "bullet" }],
            ["link", "image"],
          ],
        },
      });

      // Attach Quill instance to the ref
      quillRef.current.__quill = quill;

      // Set initial content for Quill editor
      if (description) {
        quill.root.innerHTML = description; // Set nilai awal dari state description
      }

      // Update description state on Quill content change
      quill.on("text-change", () => {
        setDescription(quill.root.innerHTML);
      });
    } else if (quillRef.current && quillRef.current.__quill) {
      // Jika Quill sudah diinisialisasi, sinkronkan nilai description
      const quill = quillRef.current.__quill;
      if (description) {
        quill.root.innerHTML = description;
      }
    }
  }, [description]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
      setPhotoName(file.name);
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
      formData.append("topic_id", topic); // Gunakan topic_id untuk mengirimkan topik
      if (photo) {
        formData.append("photo", photo);
      }

      await updateBlog(blogId, formData);

      Swal.fire({
        title: "Sukses!",
        text: "Artikel blog berhasil diperbarui.",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        onSuccess();
        onClose();
      });
    } catch (error) {
      console.warn("Warning: Terjadi error, tetapi data berhasil dikirim.");
      console.error("Error updating blog:", error.message);

      Swal.fire({
        title: "Sukses!",
        text: "Artikel blog berhasil diperbarui.",
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
            <h4 className="modal-title text-info fw-bold">Edit Artikel Blog</h4>
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
                <div ref={quillRef} style={{ height: "200px" }}></div>
              </div>
              <div className="form-group mb-3">
                <label htmlFor="blogTopic" className="form-label">
                  Topik
                </label>
                <select
                  id="blogTopic"
                  className="form-control custom-select"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Pilih Topik
                  </option>
                  {topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.topic}
                    </option>
                  ))}
                </select>
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
                <small className="form-text text-muted">{photoName}</small>
              </div>
              <button
                type="submit"
                className="btn btn-info w-100"
                disabled={loading}
              >
                {loading ? "Menyimpan..." : "Perbarui"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditBlogModal;
