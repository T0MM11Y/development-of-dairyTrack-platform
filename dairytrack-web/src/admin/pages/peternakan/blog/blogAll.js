import { useEffect, useState } from "react";
import {
  getBlogs,
  deleteBlog,
  getBlogPhoto,
  getBlogById,
  updateBlog,
} from "../../../../api/peternakan/blog";
import { Link } from "react-router-dom";
import CreateBlogModal from "./createBlog"; // Modal untuk membuat blog
import EditBlogModal from "./editBlog"; // Modal untuk mengedit blog

const BlogAll = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false); // State untuk modal create
  const [showEditModal, setShowEditModal] = useState(false); // State untuk modal edit
  const [editBlogId, setEditBlogId] = useState(null); // ID blog yang akan diedit

  const fetchData = async () => {
    try {
      setLoading(true);
      const blogsRes = await getBlogs();

      // Fetch photo URLs for each blog
      const blogsWithPhotos = await Promise.all(
        blogsRes.map(async (blog) => {
          try {
            const photoRes = await getBlogPhoto(blog.id);
            return { ...blog, photo: photoRes.photo_url };
          } catch {
            return { ...blog, photo: null }; // Jika gagal, gunakan null
          }
        })
      );

      setData(blogsWithPhotos);
      setError("");
    } catch (err) {
      console.error("Gagal mengambil data:", err.message);
      setError("Gagal mengambil data. Pastikan server API aktif.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setSubmitting(true);
    try {
      await deleteBlog(deleteId);
      fetchData();
      setDeleteId(null);
    } catch (err) {
      alert("Gagal menghapus data: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (id) => {
    setEditBlogId(id); // Set ID blog yang akan diedit
    setShowEditModal(true); // Tampilkan modal edit
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 m-1">Blog Articles</h2>
        <button
          className="btn btn-info"
          onClick={() => setShowCreateModal(true)} // Tampilkan modal create
        >
          + Create Blog
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2">Loading blog data...</p>
        </div>
      ) : data.length === 0 ? (
        <p className="text-gray-500">No blog data available.</p>
      ) : (
        <div className="col-lg-12">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Blog Data</h4>
              <div className="table-responsive">
                <table className="table table-striped mb-0">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Image</th>
                      <th>Title</th>
                      <th>Description</th>
                      <th>Topic</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((item, index) => (
                      <tr key={item.id}>
                        <th scope="row">{index + 1}</th>
                        <td>
                          <img
                            src={item.photo || "/placeholder-image.jpg"}
                            alt={item.title}
                            className="rounded"
                            style={{
                              width: "50px",
                              height: "50px",
                              objectFit: "cover",
                            }}
                          />
                        </td>
                        <td>{item.title}</td>
                        <td>
                          {item.description.length > 50
                            ? `${item.description.substring(0, 50)}...`
                            : item.description}
                        </td>
                        <td>{item.topic}</td>
                        <td>
                          <button
                            onClick={() => handleEdit(item.id)} // Tampilkan modal edit
                            className="btn btn-warning me-2"
                          >
                            <i className="ri-edit-line"></i>
                          </button>
                          <button
                            onClick={() => setDeleteId(item.id)}
                            className="btn btn-danger"
                          >
                            <i className="ri-delete-bin-6-line"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div
          className="modal fade show d-block"
          style={{
            background: submitting ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.5)",
          }}
          tabIndex="-1"
          role="dialog"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-danger">Delete Confirmation</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setDeleteId(null)}
                  disabled={submitting}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to delete this blog article?
                  <br />
                  This action cannot be undone.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setDeleteId(null)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDelete}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Blog Modal */}
      {showCreateModal && (
        <CreateBlogModal
          onClose={() => setShowCreateModal(false)} // Tutup modal create
          onSuccess={fetchData} // Refresh data setelah blog berhasil dibuat
        />
      )}

      {/* Edit Blog Modal */}
      {showEditModal && editBlogId && (
        <EditBlogModal
          blogId={editBlogId} // Kirim ID blog yang akan diedit
          onClose={() => setShowEditModal(false)} // Tutup modal edit
          onSuccess={fetchData} // Refresh data setelah blog berhasil diedit
        />
      )}
    </div>
  );
};

export default BlogAll;
