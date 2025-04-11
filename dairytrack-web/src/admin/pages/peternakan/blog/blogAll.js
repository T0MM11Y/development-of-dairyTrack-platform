import { useEffect, useState } from "react";
import {
  getBlogs,
  deleteBlog,
  getBlogPhoto,
} from "../../../../api/peternakan/blog";
import CreateBlogModal from "./createBlog";
import EditBlogModal from "./editBlog";
import CreateTopicModal from "./createTopic"; // Import CreateTopicModal
import Swal from "sweetalert2";

const BlogAll = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateTopicModal, setShowCreateTopicModal] = useState(false); // State for CreateTopicModal
  const [editBlogId, setEditBlogId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const blogsRes = await getBlogs();

      const blogsWithPhotos = await Promise.all(
        blogsRes.map(async (blog) => {
          try {
            const photoRes = await getBlogPhoto(blog.id);
            return { ...blog, photo: photoRes.photo_url };
          } catch {
            return { ...blog, photo: null };
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
  const stripHtmlTags = (html) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };

  const handleDelete = async (id) => {
    if (!id) return;

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    setSubmitting(true);
    try {
      await deleteBlog(id); // Pastikan API ini berfungsi dengan benar
      fetchData(); // Refresh data setelah penghapusan berhasil
      setDeleteId(null); // Reset deleteId setelah penghapusan
      Swal.fire("Deleted!", "Your blog has been deleted.", "success");
    } catch (err) {
      console.error("Failed to delete blog:", err.message);
      Swal.fire("Error!", "Failed to delete blog: " + err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (id) => {
    setEditBlogId(id);
    setShowEditModal(true);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = data.filter((item) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(searchLower) ||
      item.description.toLowerCase().includes(searchLower) ||
      item.topic.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="p-4">
      <div className="d-flex flex-column mb-4">
        <h2 className="text-primary mb-3">
          <i className="bi bi-journal-text"></i> Blog Articles
        </h2>
      </div>

      {/* Filter Section */}
      <div className="card p-3 mb-4 bg-light">
        <div className="row g-3 align-items-center justify-content-between">
          {/* Search Field */}
          <div className="col-md-3 d-flex flex-column">
            <label className="form-label">Search</label>
            <div className="input-group">
              <span className="input-group-text">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                placeholder="Search blogs..."
                className="form-control"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="col-md-4 d-flex gap-2 justify-content-end">
            <button
              className="btn btn-info"
              onClick={() => setShowCreateModal(true)}
            >
              + Create Blog
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setShowCreateTopicModal(true)} // Open CreateTopicModal
            >
              + Add Topic
            </button>
          </div>
        </div>
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
      ) : filteredData.length === 0 ? (
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
                    {filteredData.map((item, index) => (
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
                          {stripHtmlTags(item.description).length > 50
                            ? `${stripHtmlTags(item.description).substring(
                                0,
                                50
                              )}...`
                            : stripHtmlTags(item.description)}
                        </td>
                        <td>{item.topic_name}</td>
                        <td>
                          <button
                            onClick={() => handleEdit(item.id)}
                            className="btn btn-warning me-2"
                          >
                            <i className="ri-edit-line"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)} // Panggil handleDelete dengan id
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

      {/* Create Blog Modal */}
      {showCreateModal && (
        <CreateBlogModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={fetchData}
        />
      )}

      {/* Edit Blog Modal */}
      {showEditModal && editBlogId && (
        <EditBlogModal
          blogId={editBlogId}
          onClose={() => setShowEditModal(false)}
          onSuccess={fetchData}
        />
      )}

      {/* Create Topic Modal */}
      {showCreateTopicModal && (
        <CreateTopicModal
          onClose={() => setShowCreateTopicModal(false)}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
};

export default BlogAll;
