import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Carousel,
  Badge,
  Spinner,
} from "react-bootstrap";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { listBlogs } from "../../Modules/controllers/blogController";
import { listGalleries } from "../../Modules/controllers/galleryController.js";

const Home = () => {
  // Define consistent styling variables
  const primaryColor = "#E9A319"; // gold - matching Blog page
  const greyColor = "#6c757d"; // grey - matching other pages
  const accentColor = "#3D90D7"; // blue accent from Gallery

  // State for featured content
  const [featuredBlogs, setFeaturedBlogs] = useState([]);
  const [featuredGalleries, setFeaturedGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      } catch (err) {
        setError("Failed to load featured content");
        console.error("Error fetching featured content:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedContent();
  }, []);

  // Loading state
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

  return (
    <Container fluid className="p-0">
      {/* Hero Section with Carousel */}
      <Carousel fade indicators={false} className="home-carousel">
        <Carousel.Item>
          <div
            className="carousel-image"
            style={{
              backgroundImage: "url(require('../../assets/aerial.png'))",
              height: "80vh",
            }}
          >
            <div className="carousel-overlay"></div>
            <Container className="carousel-content">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="display-3 fw-bold text-white mb-3">
                  Dairy~Track
                </h1>
                <p className="lead text-white mb-4">
                  Innovative tracking solutions for modern dairy farms
                </p>
                <Button
                  variant="warning"
                  size="lg"
                  className="me-3"
                  style={{
                    backgroundColor: primaryColor,
                    borderColor: primaryColor,
                  }}
                >
                  Get Started
                </Button>
                <Button variant="outline-light" size="lg">
                  Learn More
                </Button>
              </motion.div>
            </Container>
          </div>
        </Carousel.Item>
        <Carousel.Item>
          <div
            className="carousel-image"
            style={{
              backgroundImage: "url(require('../../assets/facility.png'))",
              height: "80vh",
            }}
          >
            <div className="carousel-overlay"></div>
            <Container className="carousel-content">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h1 className="display-3 fw-bold text-white mb-3">
                  Modern Farming
                </h1>
                <p className="lead text-white mb-4">
                  Next-generation solutions for optimal dairy farm management
                </p>
                <Button
                  variant="warning"
                  size="lg"
                  style={{
                    backgroundColor: primaryColor,
                    borderColor: primaryColor,
                  }}
                >
                  Our Solutions
                </Button>
              </motion.div>
            </Container>
          </div>
        </Carousel.Item>
      </Carousel>

      {/* Features Section */}
      <Container className="py-5">
        <Row className="mb-5">
          <Col className="text-center mb-5">
            <h6
              className="text-uppercase fw-bold"
              style={{ color: primaryColor, letterSpacing: "1.5px" }}
            >
              Why Choose Us
            </h6>
            <h2 className="display-5 fw-bold">
              Comprehensive Dairy Management
            </h2>
            <div
              className="mx-auto"
              style={{
                width: "80px",
                height: "4px",
                backgroundColor: primaryColor,
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
              <Card className="border-0 shadow-sm h-100 text-center feature-card">
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
              <Card className="border-0 shadow-sm h-100 text-center feature-card">
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
                      className="fas fa-cow fa-2x"
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
              <Card className="border-0 shadow-sm h-100 text-center feature-card">
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
              <Card className="border-0 shadow-sm h-100 text-center feature-card">
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

      {/* About Section */}
      <div
        className="py-5 text-white"
        style={{
          background: greyColor,
          padding: "60px 0",
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
                <h2 className="display-5 fw-bold mb-4">About Dairy~Track</h2>
                <p className="lead mb-4">
                  Dairy~Track is a comprehensive dairy farm management system
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
                  Learn More About Us
                </Button>
              </motion.div>
            </Col>
            <Col lg={6}>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
                className="position-relative"
              >
                <img
                  src={require("../../assets/visiMisi.png")}
                  alt="About Dairy~Track"
                  className="img-fluid rounded shadow-lg"
                  style={{ width: "100%" }}
                />
                <div
                  className="position-absolute"
                  style={{
                    bottom: "-20px",
                    right: "-20px",
                    width: "80px",
                    height: "80px",
                    backgroundColor: primaryColor,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 2,
                  }}
                >
                  <i className="fas fa-award fa-2x text-white"></i>
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
              style={{ color: primaryColor, letterSpacing: "1.5px" }}
            >
              Photo Showcase
            </h6>
            <h2 className="display-5 fw-bold">Featured Gallery</h2>
            <div
              className="mx-auto"
              style={{
                width: "80px",
                height: "4px",
                backgroundColor: primaryColor,
                marginTop: "20px",
              }}
            ></div>
          </Col>
        </Row>

        <Row className="g-4">
          {featuredGalleries && featuredGalleries.length > 0
            ? featuredGalleries.map((gallery, index) => (
                <Col md={3} sm={6} key={gallery.id || index}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="gallery-card position-relative">
                      <img
                        src={
                          gallery.image_url ||
                          require("../../assets/commodity.png")
                        }
                        alt={gallery.title || `Gallery image ${index + 1}`}
                        className="img-fluid rounded shadow-sm"
                        style={{
                          width: "100%",
                          height: "220px",
                          objectFit: "cover",
                        }}
                      />
                      <div className="gallery-overlay rounded">
                        <h5 className="text-white">
                          {gallery.title || `Beautiful View ${index + 1}`}
                        </h5>
                      </div>
                    </div>
                  </motion.div>
                </Col>
              ))
            : // Fallback gallery images if API call fails
              Array.from({ length: 4 }).map((_, index) => (
                <Col md={3} sm={6} key={index}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="gallery-card position-relative">
                      <img
                        src={require(index % 2 === 0
                          ? "../../assets/commodity.png"
                          : "../../assets/aerial.png")}
                        alt={`Gallery image ${index + 1}`}
                        className="img-fluid rounded shadow-sm"
                        style={{
                          width: "100%",
                          height: "220px",
                          objectFit: "cover",
                        }}
                      />
                      <div className="gallery-overlay rounded">
                        <h5 className="text-white">
                          Beautiful View {index + 1}
                        </h5>
                      </div>
                    </div>
                  </motion.div>
                </Col>
              ))}
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

      {/* Stats Counter Section */}
      <div className="py-5" style={{ backgroundColor: "#f8f9fa" }}>
        <Container>
          <Row className="text-center g-4">
            <Col md={3} sm={6}>
              <motion.div
                whileInView={{ scale: [0.9, 1.1, 1] }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="counter-box p-4">
                  <div
                    className="counter-icon mb-3 mx-auto"
                    style={{
                      backgroundColor: `${primaryColor}20`,
                      width: "70px",
                      height: "70px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <i
                      className="fas fa-users fa-2x"
                      style={{ color: primaryColor }}
                    ></i>
                  </div>
                  <h2
                    className="counter-number fw-bold"
                    style={{ color: primaryColor }}
                  >
                    1,500+
                  </h2>
                  <p className="counter-text text-uppercase fw-bold">
                    Happy Farmers
                  </p>
                </div>
              </motion.div>
            </Col>

            <Col md={3} sm={6}>
              <motion.div
                whileInView={{ scale: [0.9, 1.1, 1] }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <div className="counter-box p-4">
                  <div
                    className="counter-icon mb-3 mx-auto"
                    style={{
                      backgroundColor: `${accentColor}20`,
                      width: "70px",
                      height: "70px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <i
                      className="fas fa-map-marker-alt fa-2x"
                      style={{ color: accentColor }}
                    ></i>
                  </div>
                  <h2
                    className="counter-number fw-bold"
                    style={{ color: accentColor }}
                  >
                    25+
                  </h2>
                  <p className="counter-text text-uppercase fw-bold">
                    Countries
                  </p>
                </div>
              </motion.div>
            </Col>

            <Col md={3} sm={6}>
              <motion.div
                whileInView={{ scale: [0.9, 1.1, 1] }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <div className="counter-box p-4">
                  <div
                    className="counter-icon mb-3 mx-auto"
                    style={{
                      backgroundColor: `${primaryColor}20`,
                      width: "70px",
                      height: "70px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <i
                      className="fas fa-chart-pie fa-2x"
                      style={{ color: primaryColor }}
                    ></i>
                  </div>
                  <h2
                    className="counter-number fw-bold"
                    style={{ color: primaryColor }}
                  >
                    200,000+
                  </h2>
                  <p className="counter-text text-uppercase fw-bold">
                    Daily Entries
                  </p>
                </div>
              </motion.div>
            </Col>

            <Col md={3} sm={6}>
              <motion.div
                whileInView={{ scale: [0.9, 1.1, 1] }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <div className="counter-box p-4">
                  <div
                    className="counter-icon mb-3 mx-auto"
                    style={{
                      backgroundColor: `${accentColor}20`,
                      width: "70px",
                      height: "70px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <i
                      className="fas fa-award fa-2x"
                      style={{ color: accentColor }}
                    ></i>
                  </div>
                  <h2
                    className="counter-number fw-bold"
                    style={{ color: accentColor }}
                  >
                    50+
                  </h2>
                  <p className="counter-text text-uppercase fw-bold">
                    Awards Won
                  </p>
                </div>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Latest Blog Section */}
      <Container className="py-5">
        <Row className="mb-4">
          <Col className="text-center mb-5">
            <h6
              className="text-uppercase fw-bold"
              style={{ color: primaryColor, letterSpacing: "1.5px" }}
            >
              Latest News
            </h6>
            <h2 className="display-5 fw-bold">From Our Blog</h2>
            <div
              className="mx-auto"
              style={{
                width: "80px",
                height: "4px",
                backgroundColor: primaryColor,
                marginTop: "20px",
              }}
            ></div>
          </Col>
        </Row>

        <Row className="g-4">
          {featuredBlogs && featuredBlogs.length > 0
            ? featuredBlogs.map((blog, index) => (
                <Col lg={4} md={6} key={blog.id || index}>
                  <Card className="h-100 border-0 shadow-sm blog-card">
                    <div style={{ height: "200px", overflow: "hidden" }}>
                      <Card.Img
                        variant="top"
                        src={
                          blog.photo_url || require("../../assets/facility.png")
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
                          {blog.created_at
                            ? new Date(blog.created_at).toLocaleDateString()
                            : "May 10, 2025"}
                        </small>
                      </div>
                      <Card.Title className="fw-bold mb-2">
                        {blog.title ||
                          `Latest Dairy Industry Insights ${index + 1}`}
                      </Card.Title>
                      <Card.Text className="text-muted mb-3">
                        {blog.content?.substring(0, 100) ||
                          "Learn about the latest trends and innovations in the dairy farming industry to optimize your operations."}
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
                  <Card className="h-100 border-0 shadow-sm blog-card">
                    <div style={{ height: "200px", overflow: "hidden" }}>
                      <Card.Img
                        variant="top"
                        src={require("../../assets/facility.png")}
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

      {/* Call to Action */}
      <div
        className="py-5 text-white text-center"
        style={{
          background: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${require("../../assets/aerial.png")})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          padding: "100px 0",
        }}
      >
        <Container>
          <Row className="justify-content-center">
            <Col lg={8}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <h2 className="display-4 fw-bold mb-4">
                  Ready to Transform Your Dairy Farm?
                </h2>
                <p className="lead mb-5">
                  Join thousands of dairy farmers who have improved their
                  operations with Dairy~Track. Start your journey today!
                </p>
                <Button
                  variant="warning"
                  size="lg"
                  className="me-3 px-4 py-3"
                  style={{
                    backgroundColor: primaryColor,
                    borderColor: primaryColor,
                  }}
                >
                  Get Started Now
                </Button>
                <Button variant="outline-light" size="lg" className="px-4 py-3">
                  Schedule a Demo
                </Button>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* CSS styles */}
      <style jsx>{`
        .carousel-image {
          background-size: cover;
          background-position: center;
          position: relative;
        }

        .carousel-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
        }

        .carousel-content {
          position: relative;
          z-index: 2;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .feature-card {
          transition: all 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
        }

        .gallery-card {
          overflow: hidden;
          margin-bottom: 1rem;
        }

        .gallery-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
          padding: 20px;
          transition: all 0.3s ease;
        }

        .gallery-card:hover .gallery-overlay {
          background: linear-gradient(transparent, rgba(0, 0, 0, 0.9));
        }

        .counter-box {
          transition: all 0.3s ease;
        }

        .counter-box:hover {
          transform: translateY(-10px);
        }

        .blog-card {
          transition: all 0.3s ease;
        }

        .blog-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1) !important;
        }

        .blog-img {
          transition: transform 0.5s ease;
        }

        .blog-card:hover .blog-img {
          transform: scale(1.05);
        }

        .blog-link {
          transition: all 0.3s ease;
        }

        .blog-link:hover {
          margin-left: 5px;
        }
      `}</style>
    </Container>
  );
};

export default Home;
