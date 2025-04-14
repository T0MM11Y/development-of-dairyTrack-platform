import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getBlogs, getBlogPhoto } from "../../api/peternakan/blog"; // Tambahkan getBlogPhoto

const BlogPage = () => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(0);
  const postsPerPage = 4;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const blogs = await getBlogs();

        // Ambil foto untuk setiap blog
        const blogsWithPhotos = await Promise.all(
          blogs.map(async (blog) => {
            try {
              const photoRes = await getBlogPhoto(blog.id);
              return { ...blog, photo: photoRes.photo_url };
            } catch {
              return { ...blog, photo: null }; // Fallback jika foto tidak tersedia
            }
          })
        );

        setBlogPosts(blogsWithPhotos);
        setError("");
      } catch (err) {
        console.error("Gagal mengambil data:", err.message);
        setError("Gagal mengambil data. Pastikan server API aktif.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get all unique topics
  const allTopics = [
    "Semua",
    ...Array.from(new Set(blogPosts.map((post) => post.topic_name))),
  ];
  // Fungsi untuk membersihkan HTML tag
  const stripHtmlTags = (html) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };

  // Fungsi untuk memotong teks hingga 200 karakter
  const truncateText = (text, maxLength = 200) => {
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  // Filter posts based on search term and selected topic
  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTopic =
      selectedTopic === "Semua" || post.topic_name === selectedTopic;
    return matchesSearch && matchesTopic;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
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

  return (
    <div>
      {/* Breadcrumb Section */}
      <section className="breadcrumb__wrap">
        <div className="container custom-container">
          <div className="row justify-content-center">
            <div className="col-xl-6 col-lg-8 col-md-10">
              <div className="breadcrumb__wrap__content">
                <h2 className="title">Blog Page</h2>
                <nav aria-label="breadcrumb">
                  <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/">Home</Link>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">
                      Blog
                    </li>
                  </ol>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="container py-5">
        <div className="row">
          {/* Main Blog Content */}
          <div
            className="col-lg-8"
            style={{ marginTop: "0px", marginBottom: "80px" }}
          >
            {/* Search and Filter - Mobile Version */}
            <div className="card shadow-sm mb-4 d-lg-none">
              <div
                className="card-header"
                style={{ backgroundColor: "#A6BBA7FF", color: "white" }}
              >
                <h5 className="mb-0">Cari & Filter</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Cari artikel..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="btn btn-success" type="button">
                      <i className="bi bi-search"></i>
                    </button>
                  </div>
                </div>
                <div>
                  <select
                    className="form-select"
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                  >
                    {allTopics.map((topic, index) => (
                      <option key={index} value={topic}>
                        {topic}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
                <p className="mt-2">Loading blog data...</p>
              </div>
            ) : error ? (
              <div className="text-center py-5">
                <h4 className="text-danger">{error}</h4>
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-5">
                <i
                  className="bi bi-search"
                  style={{ fontSize: "3rem", color: "#6c757d" }}
                ></i>
                <h4 className="mt-3 text-muted">
                  Tidak ada artikel yang ditemukan
                </h4>
                <p className="text-muted">
                  Coba kata kunci atau topik yang berbeda
                </p>
                <button
                  className="btn btn-outline-info"
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedTopic("Semua");
                  }}
                >
                  Reset Pencarian
                </button>
              </div>
            ) : (
              <>
                <div className="row g-4 mb-5">
                  {filteredPosts
                    .slice(
                      currentPage * postsPerPage,
                      (currentPage + 1) * postsPerPage
                    )
                    .map((post, index) => (
                      <div key={index} className="col-md-6 col-lg-6">
                        <div
                          className="card h-100 shadow-sm border-0 overflow-hidden"
                          style={{
                            transition: "transform 0.3s, box-shadow 0.3s",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform =
                              "translateY(-5px)";
                            e.currentTarget.style.boxShadow =
                              "0 10px 20px rgba(0, 0, 0, 0.1)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow =
                              "0 4px 6px rgba(0, 0, 0, 0.1)";
                          }}
                        >
                          <div style={{ overflow: "hidden", height: "200px" }}>
                            <img
                              src={post.photo || "/placeholder-image.jpg"} // Gunakan fallback jika photo tidak tersedia
                              alt={post.title}
                              className="card-img-top w-100 h-100"
                              style={{
                                objectFit: "cover",
                                transition: "transform 0.5s",
                              }}
                            />
                          </div>
                          <div className="card-body d-flex flex-column">
                            <span
                              className="badge mb-2"
                              style={{
                                backgroundColor: "#4CAF9EFF",
                                color: "white",
                                alignSelf: "flex-start",
                              }}
                            >
                              {post.topic_name}
                            </span>
                            <h5
                              className="card-title"
                              style={{ color: "#4CAF9EFF" }}
                            >
                              {post.title}
                            </h5>
                            <p className="card-text text-muted small">
                              {post.date}
                            </p>
                            {truncateText(stripHtmlTags(post.description))}
                            <Link
                              to={`/blog/${post.id}`}
                              className="btn mt-auto align-self-start"
                              style={{
                                backgroundColor: "#4CAF9EFF",
                                color: "white",
                                border: "none",
                                padding: "8px 16px",
                                borderRadius: "4px",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "#4CAF9EFF")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.backgroundColor =
                                  "#4CAF9EFF")
                              }
                            >
                              Baca Selengkapnya
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Pagination */}
                <div className="d-flex justify-content-center align-items-center">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 0}
                    className="btn btn-outline-secondary me-2 d-flex align-items-center"
                  >
                    <i className="bi bi-chevron-left me-1"></i> Sebelumnya
                  </button>
                  <span className="mx-3 text-muted">
                    Halaman {currentPage + 1} dari {totalPages}
                  </span>
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages - 1}
                    className="btn btn-info d-flex align-items-center"
                  >
                    Berikutnya <i className="bi bi-chevron-right ms-1"></i>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="col-lg-4 d-none d-lg-block">
            {/* Search and Filter */}
            <div className="card shadow-sm mb-4 border-0">
              <div
                className="card-header"
                style={{ backgroundColor: "#f8f9fa", color: "#212529" }}
              >
                <h5 className="mb-0">Cari & Filter</h5>
              </div>
              <div className="card-body">
                {/* Search Input */}
                <div className="mb-4">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Cari artikel..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="btn btn-info" type="button">
                      <i className="bi bi-search"></i>
                    </button>
                  </div>
                  {searchTerm && (
                    <div className="mt-2 text-end">
                      <small
                        className="text-muted cursor-pointer"
                        onClick={() => setSearchTerm("")}
                        style={{ cursor: "pointer" }}
                      >
                        <i className="bi bi-x-circle me-1"></i> Hapus pencarian
                      </small>
                    </div>
                  )}
                </div>

                {/* Filter by Topic */}
                <div>
                  <h6 className="mb-3" style={{ color: "#4CAF9EFF" }}>
                    Filter Berdasarkan Topik
                  </h6>
                  <div className="d-flex flex-wrap gap-2">
                    {allTopics.map((topic, index) => (
                      <button
                        key={index}
                        className={`btn btn-sm ${
                          selectedTopic === topic
                            ? "btn-info"
                            : "btn-outline-info"
                        }`}
                        onClick={() => setSelectedTopic(topic)}
                        style={{
                          borderRadius: "20px",
                          padding: "5px 15px",
                          fontSize: "0.85rem",
                        }}
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Blog Terbaru */}
            <div className="card shadow-sm mb-4 border-0">
              <div
                className="card-header"
                style={{ backgroundColor: "#f8f9fa", color: "#212529" }}
              >
                <h5 className="mb-0">Blog Terbaru</h5>
              </div>
              <ul className="list-group list-group-flush">
                {blogPosts.slice(0, 4).map((post, index) => (
                  <li
                    key={index}
                    className="list-group-item"
                    style={{
                      borderLeft: "none",
                      borderRight: "none",
                      transition: "background-color 0.2s",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f8f9fa")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "white")
                    }
                  >
                    <Link
                      to={`/blog/${post.id}`}
                      className="d-block text-decoration-none"
                      style={{ color: "#4CAF9EFF" }}
                    >
                      <div className="d-flex align-items-center mb-2">
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "4px",
                            overflow: "hidden",
                            marginRight: "10px",

                            flexShrink: 0,
                          }}
                        >
                          <img
                            src={post.photo || "/placeholder-image.jpg"}
                            alt={post.title}
                            className="w-100 h-100"
                            style={{ objectFit: "cover" }}
                          />
                        </div>
                        <span className="fw-medium">{post.title}</span>
                      </div>
                    </Link>
                    <small className="text-muted">{post.date}</small>
                    <p
                      className="mt-1 mb-0 text-muted"
                      style={{ fontSize: "0.875rem" }}
                    >
                      {stripHtmlTags(post.description).slice(0, 100)}...
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Topik Peternakan */}
            <div className="card shadow-sm border-0">
              <div
                className="card-header"
                style={{ backgroundColor: "#f8f9fa", color: "#212529" }}
              >
                <h5 className="mb-0">Topik Peternakan</h5>
              </div>
              <ul className="list-group list-group-flush">
                {allTopics
                  .filter((topic) => topic !== "Semua")
                  .map((topic, index) => (
                    <li
                      key={index}
                      className="list-group-item d-flex align-items-center"
                      style={{
                        cursor: "pointer",
                        borderLeft: "none",
                        borderRight: "none",
                        transition: "background-color 0.2s",
                      }}
                      onClick={() => setSelectedTopic(topic)}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#f8f9fa")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor = "white")
                      }
                    >
                      <i
                        className="bi bi-tag-fill me-2"
                        style={{
                          color:
                            selectedTopic === topic ? "#4CAF9EFF" : "#6c757d",
                          transition: "color 0.2s",
                        }}
                      ></i>
                      <span
                        style={{
                          color:
                            selectedTopic === topic ? "#4CAF9EFF" : "#212529",
                        }}
                      >
                        {topic}
                      </span>
                      {selectedTopic === topic && (
                        <i
                          className="bi bi-check2 ms-auto"
                          style={{ color: "#4CAF9EFF" }}
                        ></i>
                      )}
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
