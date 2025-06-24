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
  ListGroup,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { format } from "date-fns";
import { listBlogs } from "../../Modules/controllers/blogController";
import {
  listCategories,
  getCategoryById,
} from "../../Modules/controllers/categoryController";
import {
  getBlogCategories,
  getCategoryBlogs,
} from "../../Modules/controllers/blogCategoryController";
import { motion, AnimatePresence } from "framer-motion";

const Blog = () => {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryDescriptions, setCategoryDescriptions] = useState({});
  const [blogCategories, setBlogCategories] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [categoryStats, setCategoryStats] = useState({});
  const [showCategoryInfo, setShowCategoryInfo] = useState(false);
  const [selectedCategoryInfo, setSelectedCategoryInfo] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);

  const blogsPerPage = 6;

  // Enhanced theme
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

  // Enhanced animation variants
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
        transition: {
          staggerChildren: 0.15,
          delayChildren: 0.1,
        },
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

  const categoryVariants = ["primary", "danger", "success", "info"];

  // Search suggestions generator
  useEffect(() => {
    if (searchTerm.length > 0) {
      const suggestions = blogs
        .filter(
          (blog) =>
            blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            blog.content.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .slice(0, 5)
        .map((blog) => blog.title);
      setSearchSuggestions(suggestions);
    } else {
      setSearchSuggestions([]);
    }
  }, [searchTerm, blogs]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const blogsResponse = await listBlogs();
        if (blogsResponse.success) {
          setBlogs(blogsResponse.blogs);
        } else {
          throw new Error(blogsResponse.message || "Failed to fetch blogs");
        }

        const categoriesResponse = await listCategories();
        if (categoriesResponse.success) {
          setCategories(categoriesResponse.categories);

          const descriptionsObj = {};
          const statsObj = {};

          for (const category of categoriesResponse.categories) {
            const categoryInfo = await getCategoryById(category.id);
            if (categoryInfo.success) {
              descriptionsObj[category.id] = categoryInfo.category.description;
            }

            const categoryBlogs = await getCategoryBlogs(category.id);
            if (categoryBlogs.success) {
              statsObj[category.id] = categoryBlogs.blogs.length;
            } else {
              statsObj[category.id] = 0;
            }
          }

          setCategoryDescriptions(descriptionsObj);
          setCategoryStats(statsObj);
        }

        const categoriesMap = {};
        for (const blog of blogsResponse.blogs) {
          const response = await getBlogCategories(blog.id);
          if (response.success) {
            categoriesMap[blog.id] = response.categories;
          } else {
            categoriesMap[blog.id] = [];
          }
        }
        setBlogCategories(categoriesMap);
      } catch (err) {
        setError(err.message || "An unexpected error occurred");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleOpenDetail = (blog) => {
    setSelectedBlog(blog);
    setShowDetailModal(true);
  };

  const handleShowCategoryInfo = (category) => {
    setSelectedCategoryInfo(category);
    setShowCategoryInfo(true);
  };

  const getCategoryVariant = (categoryId) => {
    const index = categoryId % 4;
    return categoryVariants[index];
  };

  const filteredAndSortedBlogs = useMemo(() => {
    const filtered = blogs.filter((blog) => {
      const matchesSearch =
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        !selectedCategory ||
        (blogCategories[blog.id] &&
          blogCategories[blog.id].some(
            (cat) => cat.id === parseInt(selectedCategory)
          ));
      return matchesSearch && matchesCategory;
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
  }, [blogs, searchTerm, selectedCategory, blogCategories, sortBy]);

  const currentBlogs = useMemo(() => {
    const startIndex = (currentPage - 1) * blogsPerPage;
    return filteredAndSortedBlogs.slice(startIndex, startIndex + blogsPerPage);
  }, [filteredAndSortedBlogs, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedBlogs.length / blogsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    document
      .getElementById("blog-section")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const stripHtml = (html) => {
    if (!html) return "";
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  const truncateText = (text, maxLength) => {
    if (!text) return "";
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

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

  return (
    <div className="modern-blog">
      {/* Enhanced Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          {/* Animated particles */}
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
                    <i className="fas fa-newspaper me-2"></i>
                    Discover Knowledge
                  </div>
                  <h1 className="hero-title">
                    Latest
                    <span className="gradient-text"> Blogs and Articles</span>
                  </h1>
                  <div className="title-divider"></div>
                  <p className="hero-description">
                    Find inspiration, insights, and the latest news about the
                    world of herbs, horticulture, and science innovation in
                    Indonesia. Explore selected articles and the latest updates
                    from TSTH².
                  </p>

                  <div className="hero-stats">
                    <motion.div
                      className="stat-item"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="stat-number">{blogs.length}</div>
                      <div className="stat-label">Articles</div>
                    </motion.div>
                    <motion.div
                      className="stat-item"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="stat-number">{categories.length}</div>
                      <div className="stat-label">Categories</div>
                    </motion.div>
                    <motion.div
                      className="stat-item"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="stat-number">24/7</div>
                      <div className="stat-label">Updates</div>
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
                      <i className="fas fa-blog"></i>
                    </motion.div>

                    {/* Floating elements */}
                    <motion.div
                      className="floating-element element-1"
                      animate={{ y: [0, -20, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <i className="fas fa-pen-fancy"></i>
                    </motion.div>
                    <motion.div
                      className="floating-element element-2"
                      animate={{ y: [0, 20, 0] }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                    >
                      <i className="fas fa-lightbulb"></i>
                    </motion.div>
                  </div>
                </motion.div>
              </Col>
            </Row>
          </Container>
        </div>
      </section>

      {/* Enhanced Blog Content */}
      <Container fluid className="blog-content-section" id="blog-section">
        <Container>
          <Row>
            {/* Main Content */}
            <Col lg={9}>
              {/* Enhanced Filters Bar */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={animations.fadeInUp}
                className="filters-container"
              >
                <div className="filters-header">
                  <h3 className="filters-title text-light">
                    <i className="fas fa-filter me-2"></i>
                    Find Your Perfect Read
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
                    <div className="search-container">
                      <InputGroup className="search-input-group">
                        <InputGroup.Text>
                          <i className="fas fa-search"></i>
                        </InputGroup.Text>
                        <Form.Control
                          placeholder="Search articles..."
                          value={searchTerm}
                          onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                          }}
                          onFocus={() => setShowSearchSuggestions(true)}
                          onBlur={() =>
                            setTimeout(
                              () => setShowSearchSuggestions(false),
                              200
                            )
                          }
                        />
                      </InputGroup>

                      <AnimatePresence>
                        {showSearchSuggestions &&
                          searchSuggestions.length > 0 && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="search-suggestions"
                            >
                              {searchSuggestions.map((suggestion, index) => (
                                <div
                                  key={index}
                                  className="suggestion-item"
                                  onClick={() => {
                                    setSearchTerm(suggestion);
                                    setShowSearchSuggestions(false);
                                  }}
                                >
                                  <i className="fas fa-search me-2"></i>
                                  {suggestion}
                                </div>
                              ))}
                            </motion.div>
                          )}
                      </AnimatePresence>
                    </div>
                  </Col>

                  <Col lg={4} md={6} className="mb-3">
                    <Form.Select
                      value={selectedCategory || ""}
                      onChange={(e) => {
                        setSelectedCategory(e.target.value || null);
                        setCurrentPage(1);
                      }}
                      className="filter-select"
                    >
                      <option value="">All Categories</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name} ({categoryStats[category.id] || 0})
                        </option>
                      ))}
                    </Form.Select>
                  </Col>

                  <Col lg={4} md={12} className="mb-3">
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
                </Row>

                {/* Results Summary */}
                <div className="results-summary">
                  <span className="results-text">
                    Showing{" "}
                    {Math.min(blogsPerPage, filteredAndSortedBlogs.length)} of{" "}
                    {filteredAndSortedBlogs.length} articles
                    {selectedCategory && (
                      <Badge bg="primary" className="ms-2">
                        Category:{" "}
                        {
                          categories.find(
                            (c) => c.id.toString() === selectedCategory
                          )?.name
                        }
                      </Badge>
                    )}
                  </span>
                  {(searchTerm || selectedCategory) && (
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedCategory(null);
                        setCurrentPage(1);
                      }}
                    >
                      <i className="fas fa-times me-1"></i>
                      Clear Filters
                    </Button>
                  )}
                </div>
              </motion.div>

              {/* Blog Posts Grid/List */}
              <motion.div
                variants={animations.staggerContainer}
                initial="hidden"
                animate="visible"
                className={`blog-posts-container ${viewMode}`}
              >
                <AnimatePresence mode="wait">
                  {currentBlogs.length > 0 ? (
                    <Row className="g-4">
                      {currentBlogs.map((blog, index) => (
                        <Col
                          lg={viewMode === "grid" ? 6 : 12}
                          md={viewMode === "grid" ? 6 : 12}
                          key={blog.id}
                        >
                          <motion.div
                            variants={animations.scaleIn}
                            whileHover={{ y: -10 }}
                            transition={{ duration: 0.3 }}
                            className={`blog-card ${viewMode}`}
                          >
                            <div className="blog-card-inner">
                              <div className="blog-image-container">
                                <img
                                  src={blog.photo_url}
                                  alt={blog.title}
                                  className="blog-image"
                                />
                                <div className="image-overlay">
                                  <Button
                                    variant="light"
                                    size="sm"
                                    className="read-btn"
                                    onClick={() => handleOpenDetail(blog)}
                                  >
                                    <i className="fas fa-book-open me-2"></i>
                                    Read Article
                                  </Button>
                                </div>
                              </div>

                              <div className="blog-content">
                                <div className="blog-meta">
                                  <div className="categories">
                                    {blogCategories[blog.id]
                                      ?.slice(0, 2)
                                      .map((category) => (
                                        <Badge
                                          key={category.id}
                                          className="category-badge"
                                          style={{
                                            backgroundColor: theme.primary,
                                          }}
                                          onClick={() =>
                                            setSelectedCategory(
                                              category.id.toString()
                                            )
                                          }
                                        >
                                          {category.name}
                                        </Badge>
                                      ))}
                                    {blogCategories[blog.id]?.length > 2 && (
                                      <Badge
                                        variant="light"
                                        className="more-categories text-muted"
                                      >
                                        +{blogCategories[blog.id].length - 2}{" "}
                                        more
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="blog-date">
                                    <i className="far fa-calendar-alt me-1"></i>
                                    {format(
                                      new Date(blog.created_at),
                                      "MMM d, yyyy"
                                    )}
                                  </div>
                                </div>

                                <h4 className="blog-title">{blog.title}</h4>
                                <p className="blog-excerpt">
                                  {truncateText(
                                    stripHtml(blog.content),
                                    viewMode === "list" ? 200 : 120
                                  )}
                                </p>

                                <div className="blog-footer">
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="read-more-btn"
                                    onClick={() => handleOpenDetail(blog)}
                                  >
                                    Read More
                                    <i className="fas fa-arrow-right ms-2"></i>
                                  </motion.button>
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
                        <h4>No articles found</h4>
                        <p>Try adjusting your search terms or filters</p>
                        <Button
                          variant="primary"
                          onClick={() => {
                            setSearchTerm("");
                            setSelectedCategory(null);
                            setCurrentPage(1);
                          }}
                        >
                          <i className="fas fa-refresh me-2"></i>
                          Reset Filters
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Enhanced Pagination */}
              {filteredAndSortedBlogs.length > 0 && totalPages > 1 && (
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

            {/* Enhanced Sidebar */}
            <Col lg={3}>
              <div className="sidebar-sticky">
                {/* Categories Card */}
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={animations.slideInRight}
                  className="sidebar-card categories-card"
                >
                  <div className="card-header">
                    <h5>
                      <i className="fas fa-tags me-2"></i>Categories
                    </h5>
                  </div>
                  <div className="card-body">
                    <div className="category-list">
                      <motion.div
                        className={`category-item ${
                          !selectedCategory ? "active" : ""
                        }`}
                        onClick={() => setSelectedCategory(null)}
                        whileHover={{ x: 5 }}
                      >
                        <span className="category-name">All Categories</span>
                        <Badge className="category-count">{blogs.length}</Badge>
                      </motion.div>

                      {categories.map((category) => (
                        <OverlayTrigger
                          key={category.id}
                          placement="left"
                          overlay={
                            <Tooltip>
                              {categoryDescriptions[category.id] ||
                                "No description available"}
                            </Tooltip>
                          }
                        >
                          <motion.div
                            className={`category-item ${
                              selectedCategory === category.id.toString()
                                ? "active"
                                : ""
                            }`}
                            onClick={() =>
                              setSelectedCategory(category.id.toString())
                            }
                            whileHover={{ x: 5 }}
                          >
                            <div className="category-info">
                              <div className="category-dot"></div>
                              <span className="category-name">
                                {category.name}
                              </span>
                            </div>
                            <Badge className="category-count">
                              {categoryStats[category.id] || 0}
                            </Badge>
                          </motion.div>
                        </OverlayTrigger>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* Featured Categories */}
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={animations.slideInRight}
                  transition={{ delay: 0.2 }}
                  className="sidebar-card featured-card"
                >
                  <div className="card-header">
                    <h5>
                      <i className="fas fa-star me-2"></i>Featured
                    </h5>
                  </div>
                  <div className="card-body">
                    {categories.slice(0, 3).map((category, index) => (
                      <motion.div
                        key={category.id}
                        className="featured-item"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 * index }}
                      >
                        <h6 className="featured-title">{category.name}</h6>
                        <p className="featured-description">
                          {truncateText(
                            categoryDescriptions[category.id] ||
                              "No description available",
                            60
                          )}
                        </p>
                        <Button
                          variant="link"
                          size="sm"
                          onClick={() => handleShowCategoryInfo(category)}
                          className="featured-link"
                        >
                          Learn More <i className="fas fa-arrow-right ms-1"></i>
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Recent Posts */}
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={animations.slideInRight}
                  transition={{ delay: 0.4 }}
                  className="sidebar-card recent-card"
                >
                  <div className="card-header">
                    <h5>
                      <i className="fas fa-clock me-2"></i>Recent Posts
                    </h5>
                  </div>
                  <div className="card-body">
                    {blogs.slice(0, 4).map((blog, index) => (
                      <motion.div
                        key={blog.id}
                        className="recent-item"
                        onClick={() => handleOpenDetail(blog)}
                        whileHover={{ scale: 1.02 }}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                      >
                        <div className="recent-image">
                          <img src={blog.photo_url} alt={blog.title} />
                        </div>
                        <div className="recent-content">
                          <h6 className="recent-title">
                            {truncateText(blog.title, 35)}
                          </h6>
                          <small className="recent-date">
                            {format(new Date(blog.created_at), "MMM d, yyyy")}
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

      {/* Enhanced Blog Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedBlog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-backdrop"
            onClick={() => setShowDetailModal(false)}
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
                    <h3 className="modal-title">{selectedBlog.title}</h3>
                    <div className="modal-meta">
                      <span className="modal-date">
                        <i className="far fa-calendar-alt me-1"></i>
                        {format(
                          new Date(selectedBlog.created_at),
                          "MMMM d, yyyy"
                        )}
                      </span>
                      {selectedBlog.created_at !== selectedBlog.updated_at && (
                        <span className="modal-updated">
                          <i className="far fa-edit me-1"></i>
                          Updated:{" "}
                          {format(
                            new Date(selectedBlog.updated_at),
                            "MMM d, yyyy"
                          )}
                        </span>
                      )}
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
                    {blogCategories[selectedBlog.id]?.map((category) => (
                      <Badge
                        key={category.id}
                        className="modal-category-badge"
                        style={{ backgroundColor: theme.primary }}
                      >
                        {category.name}
                      </Badge>
                    ))}
                  </div>

                  <div className="modal-image-container">
                    <img
                      src={selectedBlog.photo_url}
                      alt={selectedBlog.title}
                      className="modal-image"
                    />
                  </div>

                  <div
                    className="modal-content"
                    dangerouslySetInnerHTML={{ __html: selectedBlog.content }}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Info Modal */}
      <Modal
        show={showCategoryInfo}
        onHide={() => setShowCategoryInfo(false)}
        centered
        className="category-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>{selectedCategoryInfo?.name || "Category"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCategoryInfo && (
            <>
              <p className="category-description">
                {categoryDescriptions[selectedCategoryInfo.id] ||
                  "No description available."}
              </p>
              <div className="category-stats">
                <div className="stat">
                  <span className="stat-number">
                    {categoryStats[selectedCategoryInfo.id] || 0}
                  </span>
                  <span className="stat-label">Articles</span>
                </div>
              </div>
              <Button
                variant="primary"
                onClick={() => {
                  setSelectedCategory(selectedCategoryInfo.id.toString());
                  setShowCategoryInfo(false);
                  document
                    .getElementById("blog-section")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="w-100 mt-3"
              >
                <i className="fas fa-list me-2"></i>
                View All Articles
              </Button>
            </>
          )}
        </Modal.Body>
      </Modal>

      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap");

        .modern-blog {
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

        /* Blog Content Section */
        .blog-content-section {
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

        .search-suggestions {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: white;
          border-radius: 8px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          margin-top: 0.5rem;
          border: 1px solid #e2e8f0;
        }

        .suggestion-item {
          padding: 0.75rem 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          color: #4a5568;
        }

        .suggestion-item:hover {
          background: ${theme.light};
          color: ${theme.primary};
        }

        .suggestion-item:first-child {
          border-radius: 8px 8px 0 0;
        }

        .suggestion-item:last-child {
          border-radius: 0 0 8px 8px;
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

        /* Blog Cards */
        .blog-posts-container {
          min-height: 400px;
        }

        .blog-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: ${theme.shadows.card};
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          height: 100%;
        }

        .blog-card:hover {
          box-shadow: ${theme.shadows.hover};
        }

        .blog-card.list {
          border-radius: 15px;
        }

        .blog-card.list .blog-card-inner {
          display: flex;
          align-items: stretch;
        }

        .blog-card.list .blog-image-container {
          width: 300px;
          flex-shrink: 0;
        }

        .blog-card.list .blog-content {
          flex: 1;
          padding: 2rem;
        }

        .blog-card-inner {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .blog-image-container {
          position: relative;
          height: 250px;
          overflow: hidden;
        }

        .blog-card.list .blog-image-container {
          height: auto;
        }

        .blog-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .blog-card:hover .blog-image {
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

        .blog-card:hover .image-overlay {
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

        .blog-content {
          padding: 2rem;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .blog-meta {
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

        .more-categories {
          background: #e2e8f0;
          color: #718096;
        }

        .blog-date {
          color: #718096;
          font-size: 0.9rem;
          white-space: nowrap;
        }

        .blog-title {
          font-size: 1.3rem;
          font-weight: 700;
          color: ${theme.dark};
          margin-bottom: 1rem;
          line-height: 1.4;
          flex-shrink: 0;
        }

        .blog-excerpt {
          color: #718096;
          line-height: 1.6;
          margin-bottom: 1.5rem;
          flex: 1;
        }

        .blog-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
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
          cursor: pointer;
          transition: all 0.3s ease;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .action-btn:hover {
          color: ${theme.primary};
          background: rgba(233, 163, 25, 0.1);
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

        .sidebar-card .card-header h5 {
          margin: 0;
          font-weight: 600;
        }

        .sidebar-card .card-body {
          padding: 0;
        }

        /* Categories */
        .category-list {
          padding: 1rem;
        }

        .category-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: 0.5rem;
        }

        .category-item:hover {
          background: rgba(233, 163, 25, 0.1);
        }

        .category-item.active {
          background: rgba(233, 163, 25, 0.15);
          border-left: 4px solid ${theme.primary};
        }

        .category-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .category-dot {
          width: 8px;
          height: 8px;
          background: ${theme.primary};
          border-radius: 50%;
        }

        .category-name {
          font-weight: 500;
          color: ${theme.dark};
        }

        .category-count {
          background: ${theme.primary};
          color: white;
          font-size: 0.8rem;
          padding: 0.3rem 0.6rem;
          border-radius: 12px;
        }

        /* Featured Categories */
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

        /* Recent Posts */
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
        .modal-backdrop {
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
          z-index: 2000;
          padding: 2rem;
        }

        .modal-container {
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
          color: #000; /* Or any other color that provides sufficient contrast */
        }

        .modal-content img {
          max-width: 100%;
          height: auto;
          margin: 2rem 0;
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }

        .modal-content h1,
        .modal-content h2,
        .modal-content h3,
        .modal-content h4,
        .modal-content h5,
        .modal-content h6 {
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: #000;
          font-weight: 600;
        }

        .modal-content p {
          margin-bottom: 1.5rem;
        }

        .modal-content ul,
        .modal-content ol {
          margin-bottom: 1.5rem;
          padding-left: 2rem;
        }

        .modal-content li {
          margin-bottom: 0.5rem;
        }

        .modal-content a {
          color: ${theme.primary};
          text-decoration: none;
          font-weight: 500;
        }

        .modal-content a:hover {
          text-decoration: underline;
        }

        .modal-content blockquote {
          background: ${theme.light};
          border-left: 4px solid ${theme.primary};
          padding: 1.5rem;
          margin: 2rem 0;
          border-radius: 0 8px 8px 0;
          font-style: italic;
        }

        .modal-content code {
          background: ${theme.light};
          padding: 0.2rem 0.4rem;
          border-radius: 4px;
          font-family: "Courier New", monospace;
          font-size: 0.9em;
          color: ${theme.primary};
        }

        .modal-content pre {
          background: ${theme.light};
          padding: 1.5rem;
          border-radius: 8px;
          overflow-x: auto;
          margin: 1.5rem 0;
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

        .action-btn-large {
          background: white;
          border: 2px solid ${theme.primary};
          color: ${theme.primary};
          padding: 0.75rem 1.5rem;
          border-radius: 25px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
        }

        .action-btn-large:hover {
          background: ${theme.primary};
          color: white;
        }

        /* Category Modal */
        .category-modal .modal-content {
          border-radius: 20px;
          border: none;
          box-shadow: ${theme.shadows.card};
        }

        .category-modal .modal-header {
          background: ${theme.gradients.secondary};
          color: white;
          border: none;
          border-radius: 20px 20px 0 0;
        }

        .category-description {
          font-size: 1.1rem;
          line-height: 1.7;
          color: #4a5568;
          margin-bottom: 2rem;
        }

        .category-stats {
          background: ${theme.light};
          border-radius: 12px;
          padding: 1.5rem;
          text-align: center;
          margin-bottom: 1rem;
        }

        .category-stats .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .category-stats .stat-number {
          font-size: 2rem;
          font-weight: 700;
          color: ${theme.primary};
          line-height: 1;
        }

        .category-stats .stat-label {
          font-size: 0.9rem;
          color: #718096;
          font-weight: 500;
          margin-top: 0.25rem;
        }

        /* Error Container */
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

          .blog-card.list .blog-card-inner {
            flex-direction: column;
          }

          .blog-card.list .blog-image-container {
            width: 100%;
            height: 250px;
          }

          .blog-card.list .blog-content {
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

          .blog-content-section {
            padding: 60px 0;
          }

          .filters-container {
            padding: 1.5rem;
            margin-bottom: 2rem;
          }

          .filters-title {
            font-size: 1.2rem;
          }

          .blog-meta {
            flex-direction: column;
            gap: 0.75rem;
          }

          .blog-footer {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .blog-actions {
            align-self: flex-end;
          }

          .modal-backdrop {
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
          .filters-row .col-md-6,
          .filters-row .col-md-12 {
            margin-bottom: 1rem;
          }

          .blog-card {
            margin-bottom: 2rem;
          }

          .blog-content {
            padding: 1.5rem;
          }

          .blog-title {
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

          .modal-container {
            margin: 1rem 0;
          }

          .custom-pagination {
            justify-content: center;
            flex-wrap: wrap;
          }
        }

        /* Custom Scrollbar */
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

        /* Animation Classes */
        .fade-enter {
          opacity: 0;
        }

        .fade-enter-active {
          opacity: 1;
          transition: opacity 300ms;
        }

        .fade-exit {
          opacity: 1;
        }

        .fade-exit-active {
          opacity: 0;
          transition: opacity 300ms;
        }

        /* Print Styles */
        @media print {
          .modern-blog {
            color: black;
          }

          .hero-section,
          .filters-container,
          .sidebar-sticky,
          .pagination-container {
            display: none;
          }

          .blog-card {
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

        /* Dark Mode Support (Optional) */
        @media (prefers-color-scheme: dark) {
          .modern-blog {
            background: #1a202c;
            color: white;
          }

          .blog-card,
          .sidebar-card,
          .filters-container {
            background: #2d3748;
            color: white;
          }

          .blog-title,
          .category-name,
          .recent-title {
            color: white;
          }

          .blog-excerpt,
          .blog-date,
          .recent-date {
            color: #a0aec0;
          }
        }

        /* High Contrast Mode Support */
        @media (prefers-contrast: high) {
          .blog-card {
            border: 2px solid ${theme.dark};
          }

          .category-badge,
          .read-more-btn {
            border: 2px solid ${theme.dark};
          }
        }

        /* Reduced Motion Support */
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
        }
      `}</style>
    </div>
  );
};

export default Blog;
