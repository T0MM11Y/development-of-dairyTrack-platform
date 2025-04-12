import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import {
  createTopicBlog,
  getTopicBlog,
  deleteTopicBlog,
} from "../../../../api/peternakan/topicBlog"; // Import API functions

const CreateTopicModal = ({ onClose, onSuccess }) => {
  const [topic, setTopic] = useState("");
  const [categories, setCategories] = useState([]); // State for categories
  const [loading, setLoading] = useState(false);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await getTopicBlog();
        setCategories(result); // Set categories from API
      } catch (error) {
        console.error("Error fetching categories:", error.message);
      }
    };

    fetchCategories();
  }, []);

  // Handle category deletion
  // Handle category deletion with confirmation
  const handleDeleteCategory = async (id) => {
    const result = await Swal.fire({
      title: "Konfirmasi",
      text: "Apakah Anda yakin ingin menghapus kategori ini Tindakan ini akan menghapus semua blog yang terkait dengan kategori ini.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        await deleteTopicBlog(id); // Call API to delete category
        setCategories(categories.filter((category) => category.id !== id)); // Remove from state

        Swal.fire({
          title: "Sukses!",
          text: "Kategori berhasil dihapus.",
          icon: "success",
          confirmButtonText: "OK",
        });
      } catch (error) {
        console.error("Error deleting category:", error.message);

        Swal.fire({
          title: "Error!",
          text: "Terjadi kesalahan saat menghapus kategori.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!topic) {
      Swal.fire({
        title: "Error!",
        text: "Topik wajib diisi.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await createTopicBlog({ topic }); // Use the createTopicBlog function

      Swal.fire({
        title: "Sukses!",
        text: "Topik berhasil ditambahkan.",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        onSuccess();
        onClose();
      });
    } catch (error) {
      console.error("Error creating topic:", error.message);

      Swal.fire({
        title: "Error!",
        text: "Terjadi kesalahan saat menambahkan topik.",
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
      style={{ background: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h4 className="modal-title text-info fw-bold">Tambah Topik</h4>
            <button
              className="btn-close"
              onClick={onClose}
              disabled={loading}
            ></button>
          </div>
          <div className="modal-body">
            {/* Display categories as pills */}
            <div className="mb-3 d-flex flex-wrap gap-3">
              {categories.map((category) => (
                <span
                  key={category.id}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "0.45rem 0.9rem",
                    backgroundColor: "#3EB5DAFF",
                    color: "white",
                    fontSize: "0.85rem",
                    borderRadius: "999px",
                    fontWeight: 500,
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                    gap: "0.5rem",
                    transition: "background-color 0.3s ease",
                  }}
                >
                  {category.topic}
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    aria-label="Close"
                    onClick={() => handleDeleteCategory(category.id)}
                    style={{
                      transform: "scale(1.2)",
                      opacity: 0.9,
                      cursor: "pointer",
                    }}
                  ></button>
                </span>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group mb-3">
                <label htmlFor="topicName" className="form-label">
                  Nama Topik
                </label>
                <input
                  type="text"
                  id="topicName"
                  className="form-control"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  required
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

export default CreateTopicModal;
