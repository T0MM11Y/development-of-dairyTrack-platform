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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 8;

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
      // Get latest photo URL
      const photoRes = await getGalleryPhoto(updatedGallery.id);
      const updatedGalleryWithPhoto = {
        ...updatedGallery,
        photo: photoRes.photo_url,
      };

      if (currentGallery) {
        // Update existing gallery
        setData((prevData) =>
          prevData.map((item) =>
            item.id === updatedGalleryWithPhoto.id
              ? updatedGalleryWithPhoto
              : item
          )
        );
      } else {
        // Add new gallery
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

  // Pagination logic
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handlePageClick = (pageIndex) => {
    setCurrentPage(pageIndex);
  };

  return (
    <div className="container-fluid py-4" style={{ marginBottom: "30px" }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-0">
            <i className="bi bi-images me-2 text-primary"></i>
            <span className="text-gradient">Gallery Management</span>
          </h2>
          <p className="text-muted mb-0">
            Manage your photo gallery collection
          </p>
        </div>
        <button
          className="btn btn-primary d-flex align-items-center"
          onClick={handleCreate}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Add New Gallery
        </button>
      </div>

      {/* Search and Filter Card */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3 align-items-center">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-transparent">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search by title or image URL..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-6 text-md-end">
              <span className="badge bg-light text-dark me-2">
                Total Items: {filteredData.length}
              </span>
              <span className="badge bg-light text-dark">
                Page: {currentPage + 1} of {totalPages}
              </span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div
          className="alert alert-danger d-flex align-items-center"
          role="alert"
        >
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          <div>{error}</div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div
            className="spinner-border text-primary"
            style={{ width: "3rem", height: "3rem" }}
            role="status"
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">Loading gallery data...</p>
        </div>
      ) : paginatedData.length === 0 ? (
        <div className="text-center py-5">
          <i
            className="bi bi-image text-muted"
            style={{ fontSize: "4rem" }}
          ></i>
          <h4 className="mt-3 text-muted">No gallery items found</h4>
          <p className="text-muted">
            Try adjusting your search or create a new gallery item
          </p>
          <button className="btn btn-primary mt-3" onClick={handleCreate}>
            <i className="bi bi-plus-circle me-2"></i>
            Create Gallery
          </button>
        </div>
      ) : (
        <>
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
            {paginatedData.map((item) => (
              <div className="col" key={item.id}>
                <div className="card h-100 shadow-sm">
                  <div className="position-relative">
                    <img
                      src={item.photo || "/placeholder-image.jpg"}
                      alt={item.tittle || "Gallery image"}
                      className="card-img-top"
                      style={{
                        height: "200px",
                        objectFit: "cover",
                        width: "100%",
                      }}
                    />
                    <div className="position-absolute top-0 end-0 p-2">
                      <span className="badge bg-primary">ID: {item.id}</span>
                    </div>
                  </div>
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title text-truncate">
                      {item.tittle || "Untitled"}
                    </h5>
                    <div className="mt-auto d-grid gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="btn btn-outline-primary btn-sm"
                      >
                        <i className="bi bi-pencil-square me-2"></i>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="btn btn-outline-danger btn-sm"
                      >
                        <i className="bi bi-trash me-2"></i>
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="card-footer bg-transparent">
                    <small className="text-muted">
                      Last updated: {new Date().toLocaleDateString()}
                    </small>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="mt-4">
              <ul className="pagination justify-content-center">
                <li
                  className={`page-item ${currentPage === 0 ? "disabled" : ""}`}
                >
                  <button
                    className="page-link"
                    onClick={handlePrevPage}
                    aria-label="Previous"
                  >
                    <span aria-hidden="true">&laquo;</span>
                  </button>
                </li>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i;
                  } else if (currentPage <= 2) {
                    pageNum = i;
                  } else if (currentPage >= totalPages - 3) {
                    pageNum = totalPages - 5 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <li
                      key={pageNum}
                      className={`page-item ${
                        currentPage === pageNum ? "active" : ""
                      }`}
                    >
                      <button
                        className="page-link"
                        onClick={() => handlePageClick(pageNum)}
                      >
                        {pageNum + 1}
                      </button>
                    </li>
                  );
                })}

                <li
                  className={`page-item ${
                    currentPage === totalPages - 1 ? "disabled" : ""
                  }`}
                >
                  <button
                    className="page-link"
                    onClick={handleNextPage}
                    aria-label="Next"
                  >
                    <span aria-hidden="true">&raquo;</span>
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </>
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
