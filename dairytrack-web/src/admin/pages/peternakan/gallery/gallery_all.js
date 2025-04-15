import React, { useEffect, useState } from "react";
import {
  getGalleries,
  deleteGallery,
  getGalleryPhoto,
} from "../../../../api/peternakan/gallery";
import Swal from "sweetalert2";
import GalleryModal from "./gallery_modal";

const GalleryAll = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [currentGallery, setCurrentGallery] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const galleriesRes = await getGalleries();

      const galleriesWithPhotos = await Promise.all(
        galleriesRes.map(async (gallery) => {
          try {
            const photoRes = await getGalleryPhoto(gallery.id);
            return { ...gallery, photo: photoRes.photo_url };
          } catch {
            return { ...gallery, photo: null };
          }
        })
      );

      setData(galleriesWithPhotos);
      setError("");
    } catch (err) {
      console.error("Failed to fetch data:", err.message);
      setError(
        "Failed to fetch data. Please ensure the API server is running."
      );
    } finally {
      setLoading(false);
    }
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

    try {
      await deleteGallery(id);
      setData((prevData) => prevData.filter((item) => item.id !== id));
      Swal.fire("Deleted!", "Your gallery item has been deleted.", "success");
    } catch (err) {
      console.error("Failed to delete gallery:", err.message);
      Swal.fire("Error!", "Failed to delete gallery: " + err.message, "error");
    }
  };

  const handleEdit = (gallery) => {
    setCurrentGallery(gallery);
    setShowModal(true);
  };

  const handleCreate = () => {
    setCurrentGallery(null);
    setShowModal(true);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = data.filter((item) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      (item.photo && item.photo.toLowerCase().includes(searchLower)) ||
      (item.tittle && item.tittle.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="p-4">
      <div className="d-flex flex-column mb-4">
        <h2 className="text-primary mb-3">
          <i className="bi bi-images"></i> Gallery Management
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
                placeholder="Search galleries..."
                className="form-control"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="col-md-4 d-flex gap-2 justify-content-end">
            <button className="btn btn-primary" onClick={handleCreate}>
              + Add Gallery
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
          <p className="mt-2">Loading gallery data...</p>
        </div>
      ) : filteredData.length === 0 ? (
        <p className="text-gray-500">No gallery data available.</p>
      ) : (
        <div className="col-lg-12">
          <div className="card">
            <div className="card-body">
              <h4 className="card-title">Gallery Data</h4>
              <div className="table-responsive">
                <table className="table table-striped mb-0">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Image</th>
                      <th>Title</th>
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
                            alt={item.tittle || "Gallery image"}
                            className="rounded"
                            style={{
                              width: "50px",
                              height: "50px",
                              objectFit: "cover",
                            }}
                          />
                        </td>
                        <td>{item.tittle || "Untitled"}</td>
                        <td>
                          <button
                            onClick={() => handleEdit(item)}
                            className="btn btn-warning me-2"
                          >
                            <i className="ri-edit-line"></i>
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
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

      {/* Gallery Modal */}
      {showModal && (
        <GalleryModal
          show={showModal}
          handleClose={() => setShowModal(false)}
          handleSave={fetchData}
          initialData={currentGallery}
        />
      )}
    </div>
  );
};

export default GalleryAll;
