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
  const blogsPerPage = 6;

  // Simple color definitions
  const primaryColor = "#E9A319"; // gold
  const greyColor = "#6c757d"; // grey

  // Bootstrap colors for categories
  const categoryVariants = ["primary", "danger", "success", "info"];

  // Fetch blogs and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch blogs
        const blogsResponse = await listBlogs();
        if (blogsResponse.success) {
          setBlogs(blogsResponse.blogs);
        } else {
          throw new Error(blogsResponse.message || "Failed to fetch blogs");
        }

        // Fetch categories
        const categoriesResponse = await listCategories();
        if (categoriesResponse.success) {
          setCategories(categoriesResponse.categories);

          // Get detailed info for each category including description
          const descriptionsObj = {};
          const statsObj = {};

          for (const category of categoriesResponse.categories) {
            // Get category detailed info including description
            const categoryInfo = await getCategoryById(category.id);
            if (categoryInfo.success) {
              descriptionsObj[category.id] = categoryInfo.category.description;
            }

            // Get number of blogs in each category for stats
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

        // Fetch categories for each blog
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

  // Open blog detail modal
  const handleOpenDetail = (blog) => {
    setSelectedBlog(blog);
    setShowDetailModal(true);
  };

  // Show category info modal
  const handleShowCategoryInfo = (category) => {
    setSelectedCategoryInfo(category);
    setShowCategoryInfo(true);
  };

  // Get category variant by index (primary, danger, success, info)
  const getCategoryVariant = (categoryId) => {
    const index = categoryId % 4;
    return categoryVariants[index];
  };

  // Filter and sort blogs
  const filteredAndSortedBlogs = useMemo(() => {
    // First filter
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
  }, [blogs, searchTerm, selectedCategory, blogCategories, sortBy]);

  // Pagination
  const currentBlogs = useMemo(() => {
    const startIndex = (currentPage - 1) * blogsPerPage;
    return filteredAndSortedBlogs.slice(startIndex, startIndex + blogsPerPage);
  }, [filteredAndSortedBlogs, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedBlogs.length / blogsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top of the blog section
    document
      .getElementById("blog-section")
      .scrollIntoView({ behavior: "smooth" });
  };

  // Extract text content from HTML
  const stripHtml = (html) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  // Truncate description for previews
  const truncateText = (text, maxLength) => {
    if (!text) return "";
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  // Loading state
  if (loading) {
    return (
      <Container className="py-5 text-center" style={{ minHeight: "70vh" }}>
        <Spinner animation="border" role="status" variant="warning">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading blog posts...</p>
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
      {/* Hero Section */}
      <div
        className="text-white py-5"
        style={{
          background: greyColor,
          padding: "60px 0",
        }}
      >
        <Container>
          <Row className="align-items-center">
            <Col md={8} className="text-md-start text-center">
              <h1
                className="display-4 fw-bold mb-2"
                style={{
                  fontFamily: "Roboto, monospace",
                  letterSpacing: "1.5px",
                  fontSize: "40px",
                  fontWeight: "600",
                }}
              >
                Our Blog
              </h1>
              <p className="lead mb-4">
                <i className="fas fa-info-circle me-2"></i>
                Discover the latest trends, expert insights, and valuable tips
                in the dairy industry. Stay informed and inspired with our
                curated blog content.
              </p>
            </Col>
            <Col md={4} className="d-none d-md-block">
              <div className="text-end">
                <i className="fas fa-newspaper fa-5x"></i>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Blog Content */}
      <Container className="py-5" id="blog-section">
        <Row>
          {/* Main Content - Blog Posts */}
          <Col lg={9}>
            {/* Filters */}
            <Row className="mb-4">
              <Col lg={4} md={6} className="mb-3">
                <InputGroup>
                  <InputGroup.Text className="bg-white">
                    <i className="fas fa-search text-muted"></i>
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Search blogs..."
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
                  value={selectedCategory || ""}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value || null);
                    setCurrentPage(1);
                  }}
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
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
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="alphabetical">Alphabetical</option>
                </Form.Select>
              </Col>
            </Row>

            {/* Blog Posts */}
            <Row className="g-4">
              {currentBlogs.length > 0 ? (
                currentBlogs.map((blog) => (
                  <Col lg={6} md={6} key={blog.id}>
                    <Card
                      className="h-100 shadow-sm hover-shadow"
                      style={{ borderRadius: "8px", overflow: "hidden" }}
                    >
                      <div style={{ height: "200px", overflow: "hidden" }}>
                        <Card.Img
                          variant="top"
                          src={blog.photo_url}
                          alt={blog.title}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                          className="hover-zoom"
                        />
                      </div>
                      <Card.Body>
                        <div className="d-flex flex-wrap gap-2 mb-2">
                          {blogCategories[blog.id]?.map((category) => (
                            <Badge
                              key={category.id}
                              pill
                              bg={getCategoryVariant(category.id)}
                              style={{
                                cursor: "pointer",
                                padding: "5px 10px",
                              }}
                              onClick={() =>
                                setSelectedCategory(category.id.toString())
                              }
                            >
                              {category.name}
                            </Badge>
                          ))}
                          {(!blogCategories[blog.id] ||
                            blogCategories[blog.id].length === 0) && (
                            <Badge pill bg="light" text="dark">
                              Uncategorized
                            </Badge>
                          )}
                        </div>
                        <Card.Title className="mb-2 h5">
                          {blog.title}
                        </Card.Title>
                        <Card.Text className="text-muted small">
                          {truncateText(stripHtml(blog.content), 120)}
                        </Card.Text>
                        <div className="d-flex justify-content-between align-items-center mt-3">
                          <small className="text-muted">
                            <i className="far fa-calendar-alt me-2"></i>
                            {format(new Date(blog.created_at), "MMM d, yyyy")}
                          </small>
                          <Button
                            variant="outline-warning"
                            size="sm"
                            onClick={() => handleOpenDetail(blog)}
                            style={{
                              color: primaryColor,
                              borderColor: primaryColor,
                            }}
                            className="read-more-btn"
                          >
                            Read More
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))
              ) : (
                <Col xs={12} className="text-center py-5">
                  <i className="fas fa-search fa-3x text-muted mb-3"></i>
                  <h4>No blog posts found</h4>
                  <p className="text-muted">
                    Try changing your search or filters
                  </p>
                  <Button
                    variant="warning"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory(null);
                    }}
                    style={{
                      backgroundColor: primaryColor,
                      borderColor: primaryColor,
                    }}
                  >
                    Clear Filters
                  </Button>
                </Col>
              )}
            </Row>

            {/* Pagination */}
            {filteredAndSortedBlogs.length > 0 && (
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
          </Col>

          {/* Sidebar - Categories */}
          <Col lg={3}>
            <div className="sticky-top" style={{ top: "20px" }}>
              {/* Categories Card */}
              <Card className="mb-4 shadow-sm">
                <Card.Header
                  style={{
                    background: greyColor,
                    color: "white",
                  }}
                >
                  <h5 className="mb-0">
                    <i className="fas fa-tags me-2"></i>Categories
                  </h5>
                </Card.Header>
                <ListGroup variant="flush">
                  <ListGroup.Item
                    action
                    active={!selectedCategory}
                    onClick={() => setSelectedCategory(null)}
                    className="d-flex justify-content-between align-items-center"
                    style={
                      !selectedCategory
                        ? {
                            backgroundColor: "#fff9e6",
                            borderLeft: `3px solid ${primaryColor}`,
                          }
                        : {}
                    }
                  >
                    <span className="d-flex align-items-center text-dark">
                      All Categories
                    </span>
                    <Badge
                      pill
                      bg="warning"
                      style={{
                        backgroundColor: primaryColor,
                      }}
                    >
                      {blogs.length}
                    </Badge>
                  </ListGroup.Item>

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
                      <ListGroup.Item
                        action
                        active={selectedCategory === category.id.toString()}
                        onClick={() =>
                          setSelectedCategory(category.id.toString())
                        }
                        className="d-flex justify-content-between align-items-center"
                        style={
                          selectedCategory === category.id.toString()
                            ? {
                                backgroundColor: "#fff9e6",
                                borderLeft: `3px solid ${primaryColor}`,
                                color: "black", // This ensures text stays black when active
                              }
                            : {}
                        }
                      >
                        <div className="d-flex align-items-center">
                          <span
                            className="me-2"
                            style={{
                              backgroundColor: primaryColor,
                              width: "10px",
                              height: "10px",
                              borderRadius: "50%",
                              display: "inline-block",
                              color: "black",
                            }}
                          ></span>
                          <span>{category.name}</span>
                        </div>
                        <Badge pill bg={getCategoryVariant(category.id)}>
                          {categoryStats[category.id] || 0}
                        </Badge>
                      </ListGroup.Item>
                    </OverlayTrigger>
                  ))}
                </ListGroup>
              </Card>

              {/* Category Descriptions Card */}
              <Card className="shadow-sm">
                <Card.Header
                  style={{
                    background: greyColor,
                    color: "white",
                  }}
                >
                  <h5 className="mb-0">
                    <i className="fas fa-info-circle me-2"></i>Featured
                    Categories
                  </h5>
                </Card.Header>
                <Card.Body className="p-0">
                  {categories.slice(0, 4).map((category) => (
                    <div key={category.id} className="p-3 border-bottom">
                      <h6
                        className="mb-2"
                        style={{
                          color: primaryColor,
                          fontWeight: "600",
                        }}
                      >
                        {category.name}
                      </h6>
                      <p className="small text-muted mb-2">
                        {truncateText(
                          categoryDescriptions[category.id] ||
                            "No description available",
                          70
                        )}
                      </p>
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0"
                        onClick={() => handleShowCategoryInfo(category)}
                        style={{ color: primaryColor }}
                      >
                        Learn More
                      </Button>
                    </div>
                  ))}
                </Card.Body>
              </Card>

              {/* Recent Posts Teaser */}
              <Card className="mt-4 shadow-sm">
                <Card.Header
                  style={{
                    background: greyColor,
                    color: "white",
                  }}
                >
                  <h5 className="mb-0">
                    <i className="fas fa-clock me-2"></i>Recent Posts
                  </h5>
                </Card.Header>
                <ListGroup variant="flush">
                  {blogs.slice(0, 3).map((blog) => (
                    <ListGroup.Item
                      key={blog.id}
                      action
                      onClick={() => handleOpenDetail(blog)}
                    >
                      <div className="d-flex align-items-center">
                        <div className="flex-shrink-0 me-3">
                          <img
                            src={blog.photo_url}
                            alt={blog.title}
                            style={{
                              width: "50px",
                              height: "50px",
                              objectFit: "cover",
                              borderRadius: "4px",
                            }}
                          />
                        </div>
                        <div>
                          <h6 className="mb-0 small">
                            {truncateText(blog.title, 40)}
                          </h6>
                          <small className="text-muted">
                            {format(new Date(blog.created_at), "MMM d, yyyy")}
                          </small>
                        </div>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Blog Detail Modal */}
      <Modal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{selectedBlog?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBlog && (
            <>
              <div className="mb-3 d-flex flex-wrap gap-2">
                {blogCategories[selectedBlog.id]?.map((category) => (
                  <Badge
                    key={category.id}
                    pill
                    bg={getCategoryVariant(category.id)}
                  >
                    {category.name}
                  </Badge>
                ))}
              </div>
              <div className="text-muted mb-3 small">
                <i className="far fa-calendar-alt me-2"></i>
                Published:{" "}
                {format(new Date(selectedBlog.created_at), "MMMM d, yyyy")}
                {selectedBlog.created_at !== selectedBlog.updated_at && (
                  <>
                    <i className="far fa-edit ms-3 me-2"></i>
                    Updated:{" "}
                    {format(new Date(selectedBlog.updated_at), "MMMM d, yyyy")}
                  </>
                )}
              </div>
              <div className="text-center mb-4">
                <img
                  src={selectedBlog.photo_url}
                  alt={selectedBlog.title}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "400px",
                    objectFit: "contain",
                    borderRadius: "8px",
                  }}
                  className="shadow-sm"
                />
              </div>
              <div
                className="blog-content"
                dangerouslySetInnerHTML={{ __html: selectedBlog.content }}
              />
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Close
          </Button>
          <Button
            variant="warning"
            onClick={() => setShowDetailModal(false)}
            style={{
              backgroundColor: primaryColor,
              borderColor: primaryColor,
            }}
          >
            Back to Blog
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Category Info Modal */}
      <Modal
        show={showCategoryInfo}
        onHide={() => setShowCategoryInfo(false)}
        centered
      >
        <Modal.Header
          closeButton
          style={{
            borderBottom: `4px solid ${primaryColor}`,
          }}
        >
          <Modal.Title>{selectedCategoryInfo?.name || "Category"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCategoryInfo && (
            <>
              <p className="lead">
                {categoryDescriptions[selectedCategoryInfo.id] ||
                  "No description available."}
              </p>

              <div className="d-flex justify-content-between align-items-center mt-4 pt-2 border-top">
                <div>
                  <small className="text-muted">
                    <strong>Posts in this category:</strong>{" "}
                    {categoryStats[selectedCategoryInfo.id] || 0}
                  </small>
                </div>
                <Button
                  variant={getCategoryVariant(selectedCategoryInfo.id)}
                  size="sm"
                  onClick={() => {
                    setSelectedCategory(selectedCategoryInfo.id.toString());
                    setShowCategoryInfo(false);
                    document
                      .getElementById("blog-section")
                      .scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  <i className="fas fa-list me-2"></i>
                  View Posts
                </Button>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>

      {/* Simple CSS */}
      <style type="text/css">
        {`
          .hover-shadow:hover {
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
            transform: translateY(-3px);
          }
          .hover-zoom:hover {
            transform: scale(1.03);
          }
          .blog-content img {
            max-width: 100%;
            height: auto;
            margin: 1rem 0;
            border-radius: 8px;
          }
          .blog-content h1, .blog-content h2, .blog-content h3, 
          .blog-content h4, .blog-content h5, .blog-content h6 {
            margin-top: 1.5rem;
            margin-bottom: 1rem;
          }
          .blog-content p {
            line-height: 1.7;
            margin-bottom: 1.2rem;
          }
          .blog-content ul, .blog-content ol {
            margin-bottom: 1.2rem;
            padding-left: 2rem;
          }
          .blog-content a {
            color: ${primaryColor};
            text-decoration: none;
          }
          .blog-content a:hover {
            text-decoration: underline;
          }
          .page-item.active .page-link {
            background-color: ${primaryColor};
            border-color: ${primaryColor};
          }
          .page-link {
            color: ${primaryColor};
          }
          .read-more-btn:hover {
            background-color: ${primaryColor} !important;
            border-color: ${primaryColor} !important;
            color: white !important;
          }
        `}
      </style>
    </Container>
  );
};

export default Blog;
