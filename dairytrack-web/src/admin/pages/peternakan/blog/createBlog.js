import React, { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import { createBlog } from "../../../../api/peternakan/blog";
import { getTopicBlog } from "../../../../api/peternakan/topicBlog";
import Quill from "quill";
import "quill/dist/quill.snow.css"; // Import Quill stylesheet

const CreateBlogModal = ({ onClose, onSuccess }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [topic, setTopic] = useState("");
  const [topics, setTopics] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const quillRef = useRef(null);

  // Regex to detect emojis
  const emojiRegex =
    /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

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
            ["link"], // Removed "image" from toolbar
          ],
        },
      });

      // Attach Quill instance to the ref
      quillRef.current.__quill = quill;

      // Update description state on Quill content change
      quill.on("text-change", () => {
        const content = quill.root.innerHTML;
        if (emojiRegex.test(content)) {
          Swal.fire({
            title: "Error!",
            text: "Deskripsi tidak boleh mengandung emoji.",
            icon: "error",
            confirmButtonText: "OK",
          });
          quill.root.innerHTML = ""; // Clear the content
        } else {
          setDescription(content);
        }
      });
    }
  }, []);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const data = await getTopicBlog();
        setTopics(data);
      } catch (error) {
        console.error("Error fetching topics:", error);
      }
    };

    fetchTopics();
  }, []);

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

    if (emojiRegex.test(title) || emojiRegex.test(description)) {
      Swal.fire({
        title: "Error!",
        text: "Input tidak boleh mengandung emoji.",
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
      formData.append("topic_id", topic);
      if (photo) {
        formData.append("photo", photo);
      }

      const response = await createBlog(formData);

      if (response.status === 201) {
        Swal.fire({
          title: "Sukses!",
          text: "Artikel blog berhasil ditambahkan.",
          icon: "success",
          confirmButtonText: "OK",
        }).then(() => {
          onSuccess();
          onClose();
        });
      } else {
        throw new Error("Unexpected response status");
      }
    } catch (error) {
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
