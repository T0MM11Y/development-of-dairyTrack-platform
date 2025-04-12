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

  const handleSave = async (updatedGallery) => {
    try {
      // Ambil URL foto terbaru
      const photoRes = await getGalleryPhoto(updatedGallery.id);
      const updatedGalleryWithPhoto = {
        ...updatedGallery,
        photo: photoRes.photo_url,
      };

      if (currentGallery) {
        // Update galeri yang ada
        setData((prevData) =>
          prevData.map((item) =>
            item.id === updatedGalleryWithPhoto.id
              ? updatedGalleryWithPhoto
              : item
          )
        );
      } else {
        // Tambahkan galeri baru
        setData((prevData) => [updatedGalleryWithPhoto, ...prevData]);
      }
    } catch (error) {
      console.error("Failed to update photo URL:", error.message);
    } finally {
      setShowModal(false);
    }
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
          <i className="bi bi-images"></i> Gallery
        </h2>
      </div>

      {/* Filter Section */}
      <div className="card p-3 mb-4 bg-light">
        <div className="row g-3 align-items-center justify-content-between">
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

          <div className="col-md-4 d-flex gap-2 justify-content-end">
            <button className="btn btn-info" onClick={handleCreate}>
              + Create New Gallery
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
        <div className="row">
          {filteredData.map((item, index) => (
            <div className="col-md-3 mb-4" key={item.id}>
              <div className="card">
                <img
                  src={item.photo || "/placeholder-image.jpg"}
                  alt={`Gallery ${index + 1}`}
                  className="card-img-top"
                  style={{
                    width: "100%",
                    height: "200px",
                    objectFit: "cover",
                  }}
                />
                <div className="card-body text-center">
                  <h5 className="card-title">{item.tittle || "Untitled"}</h5>
                  <div className="d-flex justify-content-center gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="btn btn-primary"
                    >
                      <i className="bi bi-pencil"></i> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="btn btn-danger"
                    >
                      <i className="ri-delete-bin-6-line"></i> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <GalleryModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        handleSave={handleSave}
        initialData={currentGallery}
      />
    </div>
  );
};

export default GalleryAll;
