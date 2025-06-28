import React, { useState, useEffect, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  InputGroup,
  Badge,
  Spinner,
  Modal,
  Pagination,
} from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { getProductStocks } from "../../Modules/controllers/productStockController";

const Product = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProductType, setSelectedProductType] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const productsPerPage = 6;

  // Theme configuration (aligned with Order component)
  const theme = {
    primary: "#E9A319",
    secondary: "#3D8D7A",
    accent: "#F15A29",
    light: "#F8F9FA",
    dark: "#212529",
    gradients: {
      primary: "linear-gradient(135deg, #E9A319 0%, #F4B942 100%)",
      secondary: "linear-gradient(135deg, #3D8D7A 0%, #4AA391 100%)",
      hero: "linear-gradient(135deg, rgba(61, 141, 122, 0.93), rgba(61, 141, 122, 0.7))",
      card: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
    },
    shadows: {
      card: "0 10px 40px rgba(0, 0, 0, 0.1)",
      hover: "0 20px 60px rgba(0, 0, 0, 0.15)",
      glow: "0 0 30px rgba(233, 163, 25, 0.3)",
    },
  };

  // Animation variants (aligned with Order component)
  const animations = {
    fadeInUp: {
      hidden: { opacity: 0, y: 40 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
      },
    },
    staggerContainer: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { staggerChildren: 0.15, delayChildren: 0.1 },
      },
    },
    scaleIn: {
      hidden: { opacity: 0, scale: 0.9 },
      visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.5, ease: "easeOut" },
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

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await getProductStocks();
        if (response.success) {
          const availableProducts = response.productStocks.filter(
            (product) => product.status === "available"
          );
          setProducts(availableProducts);
        } else {
          throw new Error(response.message || "Failed to fetch products");
        }
      } catch (err) {
        setError(err.message || "An unexpected error occurred");
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleOpenDetail = (productType) => {
    setSelectedProductType(productType);
    setShowDetailModal(true);
  };

  const groupedProducts = useMemo(() => {
    const grouped = {};
    products.forEach((product) => {
      const typeId = product.product_type;
      if (!grouped[typeId]) {
        grouped[typeId] = {
          product_type_detail: product.product_type_detail,
          quantity: 0,
          items: [],
        };
      }
      grouped[typeId].quantity += product.quantity;
      grouped[typeId].items.push(product);
    });
    return Object.values(grouped);
  }, [products]);

  const filteredAndSortedProducts = useMemo(() => {
    const filtered = groupedProducts.filter((group) =>
      group.product_type_detail.product_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );

    return filtered.sort((a, b) => {
      if (sortBy === "newest") {
        const aLatest = Math.max(
          ...a.items.map((item) => new Date(item.production_at))
        );
        const bLatest = Math.max(
          ...b.items.map((item) => new Date(item.production_at))
        );
        return bLatest - aLatest;
      } else if (sortBy === "oldest") {
        const aEarliest = Math.min(
          ...a.items.map((item) => new Date(item.production_at))
        );
        const bEarliest = Math.min(
          ...b.items.map((item) => new Date(item.production_at))
        );
        return aEarliest - bEarliest;
      } else if (sortBy === "alphabetical") {
        return a.product_type_detail.product_name.localeCompare(
          b.product_type_detail.product_name
        );
      } else if (sortBy === "price") {
        return (
          parseFloat(a.product_type_detail.price) -
          parseFloat(b.product_type_detail.price)
        );
      }
      return 0;
    });
  }, [groupedProducts, searchTerm, sortBy]);

  const currentProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * productsPerPage;
    return filteredAndSortedProducts.slice(
      startIndex,
      startIndex + productsPerPage
    );
  }, [filteredAndSortedProducts, currentPage]);

  const totalPages = Math.ceil(
    filteredAndSortedProducts.length / productsPerPage
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    document
      .getElementById("product-section")
      .scrollIntoView({ behavior: "smooth" });
  };

  const truncateText = (text, maxLength) => {
    if (!text) return "";
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(parseFloat(price));
  };

  // Safely load the loading GIF with a fallback
  let loadingGif;
  try {
    loadingGif = require("../../assets/loading.gif");
  } catch (e) {
    console.warn("Loading GIF not found, using fallback");
    loadingGif = "https://via.placeholder.com/100?text=Loading";
  }

  if (loading) {
    return (
      <div
        className="loading-screen"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "#ffffff",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="loading-content"
        >
          <img
            src={loadingGif}
            style={{
              display: "block",
              maxWidth: "30vw",
              maxHeight: "30vh",
              width: "auto",
              height: "auto",
              margin: "0 auto 1rem",
            }}
          />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="loading-text"
          ></motion.p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <Container className="py-5 text-center" style={{ minHeight: "70vh" }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="error-container"
        >
          <div className="error-icon">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h3>Oops! Something went wrong</h3>
          <p>{error}</p>
          <Button variant="warning" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </motion.div>
      </Container>
    );
  }

  return (
    <div className="modern-products">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="particles-container">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className={`particle particle-${i % 3}`}
                animate={{
                  y: [0, -100, 0],
                  x: [0, Math.random() * 30 - 15, 0],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
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
                    <i className="fas fa-cheese me-2"></i>
                    Quality Products
                  </div>
                  <h1 className="hero-title">
                    Produk <span className="gradient-text">Premium</span>
                  </h1>
                  <div className="title-divider"></div>
                  <p className="hero-description">
                    Temukan berbagai produk olahan susu dan pangan sehat
                    berkualitas dari Dairy~Track. Diproses dengan standar tinggi
                    untuk kesehatan dan kepuasan Anda.
                  </p>
                  <div className="hero-stats">
                    <motion.div
                      className="stat-item"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="stat-number">
                        {groupedProducts.length}
                      </div>
                      <div className="stat-label">Products</div>
                    </motion.div>
                    <motion.div
                      className="stat-item"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="stat-number">
                        {products.reduce((sum, p) => sum + p.quantity, 0)}
                      </div>
                      <div className="stat-label">Stock</div>
                    </motion.div>
                    <motion.div
                      className="stat-item"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="stat-number">24/7</div>
                      <div className="stat-label">Service</div>
                    </motion.div>
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
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    >
                      <div className="icon-glow"></div>
                      <i className="fas fa-shopping-cart"></i>
                    </motion.div>
                    <motion.div
                      className="floating-element element-1"
                      animate={{ y: [0, -20, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <i className="fas fa-cheese"></i>
                    </motion.div>
                    <motion.div
                      className="floating-element element-2"
                      animate={{ y: [0, 20, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                    >
                      <i className="fas fa-leaf"></i>
                    </motion.div>
                  </div>
                </motion.div>
              </Col>
            </Row>
          </Container>
        </div>
      </section>

      {/* Product Content */}
      <Container fluid className="product-content-section" id="product-section">
        <Container>
          <Row>
            <Col lg={9}>
              <motion.div
                initial="hidden"
                animate="visible"
                variants={animations.fadeInUp}
                className="filters-container"
              >
                <div className="filters-header">
                  <h3 className="filters-title">
                    <i className="fas fa-filter me-2"></i>
                    Find Your Perfect Product
                  </h3>
                  <div className="view-mode-toggle">
                    <Button
                      variant={
                        viewMode === "grid" ? "primary" : "outline-primary"
                      }
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className="me-2"
                    >
                      <i className="fas fa-th"></i>
                    </Button>
                    <Button
                      variant={
                        viewMode === "list" ? "primary" : "outline-primary"
                      }
                      size="sm"
                      onClick={() => setViewMode("list")}
                    >
                      <i className="fas fa-list"></i>
                    </Button>
                  </div>
                </div>

                <Row className="filters-row">
                  <Col lg={4} md={6} className="mb-3">
                    <InputGroup className="search-input-group">
                      <InputGroup.Text>
                        <i className="fas fa-search"></i>
                      </InputGroup.Text>
                      <Form.Control
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setCurrentPage(1);
                        }}
                      />
                    </InputGroup>
                  </Col>
                  <Col lg={4} md={6} className="mb-3">
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
                      <option value="price">Price (Low to High)</option>
                    </Form.Select>
                  </Col>
                </Row>

                <div className="results-summary">
                  <span className="results-text">
                    Showing{" "}
                    {Math.min(
                      productsPerPage,
                      filteredAndSortedProducts.length
                    )}{" "}
                    of {filteredAndSortedProducts.length} products
                  </span>
                  {searchTerm && (
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => {
                        setSearchTerm("");
                        setCurrentPage(1);
                      }}
                    >
                      <i className="fas fa-times me-1"></i>
                      Clear Search
                    </Button>
                  )}
                </div>
              </motion.div>

              <motion.div
                variants={animations.staggerContainer}
                initial="hidden"
                animate="visible"
                className={`product-posts-container ${viewMode}`}
              >
                <AnimatePresence mode="wait">
                  {currentProducts.length > 0 ? (
                    <Row className="g-4">
                      {currentProducts.map((group) => (
                        <Col
                          lg={viewMode === "grid" ? 6 : 12}
                          md={viewMode === "grid" ? 6 : 12}
                          key={group.product_type_detail.id}
                        >
                          <motion.div
                            variants={animations.scaleIn}
                            whileHover={{ y: -10 }}
                            transition={{ duration: 0.3 }}
                            className={`product-card ${viewMode}`}
                          >
                            <div className="product-card-inner">
                              <div className="product-image-container">
                                <img
                                  src={group.product_type_detail.image}
                                  alt={group.product_type_detail.product_name}
                                  className="product-image"
                                />
                                <div className="image-overlay">
                                  <Button
                                    variant="light"
                                    size="sm"
                                    className="read-btn"
                                    onClick={() => handleOpenDetail(group)}
                                  >
                                    <i className="fas fa-book-open me-2"></i>
                                    View Details
                                  </Button>
                                </div>
                              </div>
                              <div className="product-content">
                                <div className="product-meta">
                                  <div className="categories">
                                    <Badge
                                      className="category-badge"
                                      style={{ backgroundColor: theme.primary }}
                                    >
                                      Available
                                    </Badge>
                                    <Badge
                                      className="category-badge"
                                      style={{
                                        backgroundColor: theme.secondary,
                                      }}
                                    >
                                      {group.quantity}{" "}
                                      {group.product_type_detail.unit}
                                    </Badge>
                                  </div>
                                  <div className="product-date">
                                    <i className="far fa-calendar-alt me-1"></i>
                                    {format(
                                      new Date(
                                        Math.max(
                                          ...group.items.map(
                                            (item) =>
                                              new Date(item.production_at)
                                          )
                                        )
                                      ),
                                      "MMM d, yyyy"
                                    )}
                                  </div>
                                </div>
                                <h4 className="product-title">
                                  {group.product_type_detail.product_name}
                                </h4>
                                <p className="product-excerpt">
                                  {truncateText(
                                    group.product_type_detail
                                      .product_description,
                                    viewMode === "list" ? 200 : 120
                                  )}
                                </p>
                                <div className="product-footer">
                                  <strong className="product-price">
                                    {formatPrice(
                                      group.product_type_detail.price
                                    )}
                                  </strong>
                                  <div className="product-actions">
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      className="read-more-btn"
                                      onClick={() => handleOpenDetail(group)}
                                    >
                                      View Details
                                      <i className="fas fa-arrow-right ms-2"></i>
                                    </motion.button>
                                    <Link
                                      to={`/orders`}
                                      className="action-btn-large"
                                      style={{
                                        backgroundColor: theme.primary,
                                        color: "white",
                                      }}
                                    >
                                      Order Now
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        </Col>
                      ))}
                    </Row>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="no-results"
                    >
                      <div className="no-results-content">
                        <i className="fas fa-search fa-3x"></i>
                        <h4>No products found</h4>
                        <p>Try adjusting your search terms</p>
                        <Button
                          variant="primary"
                          onClick={() => {
                            setSearchTerm("");
                            setCurrentPage(1);
                          }}
                        >
                          <i className="fas fa-refresh me-2"></i>
                          Reset Search
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {filteredAndSortedProducts.length > 0 && totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="pagination-container"
                >
                  <div className="pagination-info">
                    Page {currentPage} of {totalPages}
                  </div>
                  <Pagination className="custom-pagination">
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
                      }
                      return null;
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
                </motion.div>
              )}
            </Col>

            <Col lg={3}>
              <div className="sidebar-sticky">
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={animations.slideInRight}
                  className="sidebar-card featured-card"
                >
                  <div className="card-header">
                    <h5>
                      <i className="fas fa-star me-2"></i>Featured Products
                    </h5>
                  </div>
                  <div className="card-body">
                    {groupedProducts.slice(0, 3).map((group, index) => (
                      <motion.div
                        key={group.product_type_detail.id}
                        className="featured-item"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                      >
                        <h6 className="featured-title">
                          {group.product_type_detail.product_name}
                        </h6>
                        <p className="featured-description">
                          {truncateText(
                            group.product_type_detail.product_description,
                            60
                          )}
                        </p>
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => handleOpenDetail(group)}
                          className="featured-link"
                        >
                          View Details{" "}
                          <i className="fas fa-arrow-right ms-1"></i>
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={animations.slideInRight}
                  transition={{ delay: 0.4 }}
                  className="sidebar-card recent-card"
                >
                  <div className="card-header">
                    <h5>
                      <i className="fas fa-clock me-2"></i>New Arrivals
                    </h5>
                  </div>
                  <div className="card-body">
                    {groupedProducts.slice(0, 4).map((group, index) => (
                      <motion.div
                        key={group.product_type_detail.id}
                        className="recent-item"
                        onClick={() => handleOpenDetail(group)}
                        whileHover={{ scale: 1.02 }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                      >
                        <div className="recent-image">
                          <img
                            src={group.product_type_detail.image}
                            alt={group.product_type_detail.product_name}
                          />
                        </div>
                        <div className="recent-content">
                          <h6 className="recent-title">
                            {truncateText(
                              group.product_type_detail.product_name,
                              35
                            )}
                          </h6>
                          <small className="recent-date">
                            {format(
                              new Date(
                                Math.max(
                                  ...group.items.map(
                                    (item) => new Date(item.production_at)
                                  )
                                )
                              ),
                              "MMM d, yyyy"
                            )}
                          </small>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </Col>
          </Row>
        </Container>
      </Container>

      <AnimatePresence>
        {showDetailModal && selectedProductType && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="product-modal-backdrop"
            onClick={() => setShowDetailModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 50 }}
              transition={{ duration: 0.3 }}
              className="product-modal-container"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-card">
                <div className="modal-header">
                  <div className="modal-header-content">
                    <h3 className="modal-title">
                      {selectedProductType.product_type_detail.product_name}
                    </h3>
                    <div className="modal-meta">
                      <span className="modal-date">
                        <i className="far fa-calendar-alt me-1"></i>
                        Latest:{" "}
                        {format(
                          new Date(
                            Math.max(
                              ...selectedProductType.items.map(
                                (item) => new Date(item.production_at)
                              )
                            )
                          ),
                          "MMMM d, yyyy"
                        )}
                      </span>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    className="modal-close"
                    onClick={() => setShowDetailModal(false)}
                  >
                    <i className="fas fa-times"></i>
                  </motion.button>
                </div>
                <div className="modal-body">
                  <div className="modal-categories">
                    <Badge
                      className="modal-category-badge"
                      style={{ backgroundColor: theme.primary }}
                    >
                      Available
                    </Badge>
                    <Badge
                      className="modal-category-badge"
                      style={{ backgroundColor: theme.secondary }}
                    >
                      {selectedProductType.quantity}{" "}
                      {selectedProductType.product_type_detail.unit}
                    </Badge>
                  </div>
                  <div className="modal-image-container">
                    <img
                      src={selectedProductType.product_type_detail.image}
                      alt={selectedProductType.product_type_detail.product_name}
                      className="modal-image"
                    />
                  </div>
                  <div className="modal-content">
                    <p>
                      <strong>Price:</strong>{" "}
                      {formatPrice(
                        selectedProductType.product_type_detail.price
                      )}
                    </p>
                    <p>
                      <strong>Description:</strong>{" "}
                      {
                        selectedProductType.product_type_detail
                          .product_description
                      }
                    </p>
                    <h5>Stock Details</h5>
                    <ul>
                      {selectedProductType.items
                        .sort(
                          (a, b) =>
                            new Date(a.production_at) -
                            new Date(b.production_at)
                        )
                        .map((item) => (
                          <li key={item.id}>
                            <strong>Quantity:</strong> {item.quantity}{" "}
                            {selectedProductType.product_type_detail.unit}
                            <br />
                            <strong>Production:</strong>{" "}
                            {format(
                              new Date(item.production_at),
                              "MMMM d, yyyy"
                            )}
                            <br />
                            <strong>Expiry:</strong>{" "}
                            {format(new Date(item.expiry_at), "MMMM d, yyyy")}
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
                <div className="modal-footer">
                  <div className="modal-actions">
                    <Button
                      variant="outline-primary"
                      className="action-btn-large"
                      onClick={() => setShowDetailModal(false)}
                    >
                      Back to Products
                    </Button>
                    <Link
                      to={`/orders`}
                      className="action-btn-large"
                      style={{ backgroundColor: theme.primary, color: "white" }}
                    >
                      Order Now
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap");

        .modern-products {
          font-family: "Inter", sans-serif;
          overflow-x: hidden;
          padding-top: 70px; /* Adjusted for potential fixed header */
        }

        /* Loading Screen */
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

        .loading-text {
          font-size: 1.25rem;
          font-weight: 600;
          opacity: 0.95;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        /* Hero Section */
        .hero-section {
          position: relative;
          overflow: hidden;
        }

        .hero-background {
          background: ${theme.gradients.hero},
            url(${require("../../assets/about.png")}) no-repeat center center;
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
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
        }

        .particle-0 {
          width: 4px;
          height: 4px;
          top: 20%;
          left: 10%;
        }
        .particle-1 {
          width: 6px;
          height: 6px;
          top: 40%;
          left: 80%;
        }
        .particle-2 {
          width: 3px;
          height: 3px;
          top: 70%;
          left: 30%;
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

        /* Product Content Section */
        .product-content-section {
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

        .view-mode-toggle {
          display: flex;
          gap: 0.5rem;
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

        .results-summary {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 1px solid #e2e8f0;
        }

        .results-text {
          color: #718096;
          font-weight: 500;
        }

        /* Product Cards */
        .product-posts-container {
          min-height: 400px;
        }

        .product-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: ${theme.shadows.card};
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          height: 100%;
        }

        .product-card:hover {
          box-shadow: ${theme.shadows.hover};
        }

        .product-card.list .product-card-inner {
          display: flex;
          align-items: stretch;
        }

        .product-card.list .product-image-container {
          width: 300px;
          flex-shrink: 0;
        }

        .product-card.list .product-content {
          flex: 1;
          padding: 2rem;
        }

        .product-card-inner {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .product-image-container {
          position: relative;
          height: 250px;
          overflow: hidden;
        }

        .product-card.list .product-image-container {
          height: auto;
        }

        .product-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .product-card:hover .product-image {
          transform: scale(1.1);
        }

        .image-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .product-card:hover .image-overlay {
          opacity: 1;
        }

        .read-btn {
          background: white;
          color: ${theme.dark};
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 25px;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .product-content {
          padding: 2rem;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .product-meta {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .categories {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .category-badge {
          font-size: 0.8rem;
          font-weight: 600;
          padding: 0.4rem 0.8rem;
          border-radius: 15px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .category-badge:hover {
          transform: scale(1.05);
        }

        .product-date {
          color: #718096;
          font-size: 0.9rem;
          white-space: nowrap;
        }

        .product-title {
          font-size: 1.3rem;
          font-weight: 700;
          color: ${theme.dark};
          margin-bottom: 1rem;
          line-height: 1.4;
          flex-shrink: 0;
        }

        .product-excerpt {
          color: #718096;
          line-height: 1.6;
          margin-bottom: 1.5rem;
          flex: 1;
        }

        .product-price {
          color: ${theme.primary};
          font-weight: 600;
          font-size: 1.2rem;
        }

        .product-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .product-actions {
          display: flex;
          gap: 0.5rem;
        }

        .read-more-btn {
          background: ${theme.gradients.primary};
          border: none;
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 25px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
        }

        .read-more-btn:hover {
          box-shadow: ${theme.shadows.glow};
        }

        .action-btn-large {
          border: 2px solid ${theme.primary};
          color: ${theme.primary};
          padding: 0.75rem 1.5rem;
          border-radius: 25px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          text-decoration: none;
        }

        .action-btn-large:hover {
          background: ${theme.primary};
          color: white;
        }

        /* No Results */
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

        /* Pagination */
        .pagination-container {
          display: flex;
          justify-content: center;
          align-items: center;
          margin-top: 3rem;
          gap: 2rem;
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

        /* Sidebar */
        .sidebar-sticky {
          position: sticky;
          top: 100px;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .sidebar-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: ${theme.shadows.card};
        }

        .sidebar-card .card-header {
          background: ${theme.gradients.secondary};
          color: white;
          padding: 1.5rem;
          border: none;
        }

        .sidebar-card .card-body {
          padding: 0;
        }

        /* Featured Products */
        .featured-item {
          padding: 1.5rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .featured-item:last-child {
          border-bottom: none;
        }

        .featured-title {
          color: ${theme.primary};
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .featured-description {
          color: #718096;
          font-size: 0.9rem;
          line-height: 1.5;
          margin-bottom: 1rem;
        }

        .featured-link {
          color: ${theme.primary};
          text-decoration: none;
          font-weight: 500;
          font-size: 0.9rem;
          padding: 0;
        }

        .featured-link:hover {
          color: ${theme.primary};
          text-decoration: none;
        }

        /* Recent Products */
        .recent-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          border-bottom: 1px solid #e2e8f0;
        }

        .recent-item:last-child {
          border-bottom: none;
        }

        .recent-item:hover {
          background: ${theme.light};
        }

        .recent-image {
          width: 60px;
          height: 60px;
          border-radius: 8px;
          overflow: hidden;
          flex-shrink: 0;
        }

        .recent-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .recent-content {
          flex: 1;
        }

        .recent-title {
          font-size: 0.95rem;
          font-weight: 600;
          color: ${theme.dark};
          margin-bottom: 0.25rem;
          line-height: 1.3;
        }

        .recent-date {
          color: #718096;
          font-size: 0.8rem;
        }

        /* Modal Styles */
        .product-modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1500; /* Below assumed login modal z-index (2000) */
          padding: 2rem;
        }

        .product-modal-container {
          width: 100%;
          max-width: 900px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-card {
          background: white;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
        }

        .modal-header {
          background: ${theme.gradients.primary};
          color: white;
          padding: 2rem;
          position: relative;
          overflow: hidden;
        }

        .modal-header::before {
          content: "";
          position: absolute;
          top: -50%;
          right: -20px;
          width: 100px;
          height: 100px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
        }

        .modal-header-content {
          position: relative;
          z-index: 2;
        }

        .modal-title {
          font-size: 1.8rem;
          font-weight: 700;
          margin-bottom: 1rem;
          line-height: 1.3;
        }

        .modal-meta {
          display: flex;
          gap: 2rem;
          font-size: 0.9rem;
          opacity: 0.9;
        }

        .modal-close {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
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
          z-index: 3;
        }

        .modal-body {
          padding: 2rem;
        }

        .modal-categories {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .modal-category-badge {
          font-size: 0.85rem;
          font-weight: 600;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          border: none;
        }

        .modal-image-container {
          text-align: center;
          margin-bottom: 2rem;
        }

        .modal-image {
          max-width: 100%;
          max-height: 400px;
          object-fit: contain;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .modal-content {
          font-size: 1.1rem;
          line-height: 1.8;
          color: #4a5568;
        }

        .modal-footer {
          padding: 1.5rem 2rem;
          border-top: 1px solid #e2e8f0;
          background: ${theme.light};
        }

        .modal-actions {
          display: flex;
          justify-content: center;
          gap: 1rem;
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
          .sidebar-sticky {
            position: static;
            margin-top: 3rem;
          }
        }

        @media (max-width: 992px) {
          .hero-stats {
            flex-wrap: wrap;
            justify-content: center;
          }

          .stat-item {
            min-width: 120px;
          }

          .product-card.list .product-card-inner {
            flex-direction: column;
          }

          .product-card.list .product-image-container {
            width: 100%;
            height: 250px;
          }

          .product-card.list .product-content {
            padding: 1.5rem;
          }

          .filters-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .results-summary {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .pagination-container {
            flex-direction: column;
            gap: 1rem;
          }
        }

        @media (max-width: 768px) {
          .hero-content {
            padding: 4rem 0;
          }

          .hero-title {
            font-size: 2.5rem;
          }

          .hero-stats {
            gap: 1rem;
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

          .product-content-section {
            padding: 60px 0;
          }

          .filters-container {
            padding: 1.5rem;
            margin-bottom: 2rem;
          }

          .filters-title {
            font-size: 1.2rem;
          }

          .product-meta {
            flex-direction: column;
            gap: 0.75rem;
          }

          .product-footer {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .product-actions {
            align-self: flex-end;
          }

          .product-modal-backdrop {
            padding: 1rem;
          }

          .modal-header {
            padding: 1.5rem;
          }

          .modal-body {
            padding: 1.5rem;
          }

          .modal-title {
            font-size: 1.5rem;
          }

          .modal-meta {
            flex-direction: column;
            gap: 0.5rem;
          }

          .modal-actions {
            flex-direction: column;
          }

          .action-btn-large {
            justify-content: center;
          }
        }

        @media (max-width: 576px) {
          .hero-content {
            padding: 3rem 0;
            text-align: center;
          }

          .hero-stats {
            justify-content: center;
          }

          .filters-row .col-lg-4,
          .filters-row .col-md-6 {
            margin-bottom: 1rem;
          }

          .product-card {
            margin-bottom: 2rem;
          }

          .product-content {
            padding: 1.5rem;
          }

          .product-title {
            font-size: 1.2rem;
          }

          .sidebar-card {
            margin-bottom: 2rem;
          }

          .recent-item {
            padding: 1rem;
          }

          .recent-image {
            width: 50px;
            height: 50px;
          }

          .product-modal-container {
            margin: 1rem 0;
          }

          .custom-pagination {
            justify-content: center;
            flex-wrap: wrap;
          }
        }

        /* Custom Scrollbar */
        .product-modal-container::-webkit-scrollbar {
          width: 6px;
        }

        .product-modal-container::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }

        .product-modal-container::-webkit-scrollbar-thumb {
          background: ${theme.primary};
          border-radius: 3px;
        }

        .product-modal-container::-webkit-scrollbar-thumb:hover {
          background: #d49617;
        }
      `}</style>
    </div>
  );
};

export default Product;
