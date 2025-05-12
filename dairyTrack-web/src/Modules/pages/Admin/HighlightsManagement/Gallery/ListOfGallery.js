import React, { useEffect, useState, useMemo } from "react";
import { format } from "date-fns";
import Swal from "sweetalert2";
import {
  Button,
  Card,
  Form,
  FormControl,
  InputGroup,
  Modal,
  OverlayTrigger,
  Pagination,
  Spinner,
  Tooltip,
} from "react-bootstrap";
import {
  listGalleries,
  addGallery,
  deleteGallery,
  updateGallery, // Import updateGallery
} from "../../../../controllers/galleryController";

const ListOfGallery = () => {
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false); // State untuk modal edit
  const [newGallery, setNewGallery] = useState({ title: "", image: null });
  const [selectedGallery, setSelectedGallery] = useState(null); // State untuk galeri yang dipilih
  const galleriesPerPage = 8;

  // Fetch galleries
  useEffect(() => {
    const fetchGalleries = async () => {
      try {
        const { success, galleries, message } = await listGalleries();
        setGalleries(success ? galleries : []);
        setError(success ? null : message || "Failed to fetch galleries.");
      } catch {
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };
    fetchGalleries();
  }, []);

  // Memoized filtered and paginated galleries
  const filteredGalleries = useMemo(
    () =>
      galleries.filter((gallery) =>
        gallery.title.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [galleries, searchTerm]
  );

  const currentGalleries = useMemo(() => {
    const startIndex = (currentPage - 1) * galleriesPerPage;
    return filteredGalleries.slice(startIndex, startIndex + galleriesPerPage);
  }, [filteredGalleries, currentPage]);

  const totalPages = Math.ceil(filteredGalleries.length / galleriesPerPage);

  // Handlers
  const handlePageChange = (page) => setCurrentPage(page);

  const handleDeleteGallery = async (galleryId) => {
    const { isConfirmed } = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (isConfirmed) {
      const { success, message } = await deleteGallery(galleryId);
      if (success) {
        setGalleries(galleries.filter((gallery) => gallery.id !== galleryId));
        Swal.fire("Deleted!", "Gallery deleted.", "success");
      } else {
        Swal.fire("Error!", message || "Failed to delete gallery.", "error");
      }
    }
  };

  const handleAddGallery = async (e) => {
    e.preventDefault();
    const { success, gallery } = await addGallery(newGallery);
    if (success) {
      setGalleries([...galleries, gallery]);
      setShowModal(false);
      setNewGallery({ title: "", image: null });
    }
  };

  const handleEditGallery = async (e) => {
    e.preventDefault();
    const { success, gallery } = await updateGallery(
      selectedGallery.id,
      selectedGallery
    );
    if (success) {
      setGalleries((prev) =>
        prev.map((g) => (g.id === gallery.id ? gallery : g))
      );
      setShowEditModal(false);
      setSelectedGallery(null);
      Swal.fire("Updated!", "Gallery updated successfully.", "success");
    } else {
      Swal.fire("Error!", "Failed to update gallery.", "error");
    }
  };

  const openEditModal = (gallery) => {
    setSelectedGallery({ ...gallery });
    setShowEditModal(true);
  };

  // Render loading or error states
  if (loading)
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "70vh" }}
      >
        <Spinner animation="border" variant="primary" />
      </div>
    );

  if (error)
    return (
      <div className="container mt-4">
        <div className="alert alert-danger text-center">{error}</div>
      </div>
    );

  return (
    <div className="container-fluid mt-4">
      <Card className="shadow-lg border-0 rounded-lg">
        <Card.Header className="bg-gradient-primary text-grey py-3">
          <h4
            className="mb-0"
            style={{
              color: "#3D90D7",
              fontSize: "25px",
              fontFamily: "Roboto, Monospace",
              letterSpacing: "1.4px",
            }}
          >
            <i className="fas fa-images me-2" /> Gallery Management
          </h4>
          <div className="d-flex justify-content-end mt-3">
            <Button variant="primary" onClick={() => setShowModal(true)}>
              <i className="fas fa-plus me-2" /> Add Gallery
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          {/* Search Input */}
          <InputGroup className="shadow-sm mb-4" style={{ maxWidth: "500px" }}>
            <InputGroup.Text className="bg-primary text-white border-0">
              <i className="fas fa-search" />
            </InputGroup.Text>
            <FormControl
              placeholder="Search galleries..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            {searchTerm && (
              <Button
                variant="outline-secondary"
                onClick={() => setSearchTerm("")}
              >
                <i className="bi bi-x-lg" />
              </Button>
            )}
          </InputGroup>

          {/* Gallery List */}
          <div className="row">
            {currentGalleries.map((gallery) => (
              <div className="col-md-3 mb-4" key={gallery.id}>
                {" "}
                {/* Ubah col-md-4 menjadi col-md-3 */}
                <Card className="h-60 shadow-sm">
                  <Card.Img
                    variant="top"
                    src={gallery.image_url}
                    alt={gallery.title}
                    style={{ height: "200px", objectFit: "cover" }}
                  />
                  <Card.Body>
                    <Card.Title
                      style={{
                        fontSize: "18px",
                        fontWeight: "500",
                        color: "grey",
                        letterSpacing: "0.2px",
                        textAlign: "center",
                        backgroundColor: "#EEEEEE",
                        fontFamily: "sans-serif",
                      }}
                    >
                      {gallery.title}
                    </Card.Title>
                    <Card.Text>
                      <div className="d-flex align-items-center mb-2">
                        <i
                          className="fas fa-calendar-alt me-2"
                          style={{ color: "#6c757d" }} // Warna kustom untuk ikon (abu-abu)
                        />
                        <small
                          className="text-muted"
                          style={{ letterSpacing: "0.4px", fontWeight: "400" }} // Letter spacing dan font weight
                        >
                          <strong>Created:</strong>{" "}
                          {format(
                            new Date(gallery.created_at),
                            "MMMM dd, yyyy"
                          )}
                        </small>
                      </div>
                      <div className="d-flex align-items-center">
                        <i
                          className="fas fa-edit me-2"
                          style={{ color: "#6c757d" }} // Warna kustom untuk ikon (abu-abu)
                        />
                        <small
                          className="text-muted"
                          style={{ letterSpacing: "0.4px", fontWeight: "400" }} // Letter spacing dan font weight
                        >
                          <strong>Updated:</strong>{" "}
                          {format(
                            new Date(gallery.updated_at),
                            "MMMM dd, yyyy"
                          )}
                        </small>
                      </div>
                    </Card.Text>
                  </Card.Body>
                  <Card.Footer className="d-flex justify-content-between">
                    <OverlayTrigger overlay={<Tooltip>Edit Gallery</Tooltip>}>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => openEditModal(gallery)} // Open edit modal
                      >
                        <i className="fas fa-edit" /> Edit
                      </Button>
                    </OverlayTrigger>
                    <OverlayTrigger overlay={<Tooltip>Delete Gallery</Tooltip>}>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDeleteGallery(gallery.id)}
                      >
                        <i className="fas fa-trash-alt" /> Delete
                      </Button>
                    </OverlayTrigger>
                  </Card.Footer>
                </Card>
              </div>
            ))}
          </div>
          {!filteredGalleries.length && (
            <p className="text-center text-muted">No galleries found.</p>
          )}

          {/* Pagination */}
          {totalPages >= 1 && (
            <div className="card-footer bg-transparent border-0 mt-3">
              <nav aria-label="Page navigation">
                <ul className="pagination justify-content-center mb-0">
                  <li
                    className={`page-item ${
                      currentPage === 1 ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(1)}
                    >
                      <i className="bi bi-chevron-double-left"></i>
                    </button>
                  </li>
                  <li
                    className={`page-item ${
                      currentPage === 1 ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      <i className="bi bi-chevron-left"></i>
                    </button>
                  </li>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <li
                        key={page}
                        className={`page-item ${
                          currentPage === page ? "active" : ""
                        }`}
                      >
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </button>
                      </li>
                    )
                  )}

                  <li
                    className={`page-item ${
                      currentPage === totalPages ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      <i className="bi bi-chevron-right"></i>
                    </button>
                  </li>
                  <li
                    className={`page-item ${
                      currentPage === totalPages ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(totalPages)}
                    >
                      <i className="bi bi-chevron-double-right"></i>
                    </button>
                  </li>
                </ul>
              </nav>
              <div className="text-center mt-3">
                <small className="text-muted">
                  Showing {(currentPage - 1) * galleriesPerPage + 1} to{" "}
                  {Math.min(
                    currentPage * galleriesPerPage,
                    filteredGalleries.length
                  )}{" "}
                  of {filteredGalleries.length} entries
                </small>
              </div>
            </div>
          )}
        </Card.Body>
      </Card>
      {/* Add Gallery Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Gallery</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddGallery}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter gallery title"
                value={newGallery.title}
                onChange={(e) =>
                  setNewGallery({ ...newGallery, title: e.target.value })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Image</Form.Label>
              <Form.Control
                type="file"
                onChange={(e) =>
                  setNewGallery({ ...newGallery, image: e.target.files[0] })
                }
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Add Gallery
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
      {/* Edit Gallery Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Gallery</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEditGallery}>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter gallery title"
                value={selectedGallery?.title || ""}
                onChange={(e) =>
                  setSelectedGallery({
                    ...selectedGallery,
                    title: e.target.value,
                  })
                }
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Image</Form.Label>
              <div className="d-flex flex-wrap justify-content-between align-items-center">
                {/* Current Image */}
                {selectedGallery?.image_url && (
                  <div className="mb-3" style={{ width: "48%" }}>
                    <h6>Current Image</h6>
                    <img
                      src={selectedGallery.image_url}
                      alt="Current"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "200px",
                        objectFit: "contain",
                      }}
                      className="mb-2 border p-1"
                    />
                    <div className="text-muted small">
                      {selectedGallery.image_url.split("/").pop()}
                    </div>
                  </div>
                )}

                {/* New Image Preview */}
                {selectedGallery?.previewUrl && (
                  <div className="mb-3" style={{ width: "48%" }}>
                    <h6>New Image Preview</h6>
                    <img
                      src={selectedGallery.previewUrl}
                      alt="Preview"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "200px",
                        objectFit: "contain",
                      }}
                      className="mb-2 border p-1"
                    />
                    <div className="text-muted small">
                      {selectedGallery.image?.name}
                    </div>
                  </div>
                )}
              </div>

              <Form.Control
                type="file"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    // Create a preview URL for the new image
                    const previewUrl = URL.createObjectURL(file);
                    setSelectedGallery({
                      ...selectedGallery,
                      image: file,
                      previewUrl: previewUrl, // Temporary URL for preview
                    });
                  } else {
                    setSelectedGallery({
                      ...selectedGallery,
                      image: null,
                      previewUrl: null,
                    });
                  }
                }}
                accept="image/*"
              />
            </Form.Group>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ListOfGallery;
