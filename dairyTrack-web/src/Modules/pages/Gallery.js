import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  InputGroup,
  Spinner,
  Modal,
  Pagination,
} from "react-bootstrap";
import { motion } from "framer-motion";

import { format } from "date-fns";
import { listGalleries } from "../../Modules/controllers/galleryController.js";

const Gallery = () => {
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("newest");
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const galleriesPerPage = 8;
  const heroColors = {
    primary: "#E9A319",
    secondary: "#3D8D7A",
    accent: "#F15A29",
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  // Simple color definitions
  const greyColor = "#6c757d";
  const primaryColor = "#3D90D7"; // Using the blue from ListOfGallery

  // Fetch galleries
  useEffect(() => {
    const fetchGalleries = async () => {
      try {
        setLoading(true);
        const { success, galleries, message } = await listGalleries();

        if (success) {
          setGalleries(galleries);
        } else {
          throw new Error(message || "Failed to fetch gallery images");
        }
      } catch (err) {
        setError(err.message || "An unexpected error occurred");
        console.error("Error fetching galleries:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGalleries();
  }, []);

  // Filter and sort galleries
  const filteredAndSortedGalleries = useMemo(() => {
    // First filter
    const filtered = galleries.filter((gallery) =>
      gallery.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Then sort
    return filtered.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.created_at) - new Date(a.created_at);
      } else if (sortBy === "oldest") {
        return new Date(a.created_at) - new Date(b.created_at);
      } else if (sortBy === "alphabetical") {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }, [galleries, searchTerm, sortBy]);

  // Pagination
  const currentGalleries = useMemo(() => {
    const startIndex = (currentPage - 1) * galleriesPerPage;
    return filteredAndSortedGalleries.slice(
      startIndex,
      startIndex + galleriesPerPage
    );
  }, [filteredAndSortedGalleries, currentPage]);

  const totalPages = Math.ceil(
    filteredAndSortedGalleries.length / galleriesPerPage
  );

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top of the gallery section
    document
      .getElementById("gallery-section")
      .scrollIntoView({ behavior: "smooth" });
  };

  // Open image modal
  const handleOpenImage = (gallery) => {
    setSelectedImage(gallery);
    setShowModal(true);
  };

  // Loading state
  if (loading) {
    return (
      <Container className="py-5 text-center" style={{ minHeight: "70vh" }}>
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading gallery images...</p>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container className="py-5 text-center" style={{ minHeight: "70vh" }}>
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="p-0">
      {/* Hero Section ala About.js */}
      <div
        className="gallery-hero-section text-white position-relative"
        style={{
          background: `linear-gradient(to right, rgba(61, 141, 122, 0.93), rgba(61, 141, 122, 0.7)), url(${require("../../assets/about.png")}) no-repeat center center`,
          backgroundSize: "cover",
          minHeight: "40vh",
          display: "flex",
          alignItems: "center",
          borderBottom: `5px solid ${heroColors.primary}`,
        }}
      >
        <Container>
          <Row className="align-items-center">
            <Col md={8} className="text-md-start text-center">
              <motion.div initial="hidden" animate="visible" variants={fadeIn}>
                <h1
                  className="display-4 fw-bold mb-3"
                  style={{
                    fontFamily: "Roboto, sans-serif",
                    letterSpacing: "2px",
                    fontSize: "45px",
                    fontWeight: "700",
                    textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
                  }}
                >
                  Galeri Foto
                </h1>
                <div
                  className="title-bar mb-4"
                  style={{
                    width: "80px",
                    height: "4px",
                    background: heroColors.primary,
                  }}
                ></div>
                <p
                  className="lead mb-4"
                  style={{ fontSize: "18px", maxWidth: "600px" }}
                >
                  <i className="fas fa-images me-2"></i>
                  Jelajahi koleksi foto-foto terbaik kami yang menampilkan
                  aktivitas, fasilitas, hewan ternak, dan produk Dairy~Track.
                  Temukan cerita visual di balik setiap momen di peternakan
                  kami.
                </p>
              </motion.div>
            </Col>
            <Col md={4} className="d-none d-md-block">
              <motion.div
                className="text-end"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0, x: 50 },
                  visible: {
                    opacity: 1,
                    x: 0,
                    transition: { duration: 0.9, ease: "easeOut" },
                  },
                }}
              >
                <div
                  className="icon-circle"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.15)",
                    color: "#fff",
                    width: "180px",
                    height: "180px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backdropFilter: "blur(5px)",
                    margin: "0 auto",
                  }}
                >
                  <i className="fas fa-camera-retro fa-4x"></i>
                </div>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Gallery Content */}
      <Container className="py-5" id="gallery-section">
        {/* Filters */}
        <Row className="mb-4">
          <Col lg={6} md={6} className="mb-3">
            <InputGroup>
              <InputGroup.Text className="bg-white">
                <i className="fas fa-search text-muted"></i>
              </InputGroup.Text>
              <Form.Control
                placeholder="Search gallery..."
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
                  <i className="fas fa-times"></i>
                </Button>
              )}
            </InputGroup>
          </Col>
          <Col lg={6} md={6} className="mb-3">
            <Form.Select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="alphabetical">Alphabetical</option>
            </Form.Select>
          </Col>
        </Row>

        {/* Gallery Images */}
        {currentGalleries.length > 0 ? (
          <>
            <Row className="g-4">
              {currentGalleries.map((gallery) => (
                <Col lg={3} md={4} sm={6} key={gallery.id} className="mb-4">
                  <Card
                    className="h-100 shadow-sm gallery-card"
                    onClick={() => handleOpenImage(gallery)}
                  >
                    <div
                      className="gallery-image-container"
                      style={{ height: "200px", overflow: "hidden" }}
                    >
                      <Card.Img
                        variant="top"
                        src={gallery.image_url}
                        alt={gallery.title}
                        className="gallery-image"
                      />
                      <div className="gallery-overlay">
                        <Button variant="light" className="view-button">
                          <i className="fas fa-search-plus me-2"></i>View
                        </Button>
                      </div>
                    </div>
                    <Card.Body className="text-center">
                      <Card.Title
                        className="gallery-title"
                        style={{
                          fontSize: "18px",
                          fontWeight: "500",
                          color: "grey",
                        }}
                      >
                        {gallery.title}
                      </Card.Title>
                      <small className="text-muted">
                        <i className="fas fa-calendar-alt me-2"></i>
                        {format(new Date(gallery.created_at), "MMMM dd, yyyy")}
                      </small>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Pagination */}
            {totalPages > 1 && (
              <Row className="mt-5">
                <Col className="d-flex justify-content-center">
                  <Pagination>
                    <Pagination.First
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(1)}
                    />
                    <Pagination.Prev
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                    />

                    {Array.from({ length: totalPages }).map((_, index) => {
                      const pageNum = index + 1;
                      // Show current page, first and last page, and one page before and after current
                      if (
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        Math.abs(pageNum - currentPage) <= 1
                      ) {
                        return (
                          <Pagination.Item
                            key={pageNum}
                            active={pageNum === currentPage}
                            onClick={() => handlePageChange(pageNum)}
                            style={
                              pageNum === currentPage
                                ? {
                                    backgroundColor: primaryColor,
                                    borderColor: primaryColor,
                                  }
                                : {}
                            }
                          >
                            {pageNum}
                          </Pagination.Item>
                        );
                      } else if (
                        (pageNum === 2 && currentPage > 3) ||
                        (pageNum === totalPages - 1 &&
                          currentPage < totalPages - 2)
                      ) {
                        return (
                          <Pagination.Ellipsis key={`ellipsis-${pageNum}`} />
                        );
                      } else {
                        return null;
                      }
                    })}

                    <Pagination.Next
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                    />
                    <Pagination.Last
                      disabled={currentPage === totalPages}
                      onClick={() => handlePageChange(totalPages)}
                    />
                  </Pagination>
                </Col>
              </Row>
            )}

            {/* Gallery Stats */}
            <Row className="mt-3">
              <Col className="text-center">
                <small className="text-muted">
                  Showing {(currentPage - 1) * galleriesPerPage + 1} to{" "}
                  {Math.min(
                    currentPage * galleriesPerPage,
                    filteredAndSortedGalleries.length
                  )}{" "}
                  of {filteredAndSortedGalleries.length} images
                </small>
              </Col>
            </Row>
          </>
        ) : (
          <Row className="py-5">
            <Col className="text-center">
              <i className="fas fa-images fa-3x text-muted mb-3"></i>
              <h4>No gallery images found</h4>
              {searchTerm && (
                <>
                  <p className="text-muted">Try changing your search terms</p>
                  <Button variant="primary" onClick={() => setSearchTerm("")}>
                    Clear Search
                  </Button>
                </>
              )}
            </Col>
          </Row>
        )}
      </Container>

      {/* Image Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
        dialogClassName="modal-90w"
      >
        <Modal.Header closeButton>
          <Modal.Title>{selectedImage?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center p-0">
          {selectedImage && (
            <img
              src={selectedImage.image_url}
              alt={selectedImage.title}
              style={{
                maxWidth: "100%",
                maxHeight: "80vh",
                objectFit: "contain",
              }}
            />
          )}
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-between">
          <small className="text-muted">
            <i className="fas fa-calendar-alt me-2"></i>
            Added on{" "}
            {selectedImage &&
              format(new Date(selectedImage.created_at), "MMMM dd, yyyy")}
          </small>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Custom CSS */}
      <style jsx>{`
        .gallery-card {
          cursor: pointer;
          transition: all 0.3s ease;
          border-radius: 8px;
          overflow: hidden;
        }

        .gallery-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
        }

        .gallery-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .gallery-card:hover .gallery-image {
          transform: scale(1.05);
        }

        .gallery-image-container {
          position: relative;
        }

        .gallery-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .gallery-card:hover .gallery-overlay {
          opacity: 1;
        }

        .view-button {
          transform: scale(0.8);
          transition: transform 0.3s ease;
        }

        .gallery-card:hover .view-button {
          transform: scale(1);
        }

        .gallery-title {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* Modal customization */
        .modal-90w {
          max-width: 90%;
        }

        /* Pagination styling */
        .page-item.active .page-link {
          background-color: ${primaryColor};
          border-color: ${primaryColor};
        }

        .page-link {
          color: ${primaryColor};
        }
      `}</style>
    </Container>
  );
};

export default Gallery;
