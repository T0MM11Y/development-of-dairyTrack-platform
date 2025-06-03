import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Spinner,
} from "react-bootstrap";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { listBlogs } from "../../Modules/controllers/blogController";
import { listGalleries } from "../../Modules/controllers/galleryController.js";
import { format } from "date-fns";

const Home = () => {
  // Enhanced color palette with gradients
  const theme = {
    primary: "#E9A319",
    secondary: "#3D8D7A",
    accent: "#3D90D7",
    gradients: {
      primary: "linear-gradient(135deg, #E9A319 0%, #F4B942 100%)",
      secondary: "linear-gradient(135deg, #3D8D7A 0%, #4AA391 100%)",
      hero: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      card: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
    },
    shadows: {
      card: "0 10px 40px rgba(0, 0, 0, 0.1)",
      hover: "0 20px 60px rgba(0, 0, 0, 0.15)",
      glow: "0 0 30px rgba(233, 163, 25, 0.3)",
    },
  };

  // Enhanced animation variants
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
        transition: {
          staggerChildren: 0.2,
          delayChildren: 0.1,
        },
      },
    },
    scaleIn: {
      hidden: { scale: 0.8, opacity: 0 },
      visible: {
        scale: 1,
        opacity: 1,
        transition: { duration: 0.6, ease: "easeOut" },
      },
    },
    slideInLeft: {
      hidden: { x: -100, opacity: 0 },
      visible: {
        x: 0,
        opacity: 1,
        transition: { duration: 0.8, ease: "easeOut" },
      },
    },
    slideInRight: {
      hidden: { x: 100, opacity: 0 },
      visible: {
        x: 0,
        opacity: 1,
        transition: { duration: 0.8, ease: "easeOut" },
      },
    },
  };

  const getCategoryVariant = (categoryId) => {
    const categoryVariants = ["primary", "danger", "success", "info"];
    return categoryVariants[categoryId % 4];
  };

  // State management
  const [featuredBlogs, setFeaturedBlogs] = useState([]);
  const [featuredGalleries, setFeaturedGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFeature, setActiveFeature] = useState(0);

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Fetch featured content
  useEffect(() => {
    const fetchFeaturedContent = async () => {
      try {
        setLoading(true);
        const [blogsResponse, galleriesResponse] = await Promise.all([
          listBlogs(),
          listGalleries(),
        ]);

        if (blogsResponse.success) {
          setFeaturedBlogs(blogsResponse.blogs.slice(0, 3));
        }
        if (galleriesResponse.success) {
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

  const stripHtml = (html) => {
    if (!html) return "";
    return html.replace(/<[^>]+>/g, "");
  };

  // Enhanced loading component
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
          backgroundColor: "#ffffff", // Ensures white background
          zIndex: 9999, // Ensures it's on top
          display: "flex", // Added from CSS class for content centering
          alignItems: "center", // Added from CSS class for content centering
          justifyContent: "center", // Added from CSS class for content centering
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="loading-content"
        >
          <img
            src={require("../../assets/loading.gif")}
            style={{
              display: "block", // Diperlukan agar margin: auto berfungsi untuk penengahan
              maxWidth: "30vw", // Lebar responsif, hingga 80% dari lebar viewport
              maxHeight: "30vh", // Tinggi responsif, hingga 70% dari tinggi viewport (menyisakan ruang untuk teks)
              width: "auto", // Pertahankan rasio aspek
              height: "auto", // Pertahankan rasio aspek
              margin: "0 auto 1rem", // Tengahkan secara horizontal, tambahkan margin bawah 1rem
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

  const renderSectionHeader = (title, subtitle = "") => (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={animations.fadeInUp}
      className="section-header"
    >
      <div className="text-center mb-5">
        <motion.div className="section-badge" whileHover={{ scale: 1.05 }}>
          <span>{title}</span>
        </motion.div>
        <h2 className="section-title">{title}</h2>
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
        <div className="section-divider">
          <div className="divider-line"></div>
          <div className="divider-dot"></div>
          <div className="divider-line"></div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="modern-home">
      {/* Enhanced Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          {/* Animated particles */}
          <div className="particles-container">
            {Array.from({ length: 50 }).map((_, i) => (
              <div key={i} className={`particle particle-${i % 5}`}></div>
            ))}
          </div>

          {/* Floating elements */}
          <div className="floating-elements">
            <div className="floating-circle circle-1"></div>
            <div className="floating-circle circle-2"></div>
            <div className="floating-circle circle-3"></div>
          </div>

          <Container className="hero-content">
            <Row className="align-items-center min-vh-100">
              <Col lg={6} className="hero-text">
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={animations.slideInLeft}
                >
                  <div className="hero-badge">
                    <i className="fas fa-award me-2"></i>
                    #1 Dairy Management System
                  </div>
                  <h1 className="hero-title">
                    Transform Your
                    <span className="gradient-text"> Dairy Farm</span>
                    <br />
                    Into a Smart Operation
                  </h1>
                  <p className="hero-description">
                    Experience the future of dairy farming with our AI-powered
                    management system. Track performance, optimize operations,
                    and maximize productivity like never before.
                  </p>

                  <div className="hero-features">
                    {[
                      "Real-time Analytics",
                      "Smart Monitoring",
                      "Expert Support",
                    ].map((feature, i) => (
                      <motion.div
                        key={i}
                        className="hero-feature-item"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                      >
                        <i className="fas fa-check-circle"></i>
                        <span>{feature}</span>
                      </motion.div>
                    ))}
                  </div>

                  <div className="hero-actions">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        className="btn-primary-gradient"
                        size="lg"
                        as={Link}
                        to="/about"
                      >
                        <i className="fas fa-rocket me-2"></i>
                        Get Started
                      </Button>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="outline-light"
                        size="lg"
                        className="ms-3"
                        href="https://youtu.be/93FIJ32SWTs" // Changed 'to' to 'href'
                        target="_blank" // Added target="_blank" to open in a new tab
                        rel="noopener noreferrer" // Added rel="noopener noreferrer" for security
                      >
                        <i className="fas fa-play me-2"></i>
                        About Girolando
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              </Col>

              <Col lg={6} className="hero-visual">
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={animations.slideInRight}
                  className="hero-image-container"
                >
                  <div className="hero-card">
                    <div className="hero-card-glow"></div>
                    <img
                      src={require("../../assets/cute_cow.png")}
                      alt="Smart Dairy Management"
                      className="hero-image"
                    />

                    {/* Floating stats */}
                    <motion.div
                      className="floating-stat stat-1"
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <div className="stat-icon">
                        <i className="fas fa-chart-line"></i>
                      </div>
                      <div className="stat-info">
                        <div className="stat-number">+25%</div>
                        <div className="stat-label">Productivity</div>
                      </div>
                    </motion.div>

                    <motion.div
                      className="floating-stat stat-2"
                      animate={{ y: [0, 10, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                    >
                      <div className="stat-icon">
                        <i className="fas fa-paw"></i>
                      </div>
                      <div className="stat-info">
                        <div className="stat-number">500+</div>
                        <div className="stat-label">Happy Cows</div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </Col>
            </Row>
          </Container>
        </div>
      </section>

      {/* Interactive Features Section */}
      <section className="features-section">
        <Container>
          {renderSectionHeader(
            "Why Choose Dairytrack",
            "Discover the features that make us the leading dairy management solution"
          )}

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={animations.staggerContainer}
          >
            <Row className="g-4">
              {[
                {
                  icon: "chart-line",
                  title: "AI-Powered Analytics",
                  description:
                    "Advanced machine learning algorithms analyze your farm data to provide actionable insights and predictions.",
                  features: [
                    "Predictive Analysis",
                    "Performance Metrics",
                    "Trend Forecasting",
                  ],
                  color: theme.primary,
                },
                {
                  icon: "paw",
                  title: "Smart Herd Management",
                  description:
                    "Comprehensive tracking system for animal health, breeding, and productivity optimization.",
                  features: [
                    "Health Monitoring",
                    "Breeding Records",
                    "Individual Tracking",
                  ],
                  color: theme.accent,
                },
                {
                  icon: "mobile-alt",
                  title: "Mobile-First Design",
                  description:
                    "Access your farm data anywhere, anytime with our responsive mobile application.",
                  features: [
                    "Offline Support",
                    "Real-time Sync",
                    "Push Notifications",
                  ],
                  color: theme.secondary,
                },
                {
                  icon: "shield-alt",
                  title: "Enterprise Security",
                  description:
                    "Bank-level security ensures your sensitive farm data is always protected.",
                  features: [
                    "Data Encryption",
                    "Secure Backups",
                    "Access Control",
                  ],
                  color: "#e74c3c",
                },
              ].map((feature, index) => (
                <Col lg={3} md={6} key={index}>
                  <motion.div
                    variants={animations.scaleIn}
                    whileHover={{ y: -10, transition: { duration: 0.2 } }}
                    className={`feature-card ${
                      activeFeature === index ? "active" : ""
                    }`}
                    onMouseEnter={() => setActiveFeature(index)}
                  >
                    <div className="feature-card-inner">
                      <div
                        className="feature-icon"
                        style={{
                          background: `linear-gradient(135deg, ${feature.color}, ${feature.color}dd)`,
                        }}
                      >
                        <i className={`fas fa-${feature.icon}`}></i>
                      </div>

                      <h4 className="feature-title">{feature.title}</h4>
                      <p className="feature-description">
                        {feature.description}
                      </p>

                      <div className="feature-list">
                        {feature.features.map((item, i) => (
                          <div key={i} className="feature-item">
                            <i className="fas fa-check"></i>
                            <span style={{ color: "#718096" }}>
                              {item}
                            </span>{" "}
                            {/* Added grey color */}
                          </div>
                        ))}
                      </div>

                      <div className="feature-background">
                        <i className={`fas fa-${feature.icon}`}></i>
                      </div>
                    </div>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </motion.div>
        </Container>
      </section>

      {/* Enhanced About Section */}
      <section className="about-section">
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={animations.slideInLeft}
                className="about-content"
              >
                <div className="about-badge">About Dairytrack</div>
                <h2 className="about-title">
                  Revolutionizing Dairy Farming with
                  <span className="gradient-text"> Smart Technology</span>
                </h2>
                <p className="about-description">
                  Founded by dairy farming experts and technology innovators,
                  Dairytrack combines decades of agricultural knowledge with
                  cutting-edge AI to create the most comprehensive farm
                  management solution available.
                </p>

                <div className="about-stats">
                  {[
                    { number: "10K+", label: "Active Farms", icon: "users" },
                    { number: "99.9%", label: "Uptime", icon: "check" },
                    { number: "50+", label: "Countries", icon: "globe" },
                  ].map((stat, i) => (
                    <motion.div
                      key={i}
                      className="about-stat"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <div className="stat-icon">
                        <i className={`fas fa-${stat.icon}`}></i>
                      </div>
                      <div className="stat-content">
                        <div className="stat-number">{stat.number}</div>
                        <div className="stat-label">{stat.label}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    className="btn-secondary-gradient"
                    size="lg"
                    as={Link}
                    to="/about"
                  >
                    <i className="fas fa-arrow-right me-2"></i>
                    Learn Our Story
                  </Button>
                </motion.div>
              </motion.div>
            </Col>

            <Col lg={6}>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={animations.slideInRight}
                className="about-visual"
              >
                <div className="about-image-container">
                  <img
                    src={require("../../assets/cowAbout.png")}
                    alt="About Dairytrack"
                    className="about-image"
                  />
                  <div className="about-decoration">
                    <div className="decoration-circle circle-1"></div>
                    <div className="decoration-circle circle-2"></div>
                  </div>
                </div>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Enhanced Gallery Section */}
      <section className="gallery-section">
        <Container>
          {renderSectionHeader(
            "Visual Showcase",
            "Explore our gallery of successful dairy operations and beautiful farm imagery"
          )}

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={animations.staggerContainer}
          >
            <Row className="g-4">
              {(featuredGalleries.length > 0
                ? featuredGalleries
                : Array.from({ length: 4 })
              ).map((gallery, index) => (
                <Col lg={3} md={6} key={gallery?.id || index}>
                  <motion.div
                    variants={animations.scaleIn}
                    whileHover={{ scale: 1.05 }}
                    className="gallery-item"
                  >
                    <Link to="/gallery" className="gallery-link">
                      <div className="gallery-card">
                        <img
                          src={
                            gallery?.image_url ||
                            require("../../assets/no-image.png")
                          }
                          alt={gallery?.title || `Gallery ${index + 1}`}
                          className="gallery-image"
                        />
                        <div className="gallery-overlay">
                          <div className="gallery-content">
                            <h5 className="gallery-title">
                              <i className="fas fa-camera me-2"></i>
                              {gallery?.title || `Beautiful Farm ${index + 1}`}
                            </h5>
                            <p className="gallery-date">
                              {gallery?.created_at
                                ? format(
                                    new Date(gallery.created_at),
                                    "MMMM dd, yyyy"
                                  )
                                : "Recent Photo"}
                            </p>
                          </div>
                          <div className="gallery-action">
                            <i className="fas fa-external-link-alt"></i>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </motion.div>

          <motion.div
            className="text-center mt-5"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outline-primary"
                size="lg"
                as={Link}
                to="/gallery"
              >
                View Complete Gallery
                <i className="fas fa-arrow-right ms-2"></i>
              </Button>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* Enhanced Blog Section */}
      <section className="blog-section">
        <Container>
          {renderSectionHeader(
            "Latest Insights",
            "Stay updated with the latest trends, tips, and innovations in dairy farming"
          )}

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={animations.staggerContainer}
          >
            <Row className="g-4">
              {(featuredBlogs.length > 0
                ? featuredBlogs
                : Array.from({ length: 3 })
              ).map((blog, index) => (
                <Col lg={4} md={6} key={blog?.id || index}>
                  <motion.div
                    variants={animations.scaleIn}
                    whileHover={{ y: -10 }}
                    className="blog-card"
                  >
                    <div className="blog-image-container">
                      <img
                        src={
                          blog?.photo_url ||
                          require("../../assets/no-image.png")
                        }
                        alt={blog?.title || `Blog post ${index + 1}`}
                        className="blog-image"
                      />
                      <div className="blog-category">
                        {blog?.categories?.length > 0 ? (
                          blog.categories.map((category, catIndex) => (
                            <Badge
                              key={category.id || catIndex}
                              className="category-badge"
                              style={{ backgroundColor: theme.primary }}
                            >
                              {category.name}
                            </Badge>
                          ))
                        ) : (
                          <Badge
                            className="category-badge"
                            style={{ backgroundColor: theme.primary }}
                          >
                            Dairy Farming
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="blog-content">
                      <div className="blog-meta">
                        <span className="blog-date">
                          <i className="far fa-calendar-alt me-1"></i>
                          {blog?.created_at
                            ? format(new Date(blog.created_at), "MMM d, yyyy")
                            : `May ${10 + index}, 2025`}
                        </span>
                        <span className="blog-read-time">
                          <i className="far fa-clock me-1"></i>5 min read
                        </span>
                      </div>

                      <h4 className="blog-title">
                        {blog?.title ||
                          `Dairy Industry Innovation ${index + 1}`}
                      </h4>

                      <p className="blog-excerpt">
                        {stripHtml(
                          blog?.content ||
                            "Discover the latest innovations and best practices that are transforming the dairy industry."
                        ).substring(0, 120)}
                        ...
                      </p>

                      <div className="blog-footer">
                        <Link
                          to={`/blog/${blog?.id || index}`}
                          className="blog-link"
                        >
                          Read Full Article
                          <i className="fas fa-arrow-right ms-1"></i>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </motion.div>

          <motion.div
            className="text-center mt-5"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                className="btn-primary-gradient"
                size="lg"
                as={Link}
                to="/blog"
              >
                Explore All Articles
                <i className="fas fa-arrow-right ms-2"></i>
              </Button>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* Enhanced CSS Styles */}
      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap");

        .modern-home {
          font-family: "Inter", sans-serif;
          overflow-x: hidden;
        }

        /* Loading Screen */
        .loading-screen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }

        .loading-content {
          text-align: center;
          color: white;
        }

        .spinner-container {
          position: relative;
          width: 80px;
          height: 80px;
          margin: 0 auto 2rem;
        }

        .spinner-ring {
          position: absolute;
          border: 3px solid transparent;
          border-top: 3px solid white;
          border-radius: 50%;
          animation: spin 1.2s linear infinite;
        }

        .spinner-ring:nth-child(1) {
          width: 80px;
          height: 80px;
        }

        .spinner-ring:nth-child(2) {
          width: 60px;
          height: 60px;
          top: 10px;
          left: 10px;
          animation-delay: -0.4s;
        }

        .spinner-ring:nth-child(3) {
          width: 40px;
          height: 40px;
          top: 20px;
          left: 20px;
          animation-delay: -0.8s;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .loading-text {
          font-size: 1.2rem;
          font-weight: 500;
          opacity: 0.9;
        }

        /* Hero Section */
        .hero-section {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
        }

        .hero-background {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          position: relative;
          min-height: 100vh;
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
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          animation: float 6s ease-in-out infinite;
        }

        .particle-0 {
          width: 4px;
          height: 4px;
          top: 20%;
          left: 10%;
          animation-delay: 0s;
        }
        .particle-1 {
          width: 6px;
          height: 6px;
          top: 40%;
          left: 20%;
          animation-delay: 1s;
        }
        .particle-2 {
          width: 3px;
          height: 3px;
          top: 60%;
          left: 30%;
          animation-delay: 2s;
        }
        .particle-3 {
          width: 5px;
          height: 5px;
          top: 80%;
          left: 40%;
          animation-delay: 3s;
        }
        .particle-4 {
          width: 4px;
          height: 4px;
          top: 30%;
          left: 60%;
          animation-delay: 4s;
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          33% {
            transform: translateY(-30px) rotate(120deg);
          }
          66% {
            transform: translateY(30px) rotate(240deg);
          }
        }

        .floating-elements {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .floating-circle {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
          animation: floatCircle 8s ease-in-out infinite;
        }

        .circle-1 {
          width: 200px;
          height: 200px;
          top: 10%;
          right: 10%;
          animation-delay: 0s;
        }

        .circle-2 {
          width: 150px;
          height: 150px;
          bottom: 20%;
          left: 15%;
          animation-delay: 2s;
        }

        .circle-3 {
          width: 100px;
          height: 100px;
          top: 50%;
          right: 30%;
          animation-delay: 4s;
        }

        @keyframes floatCircle {
          0%,
          100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-50px) scale(1.1);
          }
        }

        .hero-content {
          position: relative;
          z-index: 10;
        }

        .hero-badge {
          display: inline-block;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          padding: 8px 20px;
          border-radius: 25px;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 1.5rem;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .hero-title {
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 800;
          color: white;
          line-height: 1.2;
          margin-bottom: 1.5rem;
        }

        .gradient-text {
          background: linear-gradient(135deg, #e9a319 0%, #f4b942 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-description {
          font-size: 1.2rem;
          color: rgba(255, 255, 255, 0.9);
          line-height: 1.6;
          margin-bottom: 2rem;
          max-width: 500px;
        }

        .hero-features {
          margin-bottom: 2.5rem;
        }

        .hero-feature-item {
          display: flex;
          align-items: center;
          color: white;
          margin-bottom: 1rem;
          font-weight: 500;
        }

        .hero-feature-item i {
          color: #e9a319;
          margin-right: 12px;
          font-size: 1.1rem;
        }

        .hero-actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .btn-primary-gradient {
          background: linear-gradient(135deg, #e9a319 0%, #f4b942 100%);
          border: none;
          color: white;
          font-weight: 600;
          padding: 12px 30px;
          border-radius: 50px;
          box-shadow: 0 10px 30px rgba(233, 163, 25, 0.4);
          transition: all 0.3s ease;
        }

        .btn-primary-gradient:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 40px rgba(233, 163, 25, 0.6);
          color: white;
        }

        .btn-secondary-gradient {
          background: linear-gradient(135deg, #3d8d7a 0%, #4aa391 100%);
          border: none;
          color: white;
          font-weight: 600;
          padding: 12px 30px;
          border-radius: 50px;
          box-shadow: 0 10px 30px rgba(61, 141, 122, 0.4);
          transition: all 0.3s ease;
        }

        .btn-secondary-gradient:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 40px rgba(61, 141, 122, 0.6);
          color: white;
        }

        .hero-image-container {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .hero-card {
          position: relative;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 30px;
          padding: 2rem;
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
        }

        .hero-card-glow {
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(
            circle,
            rgba(233, 163, 25, 0.2) 0%,
            transparent 70%
          );
          border-radius: 50%;
          animation: glow 4s ease-in-out infinite alternate;
        }

        @keyframes glow {
          0% {
            opacity: 0.5;
            transform: scale(0.8);
          }
          100% {
            opacity: 1;
            transform: scale(1.2);
          }
        }

        .hero-image {
          width: 100%;
          max-width: 400px;
          height: auto;
          position: relative;
          z-index: 2;
          filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.3));
        }

        .floating-stat {
          position: absolute;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 15px;
          padding: 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
          z-index: 3;
        }

        .stat-1 {
          top: 20%;
          left: -20%;
        }

        .stat-2 {
          bottom: 20%;
          right: -20%;
        }

        .stat-icon {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #e9a319, #f4b942);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.2rem;
        }

        .stat-number {
          font-size: 1.5rem;
          font-weight: 700;
          color: #2d3748;
          line-height: 1;
        }

        .stat-label {
          font-size: 0.85rem;
          color: #718096;
          font-weight: 500;
        }

        /* Section Headers */
        .section-header {
          margin-bottom: 4rem;
        }

        .section-badge {
          display: inline-block;
          background: linear-gradient(135deg, #e9a319 0%, #f4b942 100%);
          color: white;
          padding: 8px 24px;
          border-radius: 25px;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 1rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .section-title {
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 1rem;
        }

        .section-subtitle {
          font-size: 1.1rem;
          color: #718096;
          max-width: 600px;
          margin: 0 auto 2rem;
          line-height: 1.6;
        }

        .section-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
        }

        .divider-line {
          width: 60px;
          height: 2px;
          background: linear-gradient(135deg, #e9a319, #f4b942);
        }

        .divider-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #e9a319;
        }

        /* Features Section */
        .features-section {
          padding: 120px 0;
          background: #f8f9fa;
        }

        .feature-card {
          background: white;
          border-radius: 20px;
          padding: 2.5rem;
          height: 100%;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
          transition: all 0.4s ease;
          position: relative;
          overflow: hidden;
          cursor: pointer;
        }

        .feature-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.15);
        }

        .feature-card.active {
          transform: translateY(-10px);
          box-shadow: 0 25px 60px rgba(233, 163, 25, 0.2);
        }

        .feature-card-inner {
          position: relative;
          z-index: 2;
        }

        .feature-icon {
          width: 80px;
          height: 80px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
          font-size: 2rem;
          color: white;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        .feature-title {
          font-size: 1.4rem;
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 1rem;
        }

        .feature-description {
          color: #718096;
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .feature-list {
          space-y: 0.5rem;
          color: ;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
          font-size: 0.9rem;
          color: #4a5568;
        }

        .feature-item i {
          color: #e9a319;
          font-size: 0.8rem;
        }

        .feature-background {
          position: absolute;
          top: -50px;
          right: -50px;
          font-size: 8rem;
          color: rgba(233, 163, 25, 0.05);
          z-index: 1;
        }

        /* About Section */
        .about-section {
          padding: 120px 0;
          background: white;
        }

        .about-badge {
          display: inline-block;
          background: rgba(61, 141, 122, 0.1);
          color: #3d8d7a;
          padding: 8px 24px;
          border-radius: 25px;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 1.5rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .about-title {
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 1.5rem;
          line-height: 1.3;
        }

        .about-description {
          font-size: 1.1rem;
          color: #718096;
          line-height: 1.7;
          margin-bottom: 2.5rem;
        }

        .about-stats {
          display: flex;
          gap: 2rem;
          margin-bottom: 2.5rem;
          flex-wrap: wrap;
        }

        .about-stat {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: #f8f9fa;
          padding: 1.5rem;
          border-radius: 15px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
        }

        .about-stat .stat-icon {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #3d8d7a, #4aa391);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.2rem;
        }

        .about-stat .stat-number {
          font-size: 1.8rem;
          font-weight: 700;
          color: #2d3748;
          line-height: 1;
        }

        .about-stat .stat-label {
          font-size: 0.9rem;
          color: #718096;
          font-weight: 500;
        }

        .about-visual {
          position: relative;
        }

        .about-image-container {
          position: relative;
          display: flex;
          justify-content: center;
        }

        .about-image {
          width: 100%;
          max-width: 500px;
          height: auto;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
        }

        .about-decoration {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: -1;
        }

        .decoration-circle {
          position: absolute;
          border-radius: 50%;
          background: linear-gradient(
            135deg,
            rgba(233, 163, 25, 0.1),
            rgba(244, 185, 66, 0.1)
          );
        }

        .decoration-circle.circle-1 {
          width: 200px;
          height: 200px;
          top: -50px;
          right: -50px;
        }

        .decoration-circle.circle-2 {
          width: 150px;
          height: 150px;
          bottom: -30px;
          left: -30px;
          background: linear-gradient(
            135deg,
            rgba(61, 141, 122, 0.1),
            rgba(74, 163, 145, 0.1)
          );
        }

        /* Gallery Section */
        .gallery-section {
          padding: 120px 0;
          background: #f8f9fa;
        }

        .gallery-item {
          height: 300px;
        }

        .gallery-link {
          text-decoration: none;
          color: inherit;
        }

        .gallery-card {
          position: relative;
          height: 100%;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          transition: all 0.4s ease;
        }

        .gallery-card:hover {
          transform: scale(1.05);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
        }

        .gallery-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        .gallery-card:hover .gallery-image {
          transform: scale(1.1);
        }

        .gallery-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
          padding: 2rem;
          transform: translateY(100%);
          transition: transform 0.4s ease;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }

        .gallery-card:hover .gallery-overlay {
          transform: translateY(0);
        }

        .gallery-title {
          color: white;
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .gallery-date {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.9rem;
          margin: 0;
        }

        .gallery-action {
          color: white;
          font-size: 1.2rem;
          opacity: 0.8;
        }

        /* Blog Section */
        .blog-section {
          padding: 120px 0;
          background: white;
        }

        .blog-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
          transition: all 0.4s ease;
          height: 100%;
        }

        .blog-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.15);
        }

        .blog-image-container {
          position: relative;
          height: 250px;
          overflow: hidden;
        }

        .blog-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        .blog-card:hover .blog-image {
          transform: scale(1.1);
        }

        .blog-category {
          position: absolute;
          top: 1rem;
          left: 1rem;
          z-index: 2;
        }

        .category-badge {
          font-size: 0.8rem;
          font-weight: 600;
          padding: 0.5rem 1rem;
          border-radius: 20px;
          border: none;
        }

        .blog-content {
          padding: 2rem;
        }

        .blog-meta {
          display: flex;
          gap: 1rem;
          margin-bottom: 1rem;
          font-size: 0.9rem;
          color: #718096;
        }

        .blog-title {
          font-size: 1.3rem;
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 1rem;
          line-height: 1.4;
        }

        .blog-excerpt {
          color: #718096;
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .blog-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .blog-link {
          color: #e9a319;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .blog-link:hover {
          color: #f4b942;
          transform: translateX(5px);
        }

        .blog-actions {
          display: flex;
          gap: 0.5rem;
        }

        .action-btn {
          background: none;
          border: none;
          color: #718096;
          font-size: 1.1rem;
          padding: 0.5rem;
          border-radius: 50%;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .action-btn:hover {
          color: #e9a319;
          background: rgba(233, 163, 25, 0.1);
        }

        /* Error State */
        .error-container {
          text-align: center;
          padding: 3rem;
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          max-width: 500px;
          margin: 0 auto;
        }

        .error-icon {
          font-size: 4rem;
          color: #e53e3e;
          margin-bottom: 1.5rem;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }

          .hero-actions {
            flex-direction: column;
            align-items: stretch;
          }

          .hero-actions .btn {
            margin-bottom: 1rem;
          }

          .about-stats {
            flex-direction: column;
          }

          .floating-stat {
            display: none;
          }

          .features-section,
          .about-section,
          .gallery-section,
          .blog-section {
            padding: 80px 0;
          }
        }

        @media (max-width: 576px) {
          .hero-content {
            padding: 2rem 1rem;
          }

          .section-header {
            margin-bottom: 2rem;
          }

          .feature-card,
          .blog-card {
            margin-bottom: 2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
