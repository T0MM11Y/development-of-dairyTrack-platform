import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  Badge,
} from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { listGalleries } from "../../Modules/controllers/galleryController.js";
import loadingGif from "../../assets/loading.gif";
import aboutImg from "../../assets/about.png";

// Constants
const GALLERIES_PER_PAGE = 12;
const PARTICLES_COUNT = 25;

// Theme configuration
const theme = {
  primary: "#E9A319",
  secondary: "#3D8D7A",
  accent: "#3D90D7",
  light: "#F8F9FA",
  dark: "#212529",
  gradients: {
    primary: "linear-gradient(135deg, #E9A319 0%, #F4B942 100%)",
    secondary: "linear-gradient(135deg, #3D8D7A 0%, #4AA391 100%)",
    hero: "linear-gradient(135deg, rgba(61, 141, 122, 0.93), rgba(61, 141, 122, 0.7))",
    overlay:
      "linear-gradient(0deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0) 100%)",
  },
  shadows: {
    card: "0 10px 40px rgba(0, 0, 0, 0.1)",
    hover: "0 20px 60px rgba(0, 0, 0, 0.15)",
    glow: "0 0 30px rgba(233, 163, 25, 0.3)",
  },
};

// Animation variants
const animations = {
  fadeInUp: {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  },
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
    },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  },
  slideInLeft: {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  },
  slideInRight: {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  },
};

// Memoized components
const LoadingScreen = React.memo(() => (
  <div className="loading-screen">
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.5 }}
      className="loading-content"
    >
      <img src={loadingGif} alt="Loading..." className="loading-gif" />
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="loading-text"
      />
    </motion.div>
  </div>
));

const ErrorMessage = React.memo(({ error, onRetry }) => (
  <Container className="py-5 text-center" style={{ minHeight: "70vh" }}>
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="error-container"
    >
      <div className="error-icon">
        <i className="fas fa-exclamation-triangle" />
      </div>
      <h3>Oops! Something went wrong</h3>
      <p>{error}</p>
      <Button variant="warning" onClick={onRetry}>
        Try Again
      </Button>
    </motion.div>
  </Container>
));

const HeroSection = React.memo(({ galleries, availableYears }) => (
  <section className="hero-section">
    <div className="hero-background">
      <div className="particles-container">
        {Array.from({ length: PARTICLES_COUNT }, (_, i) => (
          <motion.div
            key={i}
            className={`particle particle-${i % 4}`}
            animate={{
              y: [0, -120, 0],
              x: [0, Math.random() * 40 - 20, 0],
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <Container className="hero-content">
        <Row className="align-items-center min-vh-50">
          <Col lg={8}>
            <motion.div
              initial="hidden"
              animate="visible"
              variants={animations.fadeInUp}
              className="hero-text"
            >
              <div className="hero-badge">
                <i className="fas fa-camera-retro me-2" />
                Visual Journey
              </div>
              <h1 className="hero-title">
                Photo
                <span className="gradient-text"> Gallery</span>
              </h1>
              <div className="title-divider" />
              <p className="hero-description">
                Explore our best photo collection featuring activities,
                facilities, livestock, and DairyTrack products. Discover the
                visual stories behind every moment at our farm.
              </p>

              <div className="hero-stats">
                {[
                  { number: galleries.length, label: "Photos" },
                  { number: availableYears.length, label: "Years" },
                  { number: "24/7", label: "Memories" },
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    className="stat-item"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="stat-number">{stat.number}</div>
                    <div className="stat-label">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </Col>

          <Col lg={4} className="d-none d-lg-block">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={animations.slideInRight}
              className="hero-visual"
            >
              <div className="hero-icon-container">
                <motion.div
                  className="hero-icon-circle"
                  animate={{
                    boxShadow: [
                      "0 0 20px rgba(233, 163, 25, 0.3)",
                      "0 0 40px rgba(233, 163, 25, 0.6)",
                      "0 0 20px rgba(233, 163, 25, 0.3)",
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="icon-glow" />
                  <i className="fas fa-camera-retro" />
                </motion.div>

                <motion.div
                  className="floating-element element-1"
                  animate={{
                    y: [0, -15, 0],
                    rotate: [0, 5, 0],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <i className="fas fa-images" />
                </motion.div>
                <motion.div
                  className="floating-element element-2"
                  animate={{
                    y: [0, 15, 0],
                    rotate: [0, -5, 0],
                  }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                >
                  <i className="fas fa-aperture" />
                </motion.div>
              </div>
            </motion.div>
          </Col>
        </Row>
      </Container>
    </div>
  </section>
));

const FiltersSection = React.memo(
  ({
    searchTerm,
    setSearchTerm,
    selectedYear,
    setSelectedYear,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    availableYears,
    filteredCount,
    setCurrentPage,
    clearFilters,
  }) => (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={animations.fadeInUp}
      className="filters-container"
    >
      <div className="filters-header">
        <h3 className="filters-title">
          <i className="fas fa-sliders-h me-2" />
          Explore Our Gallery
        </h3>
        <div className="view-controls">
          <div className="view-mode-toggle">
            {["grid", "masonry"].map((mode) => (
              <Button
                key={mode}
                variant={viewMode === mode ? "primary" : "outline-primary"}
                size="sm"
                onClick={() => setViewMode(mode)}
                className={mode === "masonry" ? "ms-2" : "me-2"}
              >
                <i
                  className={`fas fa-${mode === "grid" ? "th" : "th-large"}`}
                />
              </Button>
            ))}
          </div>
        </div>
      </div>

      <Row className="filters-row">
        <Col lg={4} md={6} className="mb-3">
          <div className="search-container">
            <InputGroup className="search-input-group">
              <InputGroup.Text>
                <i className="fas fa-search" />
              </InputGroup.Text>
              <Form.Control
                placeholder="Search photos..."
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
                  <i className="fas fa-times" />
                </Button>
              )}
            </InputGroup>
          </div>
        </Col>

        <Col lg={3} md={6} className="mb-3">
          <Form.Select
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value);
              setCurrentPage(1);
            }}
            className="filter-select"
          >
            <option value="all">All Years</option>
            {availableYears.map((year) => (
              <option key={year} value={year.toString()}>
                {year}
              </option>
            ))}
          </Form.Select>
        </Col>

        <Col lg={3} md={6} className="mb-3">
          <Form.Select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
            className="filter-select"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="alphabetical">Alphabetical</option>
          </Form.Select>
        </Col>

        <Col lg={2} md={6} className="mb-3">
          <div className="results-info">
            <Badge bg="primary" className="results-badge">
              {filteredCount} Photos
            </Badge>
          </div>
        </Col>
      </Row>

      {(searchTerm || selectedYear !== "all") && (
        <div className="active-filters">
          <span className="filters-label">Active filters:</span>
          {searchTerm && (
            <Badge
              bg="warning"
              className="filter-badge"
              onClick={() => setSearchTerm("")}
            >
              Search: "{searchTerm}" <i className="fas fa-times ms-1" />
            </Badge>
          )}
          {selectedYear !== "all" && (
            <Badge
              bg="info"
              className="filter-badge"
              onClick={() => setSelectedYear("all")}
            >
              Year: {selectedYear} <i className="fas fa-times ms-1" />
            </Badge>
          )}
          <Button
            variant="link"
            size="sm"
            onClick={clearFilters}
            className="clear-filters-btn"
          >
            Clear All
          </Button>
        </div>
      )}
    </motion.div>
  )
);

const GalleryCard = React.memo(
  ({
    gallery,
    index,
    currentPage,
    viewMode,
    imageLoading,
    onImageLoad,
    onOpenImage,
  }) => (
    <Col
      lg={viewMode === "masonry" ? 4 : 3}
      md={viewMode === "masonry" ? 6 : 4}
      sm={6}
      xs={12}
    >
      <motion.div
        variants={animations.scaleIn}
        whileHover={{ y: -10 }}
        transition={{ duration: 0.3 }}
        className="gallery-card"
        onClick={() => onOpenImage(gallery)}
      >
        <div className="image-container">
          {imageLoading[gallery.id] && (
            <div className="image-skeleton">
              <div className="skeleton-shimmer" />
            </div>
          )}
          <img
            src={gallery.image_url}
            alt={gallery.title}
            className="gallery-image"
            onLoad={() => onImageLoad(gallery.id)}
            style={{
              display: imageLoading[gallery.id] ? "none" : "block",
            }}
          />

          <div className="image-overlay">
            <div className="overlay-content">
              <motion.div
                className="overlay-actions"
                initial={{ scale: 0.8, opacity: 0 }}
                whileHover={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Button variant="light" size="sm" className="action-btn">
                  <i className="fas fa-search-plus" />
                </Button>
                <Button variant="light" size="sm" className="action-btn ms-2">
                  <i className="fas fa-heart" />
                </Button>
              </motion.div>

              <div className="overlay-info">
                <h6 className="image-title">{gallery.title}</h6>
                <small className="image-date">
                  <i className="fas fa-calendar-alt me-1" />
                  {format(new Date(gallery.created_at), "MMM dd, yyyy")}
                </small>
              </div>
            </div>
          </div>

          <div className="image-number">
            #{(currentPage - 1) * GALLERIES_PER_PAGE + index + 1}
          </div>
        </div>
      </motion.div>
    </Col>
  )
);

const NoResults = React.memo(({ onReset }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    className="no-results"
  >
    <div className="no-results-content">
      <i className="fas fa-images fa-3x" />
      <h4>No photos found</h4>
      <p>Try adjusting your search terms or filters</p>
      <Button variant="primary" onClick={onReset}>
        <i className="fas fa-refresh me-2" />
        Reset Filters
      </Button>
    </div>
  </motion.div>
));

const CustomPagination = React.memo(
  ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="pagination-container"
    >
      <div className="pagination-info">
        Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
        {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}{" "}
        photos
      </div>
      <Pagination className="custom-pagination">
        <Pagination.First
          disabled={currentPage === 1}
          onClick={() => onPageChange(1)}
        />
        <Pagination.Prev
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        />

        {Array.from({ length: totalPages }).map((_, index) => {
          const pageNum = index + 1;
          if (
            pageNum === 1 ||
            pageNum === totalPages ||
            Math.abs(pageNum - currentPage) <= 1
          ) {
            return (
              <Pagination.Item
                key={pageNum}
                active={pageNum === currentPage}
                onClick={() => onPageChange(pageNum)}
              >
                {pageNum}
              </Pagination.Item>
            );
          } else if (
            (pageNum === 2 && currentPage > 3) ||
            (pageNum === totalPages - 1 && currentPage < totalPages - 2)
          ) {
            return <Pagination.Ellipsis key={`ellipsis-${pageNum}`} />;
          }
          return null;
        })}

        <Pagination.Next
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        />
        <Pagination.Last
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(totalPages)}
        />
      </Pagination>
    </motion.div>
  )
);

const ImageModal = React.memo(
  ({
    show,
    selectedImage,
    onClose,
    onNext,
    onPrev,
    galleries,
    showImageDetails,
    toggleImageDetails,
  }) => (
    <AnimatePresence>
      {show && selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="modal-backdrop"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            transition={{ duration: 0.3 }}
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-card">
              <div className="modal-header">
                <div className="modal-header-content">
                  <h3 className="modal-title">{selectedImage.title}</h3>
                  <div className="modal-meta">
                    <span className="modal-date">
                      <i className="fas fa-calendar-alt me-1" />
                      {format(
                        new Date(selectedImage.created_at),
                        "MMMM dd, yyyy"
                      )}
                    </span>
                  </div>
                </div>
                <div className="modal-actions">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="modal-action-btn"
                    onClick={toggleImageDetails}
                    aria-label="Show Info"
                  >
                    <i className="fas fa-info-circle" />
                  </motion.button>
                </div>
              </div>
              <div className="modal-body">
                <div className="modal-image-container">
                  <img
                    src={selectedImage.image_url}
                    alt={selectedImage.title}
                    className="modal-image"
                  />
                </div>

                <AnimatePresence>
                  {showImageDetails && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="image-details"
                    >
                      <div className="details-content">
                        <div className="detail-item">
                          <strong>Title:</strong> {selectedImage.title}
                        </div>
                        <div className="detail-item">
                          <strong>Date Added:</strong>{" "}
                          {format(
                            new Date(selectedImage.created_at),
                            "MMMM dd, yyyy 'at' HH:mm"
                          )}
                        </div>
                        <div className="detail-item">
                          <strong>ID:</strong> #{selectedImage.id}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="modal-footer">
                <div className="modal-navigation">
                  <Button
                    variant="outline-secondary"
                    onClick={onPrev}
                    disabled={
                      galleries.findIndex((g) => g.id === selectedImage.id) ===
                      0
                    }
                  >
                    <i className="fas fa-chevron-left me-2" />
                    Previous
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={onNext}
                    disabled={
                      galleries.findIndex((g) => g.id === selectedImage.id) ===
                      galleries.length - 1
                    }
                  >
                    Next
                    <i className="fas fa-chevron-right ms-2" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
);

const Gallery = () => {
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("newest");
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [selectedYear, setSelectedYear] = useState("all");
  const [imageLoading, setImageLoading] = useState({});
  const [showImageDetails, setShowImageDetails] = useState(false);

  // Memoized computations
  const availableYears = useMemo(() => {
    const years = galleries.map((gallery) =>
      new Date(gallery.created_at).getFullYear()
    );
    return [...new Set(years)].sort((a, b) => b - a);
  }, [galleries]);

  const filteredAndSortedGalleries = useMemo(() => {
    let filtered = galleries.filter((gallery) => {
      const matchesSearch = gallery.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesYear =
        selectedYear === "all" ||
        new Date(gallery.created_at).getFullYear().toString() === selectedYear;
      return matchesSearch && matchesYear;
    });

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
  }, [galleries, searchTerm, sortBy, selectedYear]);

  const currentGalleries = useMemo(() => {
    const startIndex = (currentPage - 1) * GALLERIES_PER_PAGE;
    return filteredAndSortedGalleries.slice(
      startIndex,
      startIndex + GALLERIES_PER_PAGE
    );
  }, [filteredAndSortedGalleries, currentPage]);

  const totalPages = Math.ceil(
    filteredAndSortedGalleries.length / GALLERIES_PER_PAGE
  );

  // Memoized callbacks
  const handlePageChange = useCallback((pageNumber) => {
    setCurrentPage(pageNumber);
    document
      .getElementById("gallery-section")
      ?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleOpenImage = useCallback((gallery) => {
    setSelectedImage(gallery);
    setShowModal(true);
  }, []);

  const handleImageLoad = useCallback((galleryId) => {
    setImageLoading((prev) => ({
      ...prev,
      [galleryId]: false,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedYear("all");
    setCurrentPage(1);
  }, []);

  const handleModalNavigation = useCallback(
    (direction) => {
      const currentIndex = galleries.findIndex(
        (g) => g.id === selectedImage.id
      );
      const nextIndex =
        direction === "next" ? currentIndex + 1 : currentIndex - 1;
      const nextImage = galleries[nextIndex];
      if (nextImage) setSelectedImage(nextImage);
    },
    [galleries, selectedImage]
  );

  const handleRetry = useCallback(() => {
    window.location.reload();
  }, []);

  // Fetch galleries
  useEffect(() => {
    const fetchGalleries = async () => {
      try {
        setLoading(true);
        const { success, galleries, message } = await listGalleries();

        if (success) {
          setGalleries(galleries);
          const loadingState = {};
          galleries.forEach((gallery) => {
            loadingState[gallery.id] = true;
          });
          setImageLoading(loadingState);
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

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorMessage error={error} onRetry={handleRetry} />;
  }

  return (
    <div className="modern-gallery">
      <HeroSection galleries={galleries} availableYears={availableYears} />

      <Container fluid className="gallery-content-section" id="gallery-section">
        <Container>
          <FiltersSection
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedYear={selectedYear}
            setSelectedYear={setSelectedYear}
            sortBy={sortBy}
            setSortBy={setSortBy}
            viewMode={viewMode}
            setViewMode={setViewMode}
            availableYears={availableYears}
            filteredCount={filteredAndSortedGalleries.length}
            setCurrentPage={setCurrentPage}
            clearFilters={clearFilters}
          />

          <AnimatePresence mode="wait">
            {currentGalleries.length > 0 ? (
              <motion.div
                key={`${viewMode}-${currentPage}`}
                variants={animations.staggerContainer}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className={`gallery-grid ${viewMode}`}
              >
                <Row className="g-4">
                  {currentGalleries.map((gallery, index) => (
                    <GalleryCard
                      key={gallery.id}
                      gallery={gallery}
                      index={index}
                      currentPage={currentPage}
                      viewMode={viewMode}
                      imageLoading={imageLoading}
                      onImageLoad={handleImageLoad}
                      onOpenImage={handleOpenImage}
                    />
                  ))}
                </Row>
              </motion.div>
            ) : (
              <NoResults onReset={clearFilters} />
            )}
          </AnimatePresence>

          {filteredAndSortedGalleries.length > 0 && totalPages > 1 && (
            <CustomPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              totalItems={filteredAndSortedGalleries.length}
              itemsPerPage={GALLERIES_PER_PAGE}
            />
          )}
        </Container>
      </Container>

      <ImageModal
        show={showModal}
        selectedImage={selectedImage}
        onClose={() => setShowModal(false)}
        onNext={() => handleModalNavigation("next")}
        onPrev={() => handleModalNavigation("prev")}
        galleries={galleries}
        showImageDetails={showImageDetails}
        toggleImageDetails={() => setShowImageDetails(!showImageDetails)}
      />

      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap");

        .modern-gallery {
          font-family: "Inter", sans-serif;
          overflow-x: hidden;
        }

        .loading-screen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: ${theme.gradients.hero};
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }

        .loading-content {
          text-align: center;
          color: white;
        }

        .loading-gif {
          display: block;
          max-width: 30vw;
          max-height: 30vh;
          width: auto;
          height: auto;
          margin: 0 auto 1rem;
        }

        .hero-section {
          position: relative;
          overflow: hidden;
        }

        .hero-background {
          background: ${theme.gradients.hero},
            url(${aboutImg}) no-repeat center center;
          background-size: cover;
          min-height: 50vh;
          position: relative;
        }

        .particles-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        .particle {
          position: absolute;
          border-radius: 50%;
        }

        .particle-0 {
          width: 4px;
          height: 4px;
          background: rgba(255, 255, 255, 0.6);
          top: 20%;
          left: 10%;
        }
        .particle-1 {
          width: 6px;
          height: 6px;
          background: rgba(233, 163, 25, 0.5);
          top: 40%;
          left: 80%;
        }
        .particle-2 {
          width: 3px;
          height: 3px;
          background: rgba(255, 255, 255, 0.4);
          top: 70%;
          left: 30%;
        }
        .particle-3 {
          width: 5px;
          height: 5px;
          background: rgba(61, 144, 215, 0.5);
          top: 60%;
          left: 70%;
        }

        .hero-content {
          position: relative;
          z-index: 10;
          color: white;
          padding: 6rem 0;
        }

        .hero-badge {
          display: inline-block;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          padding: 8px 20px;
          border-radius: 25px;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 1.5rem;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .hero-title {
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 1.5rem;
        }

        .gradient-text {
          background: ${theme.gradients.primary};
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .title-divider {
          width: 80px;
          height: 4px;
          background: ${theme.gradients.primary};
          margin-bottom: 1.5rem;
          border-radius: 2px;
        }

        .hero-description {
          font-size: 1.2rem;
          line-height: 1.7;
          margin-bottom: 2rem;
          max-width: 600px;
          opacity: 0.95;
        }

        .hero-stats {
          display: flex;
          gap: 2rem;
          margin-top: 2rem;
        }

        .stat-item {
          background: rgba(255, 255, 255, 0.15);
          padding: 1rem 1.5rem;
          border-radius: 15px;
          text-align: center;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .stat-item:hover {
          background: rgba(255, 255, 255, 0.25);
        }

        .stat-number {
          display: block;
          font-size: 1.8rem;
          font-weight: 700;
          color: ${theme.primary};
        }

        .stat-label {
          font-size: 0.9rem;
          opacity: 0.9;
        }

        .hero-visual {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .hero-icon-container {
          position: relative;
          width: 200px;
          height: 200px;
        }

        .hero-icon-circle {
          width: 180px;
          height: 180px;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          position: relative;
          overflow: hidden;
        }

        .hero-icon-circle i {
          font-size: 4rem;
          color: white;
          z-index: 2;
        }

        .icon-glow {
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(
            circle,
            rgba(233, 163, 25, 0.3) 0%,
            transparent 70%
          );
          animation: rotate 8s linear infinite;
        }

        @keyframes rotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .floating-element {
          position: absolute;
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.2rem;
          backdrop-filter: blur(10px);
        }

        .element-1 {
          top: 20%;
          right: 10%;
        }
        .element-2 {
          bottom: 20%;
          left: 10%;
        }

        .gallery-content-section {
          padding: 80px 0;
          background: ${theme.light};
        }

        .filters-container {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          margin-bottom: 3rem;
          box-shadow: ${theme.shadows.card};
        }

        .filters-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .filters-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: ${theme.dark};
          margin: 0;
        }

        .view-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .view-mode-toggle {
          display: flex;
          gap: 0.5rem;
        }

        .search-container {
          position: relative;
        }

        .search-input-group {
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .search-input-group .input-group-text {
          background: white;
          border: 1px solid #e2e8f0;
          color: ${theme.primary};
        }

        .search-input-group .form-control {
          border: 1px solid #e2e8f0;
          padding: 0.75rem;
        }

        .search-input-group .form-control:focus {
          border-color: ${theme.primary};
          box-shadow: 0 0 0 0.2rem rgba(233, 163, 25, 0.25);
        }

        .filter-select {
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          padding: 0.75rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .filter-select:focus {
          border-color: ${theme.primary};
          box-shadow: 0 0 0 0.2rem rgba(233, 163, 25, 0.25);
        }

        .results-info {
          display: flex;
          align-items: center;
          height: 100%;
        }

        .results-badge {
          background: ${theme.primary};
          font-size: 0.9rem;
          padding: 0.5rem 1rem;
          border-radius: 20px;
        }

        .active-filters {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e2e8f0;
          flex-wrap: wrap;
        }

        .filters-label {
          font-weight: 500;
          color: #718096;
          font-size: 0.9rem;
        }

        .filter-badge {
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .filter-badge:hover {
          transform: scale(1.05);
        }

        .clear-filters-btn {
          color: ${theme.primary};
          text-decoration: none;
          font-size: 0.9rem;
          padding: 0;
        }

        .clear-filters-btn:hover {
          color: ${theme.primary};
          text-decoration: underline;
        }

        .gallery-grid {
          min-height: 400px;
        }

        .gallery-card {
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          height: 100%;
        }

        .image-container {
          position: relative;
          border-radius: 20px;
          overflow: hidden;
          background: #f8f9fa;
          height: 280px;
          box-shadow: ${theme.shadows.card};
        }

        .gallery-card:hover .image-container {
          box-shadow: ${theme.shadows.hover};
        }

        .gallery-grid.masonry .image-container {
          height: ${() => 200 + Math.floor(Math.random() * 150)}px;
        }

        .image-skeleton {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            #f0f0f0 25%,
            #e0e0e0 50%,
            #f0f0f0 75%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        .gallery-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .gallery-card:hover .gallery-image {
          transform: scale(1.1);
        }

        .image-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: ${theme.gradients.overlay};
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 1.5rem;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .gallery-card:hover .image-overlay {
          opacity: 1;
        }

        .overlay-actions {
          display: flex;
          justify-content: flex-end;
        }

        .action-btn {
          background: rgba(255, 255, 255, 0.9);
          border: none;
          color: ${theme.dark};
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .action-btn:hover {
          background: white;
          transform: scale(1.1);
        }

        .overlay-info {
          color: white;
          text-align: center;
        }

        .image-title {
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: white;
        }

        .image-date {
          opacity: 0.9;
        }

        .image-number {
          position: absolute;
          top: 1rem;
          left: 1rem;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 15px;
          font-size: 0.8rem;
          font-weight: 600;
          backdrop-filter: blur(10px);
        }

        .no-results {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
        }

        .no-results-content {
          text-align: center;
          color: #718096;
        }

        .no-results-content i {
          margin-bottom: 1.5rem;
          color: #cbd5e0;
        }

        .no-results-content h4 {
          color: ${theme.dark};
          margin-bottom: 1rem;
        }

        .pagination-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 3rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .pagination-info {
          color: #718096;
          font-weight: 500;
        }

        .custom-pagination .page-link {
          color: ${theme.primary};
          border: 1px solid #e2e8f0;
          padding: 0.75rem 1rem;
          margin: 0 2px;
          border-radius: 8px;
        }

        .custom-pagination .page-item.active .page-link {
          background: ${theme.primary};
          border-color: ${theme.primary};
          color: white;
        }

        .custom-pagination .page-link:hover {
          background: rgba(233, 163, 25, 0.1);
          border-color: ${theme.primary};
        }

        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 2rem;
        }

        .modal-container {
          width: 100%;
          max-width: 1000px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-card {
          background: white;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
        }

        .modal-header {
          background: ${theme.gradients.primary};
          color: white;
          padding: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .modal-header-content {
          flex: 1;
        }

        .modal-title {
          font-size: 1.8rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          line-height: 1.3;
        }

        .modal-meta {
          opacity: 0.9;
          font-size: 0.9rem;
        }

        .modal-actions {
          display: flex;
          gap: 0.5rem;
          margin-left: 1rem;
        }

        .modal-action-btn {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          backdrop-filter: blur(10px);
          transition: all 0.3s ease;
        }

        .modal-action-btn:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .modal-body {
          padding: 0;
        }

        .modal-image-container {
          text-align: center;
          background: #f8f9fa;
        }

        .modal-image {
          max-width: 100%;
          max-height: 70vh;
          object-fit: contain;
        }

        .image-details {
          background: ${theme.light};
          overflow: hidden;
        }

        .details-content {
          padding: 1.5rem 2rem;
        }

        .detail-item {
          margin-bottom: 1rem;
          font-size: 0.95rem;
        }

        .detail-item strong {
          color: ${theme.dark};
          margin-right: 0.5rem;
        }

        .modal-footer {
          padding: 1.5rem 2rem;
          border-top: 1px solid #e2e8f0;
          background: white;
        }

        .modal-navigation {
          display: flex;
          justify-content: space-between;
        }

        .error-container {
          text-align: center;
          padding: 3rem;
          background: white;
          border-radius: 20px;
          box-shadow: ${theme.shadows.card};
          max-width: 500px;
          margin: 0 auto;
        }

        .error-icon {
          font-size: 4rem;
          color: #e53e3e;
          margin-bottom: 1.5rem;
        }

        .error-container h3 {
          color: ${theme.dark};
          margin-bottom: 1rem;
        }

        .error-container p {
          color: #718096;
          margin-bottom: 2rem;
        }

        @media (max-width: 992px) {
          .hero-stats {
            flex-wrap: wrap;
            justify-content: center;
          }

          .stat-item {
            min-width: 120px;
          }

          .filters-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .pagination-container {
            flex-direction: column;
            text-align: center;
          }

          .modal-actions {
            margin-left: 0;
            margin-top: 1rem;
          }

          .modal-header {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        @media (max-width: 768px) {
          .hero-content {
            padding: 4rem 0;
            text-align: center;
          }

          .hero-title {
            font-size: 2.5rem;
          }

          .hero-stats {
            gap: 1rem;
            justify-content: center;
          }

          .stat-item {
            padding: 0.75rem 1rem;
            min-width: 100px;
          }

          .stat-number {
            font-size: 1.5rem;
          }

          .stat-label {
            font-size: 0.8rem;
          }

          .gallery-content-section {
            padding: 60px 0;
          }

          .filters-container {
            padding: 1.5rem;
            margin-bottom: 2rem;
          }

          .filters-title {
            font-size: 1.2rem;
          }

          .active-filters {
            flex-direction: column;
            align-items: flex-start;
          }

          .image-container {
            height: 220px;
          }

          .gallery-grid.masonry .image-container {
            height: 220px;
          }

          .modal-backdrop {
            padding: 1rem;
          }

          .modal-header {
            padding: 1.5rem;
          }

          .modal-title {
            font-size: 1.5rem;
          }

          .modal-navigation {
            flex-direction: column;
            gap: 1rem;
          }
        }

        @media (max-width: 576px) {
          .hero-content {
            padding: 3rem 0;
          }

          .filters-row .col-lg-4,
          .filters-row .col-lg-3,
          .filters-row .col-lg-2,
          .filters-row .col-md-6 {
            margin-bottom: 1rem;
          }

          .gallery-card {
            margin-bottom: 2rem;
          }

          .image-container {
            height: 200px;
          }

          .overlay-info {
            text-align: left;
          }

          .image-title {
            font-size: 0.9rem;
          }

          .image-date {
            font-size: 0.8rem;
          }

          .modal-container {
            margin: 1rem 0;
          }

          .custom-pagination {
            justify-content: center;
            flex-wrap: wrap;
          }
        }

        .modal-container::-webkit-scrollbar {
          width: 6px;
        }

        .modal-container::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }

        .modal-container::-webkit-scrollbar-thumb {
          background: ${theme.primary};
          border-radius: 3px;
        }

        .modal-container::-webkit-scrollbar-thumb:hover {
          background: #d49617;
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }

          .hero-icon-circle {
            animation: none;
          }

          .particle {
            animation: none;
          }

          .icon-glow {
            animation: none;
          }
        }

        @media print {
          .modern-gallery {
            color: black;
          }

          .hero-section,
          .filters-container,
          .pagination-container {
            display: none;
          }

          .gallery-card {
            break-inside: avoid;
            box-shadow: none;
            border: 1px solid #ddd;
            margin-bottom: 2rem;
          }

          .modal-backdrop {
            position: static;
            background: white;
          }

          .modal-card {
            box-shadow: none;
          }
        }
      `}</style>
    </div>
  );
};

export default Gallery;
