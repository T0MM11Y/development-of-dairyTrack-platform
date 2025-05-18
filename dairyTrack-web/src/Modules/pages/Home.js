import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Spinner,
  Form,
  InputGroup,
} from "react-bootstrap";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { listBlogs } from "../../Modules/controllers/blogController";
import { listGalleries } from "../../Modules/controllers/galleryController.js";
import { getProductStocks } from "../../Modules/controllers/productStockController";
import { format } from "date-fns";

const Home = () => {
  // Define consistent styling variables - matching across all pages
  const primaryColor = "#E9A319"; // gold - matching Blog page
  const greyColor = "#3D8D7A"; // grey - matching other pages
  const accentColor = "#3D90D7"; // blue accent from Gallery

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const slideIn = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const getCategoryVariant = (categoryId) => {
    const categoryVariants = ["primary", "danger", "success", "info"];
    const index = categoryId % 4;
    return categoryVariants[index];
  };

  // State for featured content
  const [featuredBlogs, setFeaturedBlogs] = useState([]);
  const [featuredGalleries, setFeaturedGalleries] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch featured content
  useEffect(() => {
    const fetchFeaturedContent = async () => {
      try {
        setLoading(true);

        // Fetch blogs
        const blogsResponse = await listBlogs();
        if (blogsResponse.success) {
          // Get 3 most recent blogs
          setFeaturedBlogs(blogsResponse.blogs.slice(0, 3));
        }

        // Fetch galleries
        const galleriesResponse = await listGalleries();
        if (galleriesResponse.success) {
          // Get 4 most recent galleries
          setFeaturedGalleries(galleriesResponse.galleries.slice(0, 4));
        }

        // Fetch products
        const productsResponse = await getProductStocks();
        if (productsResponse.success) {
          // Create a map to group products by type
          const productMap = {};
          productsResponse.productStocks.forEach((product) => {
            if (product.status === "available" && product.product_type_detail) {
              if (!productMap[product.product_type]) {
                productMap[product.product_type] = {
                  ...product.product_type_detail,
                  quantity: 0,
                };
              }
              productMap[product.product_type].quantity += Number(
                product.quantity
              );
            }
          });

          // Get featured products (limited to 3)
          setFeaturedProducts(Object.values(productMap).slice(0, 3));
        }
      } catch (err) {
        setError("Failed to load featured content");
        console.error("Error fetching featured content:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedContent();
  }, []);

  // Format currency to Rupiah - consistent with Product page
  const formatRupiah = (value) => {
    if (!value) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(parseFloat(value));
  };

  // Strip HTML for blog previews - consistent with Blog page
  const stripHtml = (html) => {
    if (!html) return "";
    return html.replace(/<[^>]+>/g, "");
  };

  // Loading state - matching styling with other pages
  if (loading) {
    return (
      <Container className="py-5 text-center" style={{ minHeight: "70vh" }}>
        <Spinner animation="border" role="status" variant="warning">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading content...</p>
      </Container>
    );
  }

  // Error state - matching pattern with other pages
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
      {/* Hero Section with consistent styling */}
      <div className="hero-section">
        <div
          className="hero-image"
          style={{
            backgroundColor: "#8DD8FF",
            minHeight: "65vh",
            display: "flex",
            alignItems: "center",
            borderBottom: `5px solid ${primaryColor}`,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Rain animation layer */}
          <div className="rain-container">
            {Array.from({ length: 20 }).map((_, index) => (
              <div
                key={index}
                className="rain-drop"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDuration: `${0.7 + Math.random() * 0.3}s`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              ></div>
            ))}
          </div>

          <Container fluid className="px-3 px-md-4 px-lg-5">
            <Row className="align-items-center">
              <Col
                lg={{ span: 5, offset: 1 }}
                md={6}
                sm={12}
                className="z-2 position-relative ps-md-4 ps-lg-5 py-4 py-md-0"
              >
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={fadeIn}
                >
                  <h1
                    className="display-4 fw-bold text-white mb-3"
                    style={{
                      fontFamily: "Roboto, sans-serif",
                      letterSpacing: "2px",
                      fontSize: "clamp(32px, 5vw, 45px)",
                      fontWeight: "700",
                      textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
                    }}
                  >
                    Dairytrack
                  </h1>
                  <div
                    className="title-bar mb-4"
                    style={{
                      width: "80px",
                      height: "4px",
                      background: primaryColor,
                    }}
                  ></div>
                  <p
                    className="lead text-white mb-4"
                    style={{
                      fontSize: "clamp(16px, 2vw, 18px)",
                      maxWidth: "550px",
                      textShadow: "1px 1px 3px rgba(0,0,0,0.5)",
                    }}
                  >
                    <i className="fas fa-tractor me-2"></i>
                    Track, analyze, and optimize your dairy operations with our
                    comprehensive farm management system
                  </p>
                  <div className="d-flex flex-wrap gap-2">
                    <Button
                      variant="warning"
                      size="lg"
                      className="me-md-3 mb-2 mb-md-0"
                      as={Link}
                      to="/about"
                      style={{
                        backgroundColor: primaryColor,
                        borderColor: primaryColor,
                        color: "white",
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      <i className="fas fa-info-circle me-2"></i>Learn More
                    </Button>
                    <Button
                      variant="outline-light"
                      size="lg"
                      as={Link}
                      to="/order"
                      style={{
                        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      <i className="fas fa-shopping-cart me-2"></i>Order Now
                    </Button>
                  </div>
                </motion.div>
              </Col>
              <Col
                lg={6}
                md={6}
                sm={12}
                className="d-flex justify-content-center justify-content-md-end mt-3 mt-md-0"
              >
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="hero-image-container"
                >
                  <img
                    src={require("../../assets/cute_cow.png")}
                    alt="Dairy farm"
                    className="img-fluid hero-cow"
                    style={{
                      maxHeight: "55vh",
                      position: "relative",
                      zIndex: 2,
                      filter: "drop-shadow(5px 5px 10px rgba(0,0,0,0.3))",
                      transform: "scale(1.1)",
                      marginRight: "-5%",
                    }}
                  />
                </motion.div>
              </Col>
            </Row>
          </Container>
          <div
            className="overlay"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "linear-gradient(90deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.3) 100%)",
              zIndex: 1,
            }}
          ></div>
        </div>
      </div>

      {/* Add these styles to your existing style tag */}
      <style jsx>{`
        /* Rain animation styles */
        .rain-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 2;
          pointer-events: none;
          overflow: hidden;
        }

        .rain-drop {
          position: absolute;
          top: -20px;
          width: 2px;
          height: 20px;
          background-color: rgba(255, 255, 255, 0.5);
          border-radius: 0 0 5px 5px;
          animation: rain-fall linear infinite;
          opacity: 0.7;
          z-index: 2;
        }

        @keyframes rain-fall {
          0% {
            transform: translateY(-20px);
          }
          100% {
            transform: translateY(calc(65vh + 20px));
          }
        }

        /* Existing styles... */
        @import url("https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;700&display=swap");
        @import url("https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap");

        /* Hero section styles */
        .hero-section {
          position: relative;
        }

        .hero-image {
          background-size: contain;
          background-position: center;
          position: relative;
        }

        .hero-content {
          position: relative;
          z-index: 2;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
      `}</style>
      {/* Features Section */}
      <Container className="py-5">
        <Row className="mb-5">
          <Col className="text-center mb-5">
            <h6
              className="text-uppercase fw-bold"
              style={{
                color: greyColor,
                letterSpacing: "1.5px",
                fontSize: "1.5rem",
              }}
            >
              Why Choose Us
            </h6>

            <div
              className="mx-auto"
              style={{
                width: "80px",
                height: "4px",
                backgroundColor: greyColor,
                marginTop: "20px",
              }}
            ></div>
          </Col>
        </Row>

        <Row className="g-4 mb-5">
          <Col lg={3} md={6}>
            <motion.div
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="border-0 shadow-sm h-100 text-center feature-card rounded-4">
                <Card.Body className="p-4">
                  <div
                    className="icon-box mb-4 mx-auto"
                    style={{
                      backgroundColor: `${primaryColor}20`,
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <i
                      className="fas fa-chart-line fa-2x"
                      style={{ color: primaryColor }}
                    ></i>
                  </div>
                  <Card.Title className="mb-3 fw-bold">
                    Performance Tracking
                  </Card.Title>
                  <Card.Text className="text-muted">
                    Monitor your dairy farm's performance with real-time
                    analytics and insights.
                  </Card.Text>
                </Card.Body>
              </Card>
            </motion.div>
          </Col>

          <Col lg={3} md={6}>
            <motion.div
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="border-0 shadow-sm h-100 text-center feature-card rounded-4">
                <Card.Body className="p-4">
                  <div
                    className="icon-box mb-4 mx-auto"
                    style={{
                      backgroundColor: `${accentColor}20`,
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <i
                      className="fas fa-paw fa-2x"
                      style={{ color: accentColor }}
                    ></i>
                  </div>
                  <Card.Title className="mb-3 fw-bold">
                    Herd Management
                  </Card.Title>
                  <Card.Text className="text-muted">
                    Efficiently manage your herd with comprehensive tracking and
                    health monitoring.
                  </Card.Text>
                </Card.Body>
              </Card>
            </motion.div>
          </Col>

          <Col lg={3} md={6}>
            <motion.div
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="border-0 shadow-sm h-100 text-center feature-card rounded-4">
                <Card.Body className="p-4">
                  <div
                    className="icon-box mb-4 mx-auto"
                    style={{
                      backgroundColor: `${primaryColor}20`,
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <i
                      className="fas fa-tasks fa-2x"
                      style={{ color: primaryColor }}
                    ></i>
                  </div>
                  <Card.Title className="mb-3 fw-bold">
                    Production Planning
                  </Card.Title>
                  <Card.Text className="text-muted">
                    Optimize your dairy production with advanced planning and
                    forecasting tools.
                  </Card.Text>
                </Card.Body>
              </Card>
            </motion.div>
          </Col>

          <Col lg={3} md={6}>
            <motion.div
              whileHover={{ y: -10 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="border-0 shadow-sm h-100 text-center feature-card rounded-4">
                <Card.Body className="p-4">
                  <div
                    className="icon-box mb-4 mx-auto"
                    style={{
                      backgroundColor: `${accentColor}20`,
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <i
                      className="fas fa-mobile-alt fa-2x"
                      style={{ color: accentColor }}
                    ></i>
                  </div>
                  <Card.Title className="mb-3 fw-bold">
                    Mobile Access
                  </Card.Title>
                  <Card.Text className="text-muted">
                    Access your farm data anytime, anywhere with our
                    mobile-friendly platform.
                  </Card.Text>
                </Card.Body>
              </Card>
            </motion.div>
          </Col>
        </Row>
      </Container>

      {/* Featured Products Section */}
      <div className="py-5" style={{ backgroundColor: "#f8f9fa" }}>
        <Container>
          <Row className="mb-4">
            <Col className="text-center mb-4">
              <h6
                className="text-uppercase fw-bold"
                style={{
                  color: greyColor,
                  letterSpacing: "1.5px",
                  fontSize: "1.5rem",
                }}
              >
                Our Products
              </h6>
              <div
                className="mx-auto"
                style={{
                  width: "80px",
                  height: "4px",
                  backgroundColor: greyColor,
                  marginTop: "20px",
                }}
              ></div>
            </Col>
          </Row>

          <Row className="g-4">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((product, index) => (
                <Col lg={4} md={6} key={index}>
                  <motion.div
                    whileHover={{ y: -10 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Card className="h-100 border-0 shadow-sm product-card rounded-4">
                      <div style={{ height: "200px", overflow: "hidden" }}>
                        <Card.Img
                          variant="top"
                          src={
                            product.image ||
                            require("../../assets/no-image.png")
                          }
                          alt={product.product_name}
                          className="product-img"
                          style={{
                            backgroundSize: "contain",
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </div>
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <Badge pill bg="success">
                            <i className="fas fa-check-circle me-1"></i>{" "}
                            Available
                          </Badge>
                          <Badge pill bg="info">
                            <i className="fas fa-cubes me-1"></i>{" "}
                            {product.quantity} {product.unit}
                          </Badge>
                        </div>
                        <Card.Title className="mb-2 fw-bold">
                          {product.product_name}
                        </Card.Title>
                        <Card.Text className="text-muted small mb-3">
                          {product.product_description?.substring(0, 80)}...
                        </Card.Text>
                        <div className="d-flex justify-content-between align-items-end">
                          <h5
                            className="mb-0 fw-bold"
                            style={{ color: primaryColor }}
                          >
                            {formatRupiah(product.price)}
                          </h5>
                          <Button
                            variant="outline-warning"
                            size="sm"
                            as={Link}
                            to="/product"
                            style={{
                              color: primaryColor,
                              borderColor: primaryColor,
                            }}
                            className="read-more-btn"
                          >
                            <i className="fas fa-eye me-1"></i> View Details
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </motion.div>
                </Col>
              ))
            ) : (
              <Col xs={12} className="text-center py-4">
                <p className="text-muted">
                  <i className="fas fa-exclamation-circle me-2"></i>
                  No products available at the moment.
                </p>
              </Col>
            )}
          </Row>

          <Row className="mt-4">
            <Col className="text-center">
              <Button
                variant="warning"
                as={Link}
                to="/product"
                size="lg"
                className="px-4"
                style={{
                  backgroundColor: primaryColor,
                  borderColor: primaryColor,
                }}
              >
                <div style={{ color: "white" }}>
                  View All Products <i className="fas fa-arrow-right ms-2"></i>
                </div>
              </Button>
            </Col>
          </Row>
        </Container>
      </div>

      {/* About Section */}
      <div
        className="py-5 text-white"
        style={{
          background: greyColor,
          padding: "60px 0",
          borderTop: `5px solid ${primaryColor}`,
          borderBottom: `5px solid ${primaryColor}`,
        }}
      >
        <Container>
          <Row className="align-items-center">
            <Col lg={6} className="mb-4 mb-lg-0">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h2 className="display-5 fw-bold mb-4">About Dairytrack</h2>
                <div
                  className="mb-4"
                  style={{
                    width: "60px",
                    height: "3px",
                    background: primaryColor,
                  }}
                ></div>
                <p className="lead mb-4">
                  Dairytrack is a comprehensive dairy farm management system
                  designed to optimize operations, improve animal welfare, and
                  maximize productivity.
                </p>
                <div className="d-flex flex-column flex-md-row gap-3">
                  <div className="d-flex align-items-center mb-3">
                    <div
                      className="me-3"
                      style={{
                        backgroundColor: primaryColor,
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <i className="fas fa-check text-white"></i>
                    </div>
                    <div>Advanced Analytics</div>
                  </div>
                  <div className="d-flex align-items-center mb-3">
                    <div
                      className="me-3"
                      style={{
                        backgroundColor: primaryColor,
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <i className="fas fa-check text-white"></i>
                    </div>
                    <div>Real-time Monitoring</div>
                  </div>
                  <div className="d-flex align-items-center mb-3">
                    <div
                      className="me-3"
                      style={{
                        backgroundColor: primaryColor,
                        width: "40px",
                        height: "40px",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <i className="fas fa-check text-white"></i>
                    </div>
                    <div>Expert Support</div>
                  </div>
                </div>
                <Button
                  variant="warning"
                  size="lg"
                  className="mt-4"
                  as={Link}
                  to="/about"
                  style={{
                    backgroundColor: primaryColor,
                    borderColor: primaryColor,
                  }}
                >
                  <div style={{ color: "white" }}>
                    <i className="fas fa-info-circle me-2"></i>
                    Learn More About Us
                  </div>
                </Button>
              </motion.div>
            </Col>
            <Col lg={6}>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="position-relative text-center"
              >
                <img
                  src={require("../../assets/cowAbout.png")}
                  alt="About Dairytrack"
                  className="img-fluid rounded-4 shadow-lg"
                  style={{ maxWidth: "80%" }}
                />
                <div
                  className="position-absolute p-3 rounded-3 shadow"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.95)",
                    bottom: "20px",
                    right: "20px",
                    maxWidth: "180px",
                  }}
                >
                  <div className="text-center">
                    <div
                      style={{
                        color: primaryColor,
                        fontWeight: "bold",
                        fontSize: "28px",
                      }}
                    >
                      5+ Years
                    </div>
                    <div className="text-muted" style={{ fontSize: "14px" }}>
                      Experience
                    </div>
                  </div>
                </div>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Featured Gallery Section */}
      <Container className="py-5">
        <Row className="mb-4">
          <Col className="text-center mb-5">
            <h6
              className="text-uppercase fw-bold"
              style={{
                color: greyColor,
                letterSpacing: "1.5px",
                fontSize: "1.5rem",
              }}
            >
              Photo Showcase
            </h6>
            <div
              className="mx-auto"
              style={{
                width: "80px",
                height: "4px",
                backgroundColor: greyColor,
                marginTop: "20px",
              }}
            ></div>
          </Col>
        </Row>

        <Row className="g-4">
          {featuredGalleries && featuredGalleries.length > 0 ? (
            featuredGalleries.map((gallery, index) => (
              <Col md={3} sm={6} key={gallery.id || index}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Link to="/gallery" className="text-decoration-none">
                    <div className="gallery-card position-relative rounded-4 overflow-hidden">
                      <img
                        src={gallery.image_url}
                        alt={gallery.title || `Gallery image ${index + 1}`}
                        className="img-fluid shadow-sm"
                        style={{
                          width: "100%",
                          height: "220px",
                          objectFit: "cover",
                        }}
                      />
                      <div className="gallery-overlay rounded-4">
                        <h5 className="text-white mb-0">
                          <i className="fas fa-camera-retro me-2"></i>
                          {gallery.title || `Beautiful View ${index + 1}`}
                        </h5>
                        <small className="text-white-50">
                          {gallery.created_at &&
                            format(
                              new Date(gallery.created_at),
                              "MMMM dd, yyyy"
                            )}
                        </small>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              </Col>
            ))
          ) : (
            <Col xs={12} className="text-center py-4">
              <p className="text-muted">
                <i className="fas fa-exclamation-circle me-2"></i>
                No gallery images available at the moment.
              </p>
            </Col>
          )}
        </Row>

        <Row className="mt-5">
          <Col className="text-center">
            <Button
              variant="outline-secondary"
              as={Link}
              to="/gallery"
              size="lg"
              className="px-4"
            >
              View All Gallery <i className="fas fa-arrow-right ms-2"></i>
            </Button>
          </Col>
        </Row>
      </Container>

      {/* Latest Blog Section */}
      <div className="py-5" style={{ backgroundColor: "#f8f9fa" }}>
        <Container>
          <Row className="mb-4">
            <Col className="text-center mb-5">
              <h6
                className="text-uppercase fw-bold"
                style={{
                  color: greyColor,
                  letterSpacing: "1.5px",
                  fontSize: "1.5rem",
                }}
              >
                Latest News
              </h6>
              <div
                className="mx-auto"
                style={{
                  width: "80px",
                  height: "4px",
                  backgroundColor: greyColor,
                  marginTop: "20px",
                }}
              ></div>
            </Col>
          </Row>

          <Row className="g-4">
            {featuredBlogs && featuredBlogs.length > 0
              ? featuredBlogs.map((blog, index) => (
                  <Col lg={4} md={6} key={blog.id || index}>
                    <Card className="h-100 border-0 shadow-sm blog-card rounded-4">
                      <div style={{ height: "200px", overflow: "hidden" }}>
                        <Card.Img
                          variant="top"
                          src={
                            blog.photo_url ||
                            require("../../assets/no-image.png")
                          }
                          alt={blog.title}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                          className="blog-img"
                        />
                      </div>
                      <Card.Body>
                        <div className="d-flex flex-wrap mb-3">
                          <div className="d-flex flex-wrap gap-2 me-auto">
                            {blog.categories && blog.categories.length > 0 ? (
                              blog.categories.map((category, catIndex) => (
                                <Badge
                                  key={category.id || catIndex}
                                  pill
                                  bg={getCategoryVariant(
                                    category.id || catIndex
                                  )}
                                  style={{
                                    padding: "5px 10px",
                                  }}
                                >
                                  <i className="fas fa-tag me-1"></i>{" "}
                                  {category.name}
                                </Badge>
                              ))
                            ) : (
                              <Badge
                                pill
                                bg="warning"
                                text="dark"
                                style={{
                                  backgroundColor: `${primaryColor}30`,
                                  color: primaryColor,
                                }}
                              >
                                <i className="fas fa-tag me-1"></i> Dairy
                                Farming
                              </Badge>
                            )}
                          </div>
                          <small className="text-muted ms-auto">
                            <i className="far fa-calendar-alt me-1"></i>
                            {blog.created_at
                              ? format(
                                  new Date(blog.created_at),
                                  "MMMM d, yyyy"
                                )
                              : "May 10, 2025"}
                          </small>
                        </div>
                        <Card.Title className="fw-bold mb-2">
                          {blog.title ||
                            `Latest Dairy Industry Insights ${index + 1}`}
                        </Card.Title>
                        <Card.Text className="text-muted mb-3">
                          {stripHtml(
                            blog.content ||
                              "Learn about the latest trends and innovations in the dairy farming industry to optimize your operations."
                          ).substring(0, 100)}
                          ...
                        </Card.Text>
                        <Button
                          variant="link"
                          className="p-0 fw-bold blog-link"
                          as={Link}
                          to={`/blog/${blog.id || index}`}
                          style={{ color: primaryColor }}
                        >
                          Read More <i className="fas fa-arrow-right ms-1"></i>
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                ))
              : // Fallback blog posts if API call fails
                Array.from({ length: 3 }).map((_, index) => (
                  <Col lg={4} md={6} key={index}>
                    <Card className="h-100 border-0 shadow-sm blog-card rounded-4">
                      <div style={{ height: "200px", overflow: "hidden" }}>
                        <Card.Img
                          variant="top"
                          src={require("../../assets/no-image.png")}
                          alt={`Blog post ${index + 1}`}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                          className="blog-img"
                        />
                      </div>
                      <Card.Body>
                        <div className="d-flex mb-3">
                          <Badge
                            pill
                            bg="warning"
                            text="dark"
                            style={{
                              backgroundColor: `${primaryColor}30`,
                              color: primaryColor,
                            }}
                          >
                            <i className="fas fa-tag me-1"></i> Dairy Farming
                          </Badge>
                          <small className="text-muted ms-auto">
                            <i className="far fa-calendar-alt me-1"></i>
                            May {10 + index}, 2025
                          </small>
                        </div>
                        <Card.Title className="fw-bold mb-2">
                          Latest Dairy Industry Insights {index + 1}
                        </Card.Title>
                        <Card.Text className="text-muted mb-3">
                          Learn about the latest trends and innovations in the
                          dairy farming industry to optimize your operations...
                        </Card.Text>
                        <Button
                          variant="link"
                          className="p-0 fw-bold blog-link"
                          as={Link}
                          to="/blog"
                          style={{ color: primaryColor }}
                        >
                          Read More <i className="fas fa-arrow-right ms-1"></i>
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
          </Row>

          <Row className="mt-5">
            <Col className="text-center">
              <Button
                variant="outline-secondary"
                as={Link}
                to="/blog"
                size="lg"
                className="px-4"
              >
                View All Blog Posts <i className="fas fa-arrow-right ms-2"></i>
              </Button>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Quick Order Section */}
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col lg={10}>
            <Card className="border-0 shadow rounded-4 overflow-hidden">
              <Row className="g-0">
                <Col md={5}>
                  <div
                    style={{
                      height: "100%",
                      backgroundImage: `url(${require("../../assets/delivery-pic.png")})`,
                      backgroundSize: "65%",
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "center",
                    }}
                  ></div>
                </Col>
                <Col md={7}>
                  <Card.Body className="p-5">
                    <h2
                      className="fw-bold mb-3"
                      style={{ color: primaryColor }}
                    >
                      <i className="fas fa-shopping-cart me-2"></i>
                      Ready to Place an Order?
                    </h2>
                    <p className="lead mb-4">
                      Browse our premium dairy products and place your order
                      easily. Fresh, quality dairy products delivered to your
                      doorstep.
                    </p>
                    <Row className="mb-4">
                      <Col sm={6} className="mb-3 mb-sm-0">
                        <div className="d-flex align-items-center">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center me-3"
                            style={{
                              width: "45px",
                              height: "45px",
                              backgroundColor: `${primaryColor}20`,
                            }}
                          >
                            <i
                              className="fas fa-truck"
                              style={{ color: primaryColor }}
                            ></i>
                          </div>
                          <div>
                            <h6 className="mb-0 fw-bold">Fast Delivery</h6>
                            <small className="text-muted">
                              Within 24 hours
                            </small>
                          </div>
                        </div>
                      </Col>
                      <Col sm={6}>
                        <div className="d-flex align-items-center">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center me-3"
                            style={{
                              width: "45px",
                              height: "45px",
                              backgroundColor: `${accentColor}20`,
                            }}
                          >
                            <i
                              className="fas fa-leaf"
                              style={{ color: accentColor }}
                            ></i>
                          </div>
                          <div>
                            <h6 className="mb-0 fw-bold">Fresh Products</h6>
                            <small className="text-muted">Farm to table</small>
                          </div>
                        </div>
                      </Col>
                    </Row>
                    <Button
                      variant="warning"
                      as={Link}
                      to="/order"
                      size="lg"
                      className="w-100"
                      style={{
                        backgroundColor: primaryColor,
                        borderColor: primaryColor,
                      }}
                    >
                      <div style={{ color: "white" }}>
                        <i className="fas fa-clipboard-list me-2"></i>
                        Place an Order Now
                      </div>
                    </Button>
                  </Card.Body>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* CSS styles */}
      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;700&display=swap");
        @import url("https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap");

        /* Hero section styles */
        .hero-section {
          position: relative;
        }

        .hero-image {
          background-size: contain;
          background-position: center;
          position: relative;
        }

        .hero-content {
          position: relative;
          z-index: 2;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        /* Card animations */
        .feature-card,
        .blog-card,
        .product-card {
          transition: all 0.3s ease;
          border-radius: 12px;
          overflow: hidden;
        }

        .feature-card:hover,
        .blog-card:hover,
        .product-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
        }

        /* Gallery styles */
        .gallery-card {
          overflow: hidden;
          margin-bottom: 1rem;
          border-radius: 12px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .gallery-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
          padding: 20px;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .gallery-card:hover .gallery-overlay {
          background: linear-gradient(transparent, rgba(0, 0, 0, 0.9));
          height: 100%;
        }

        /* Image animations */
        .blog-img,
        .product-img {
          transition: transform 0.5s ease;
        }

        .blog-card:hover .blog-img,
        .product-card:hover .product-img {
          transform: scale(1.05);
        }

        .blog-link {
          transition: all 0.3s ease;
        }

        .blog-link:hover {
          margin-left: 5px;
        }

        /* Read more button hover effect */
        .read-more-btn:hover {
          background-color: ${primaryColor} !important;
          border-color: ${primaryColor} !important;
          color: white !important;
        }

        /* Rounded cards consistent with About page */
        .rounded-4 {
          border-radius: 12px !important;
        }
      `}</style>
    </Container>
  );
};

export default Home;
