import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getBlogById, getBlogPhoto, getBlogs } from "../../api/peternakan/blog";

const BlogDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [latestBlogs, setLatestBlogs] = useState([]);
  const [relatedBlogs, setRelatedBlogs] = useState([]);

  const stripHtmlTags = (html) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };

  useEffect(() => {
    const fetchBlogData = async () => {
      try {
        setLoading(true);

        // Fetch main blog data
        const blogData = await getBlogById(id);
        setPost(blogData);

        // Fetch blog photo with higher quality
        try {
          const photoRes = await getBlogPhoto(id);
          // Ensure we get the highest quality photo available
          const photoUrl = photoRes.photo_url.includes("?")
            ? `${photoRes.photo_url}&quality=100`
            : `${photoRes.photo_url}?quality=100`;
          setPhoto(photoUrl);
        } catch {
          setPhoto(null);
        }

        // Fetch all blogs for sidebar
        const blogs = await getBlogs();

        // Set latest blogs with high-quality photos
        const blogsWithPhotos = await Promise.all(
          blogs.map(async (blog) => {
            try {
              const photoRes = await getBlogPhoto(blog.id);
              const photoUrl = photoRes.photo_url.includes("?")
                ? `${photoRes.photo_url}&quality=80`
                : `${photoRes.photo_url}?quality=80`;
              return { ...blog, photo: photoUrl };
            } catch {
              return { ...blog, photo: null };
            }
          })
        );

        setLatestBlogs(blogsWithPhotos.slice(0, 4));
        setError("");
      } catch (err) {
        console.error("Error fetching blog:", err);
        setError("Gagal memuat artikel. Silakan coba lagi nanti.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogData();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-5" style={{ minHeight: "60vh" }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Memuat artikel...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-5" style={{ minHeight: "60vh" }}>
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
        <Link to="/blog" className="btn btn-info mt-3">
          Kembali ke Blog
        </Link>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-5" style={{ minHeight: "60vh" }}>
        <h2>Artikel tidak ditemukan</h2>
        <Link to="/blog" className="btn btn-info mt-3">
          Kembali ke Blog
        </Link>
      </div>
    );
  }

  const renderBlogCard = (blog) => (
    <li
      key={blog.id}
      className="list-group-item"
      style={{
        borderLeft: "none",
        borderRight: "none",
        transition: "background-color 0.2s",
        cursor: "pointer",
      }}
    >
      <Link
        to={`/blog/${blog.id}`}
        className="d-block text-decoration-none"
        style={{ color: "#4CAF9EFF" }}
      >
        <div className="d-flex align-items-center mb-2">
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "4px",
              overflow: "hidden",
              marginRight: "12px",
              flexShrink: 0,
            }}
          >
            <img
              src={blog.photo || "/placeholder-image.jpg"}
              alt={blog.title}
              className="w-100 h-100"
              style={{
                objectFit: "cover",
                transition: "transform 0.3s ease",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.transform = "scale(1.05)")
              }
              onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
            />
          </div>
          <div>
            <span className="fw-medium d-block">{blog.title}</span>
            <small className="text-muted">{blog.updated_at}</small>
          </div>
        </div>
      </Link>
      <p className="mt-2 mb-2 text-muted" style={{ fontSize: "0.875rem" }}>
        {stripHtmlTags(blog.description).slice(0, 120)}...
      </p>
      <span
        className="badge"
        style={{
          backgroundColor: "#4CAF9EFF",
          color: "white",
          fontSize: "0.75rem",
        }}
      >
        {blog.topic_name}
      </span>
    </li>
  );

  return (
    <>
      {/* Breadcrumb Section */}
      <section className="breadcrumb__wrap">
        <div className="container custom-container">
          <div className="row justify-content-center">
            <div className="col-xl-6 col-lg-8 col-md-10">
              <div className="breadcrumb__wrap__content">
                <h2 className="title">Detail Blog</h2>
                <nav aria-label="breadcrumb">
                  <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                      <Link to="/">Home</Link>
                    </li>
                    <li className="breadcrumb-item">
                      <Link to="/blog">Blog</Link>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">
                      {post.title}
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
          {/* Main Content */}
          <div className="col-lg-8">
            <article>
              <div className="mb-4">
                <span
                  className="badge mb-2"
                  style={{
                    backgroundColor: "#4CAF9EFF",
                    color: "white",
                    fontSize: "0.9rem",
                    padding: "8px 12px",
                  }}
                >
                  {post.topic_name}
                </span>
                <h1
                  className="mb-3"
                  style={{
                    fontSize: "2.2rem",
                    lineHeight: "1.3",
                    fontWeight: "700",
                    color: "#333",
                  }}
                >
                  {post.title}
                </h1>
                <div className="d-flex align-items-center mb-4">
                  <i className="bi bi-calendar me-2 text-muted"></i>
                  <span className="text-muted">{post.updated_at}</span>
                </div>
              </div>

              {photo && (
                <div className="mb-5 position-relative">
                  <img
                    src={photo}
                    alt={post.title}
                    className="img-fluid rounded shadow"
                    style={{
                      width: "100%",
                      objectFit: "cover",
                      maxHeight: "500px",
                      border: "1px solid #eee",
                      boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
                    }}
                    loading="lazy"
                  />
                  <div className="position-absolute bottom-0 start-0 p-3 bg-dark bg-opacity-50 text-white w-100">
                    <small>Gambar: {post.title}</small>
                  </div>
                </div>
              )}

              <div
                className="blog-content"
                style={{
                  lineHeight: "1.8",
                  fontSize: "1.1rem",
                  color: "#444",
                }}
              >
                <div
                  dangerouslySetInnerHTML={{ __html: post.description }}
                  style={{
                    fontFamily: "'Noto Sans', sans-serif",
                  }}
                />
                <style>{`
                  .blog-content p {
                    margin-bottom: 1.5rem;
                  }
                  .blog-content h2, 
                  .blog-content h3, 
                  .blog-content h4 {
                    margin-top: 2rem;
                    margin-bottom: 1rem;
                    color: #333;
                  }
                  .blog-content img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 8px;
                    margin: 1.5rem 0;
                    box-shadow: 0 3px 10px rgba(0,0,0,0.1);
                  }
                  .blog-content blockquote {
                    border-left: 4px solid #4CAF9EFF;
                    padding-left: 1rem;
                    margin: 1.5rem 0;
                    font-style: italic;
                    color: #555;
                  }
                  .blog-content ul, 
                  .blog-content ol {
                    margin-bottom: 1.5rem;
                    padding-left: 2rem;
                  }
                  .blog-content li {
                    margin-bottom: 0.5rem;
                  }
                  .blog-content a {
                    color: #4CAF9EFF;
                    text-decoration: none;
                    transition: all 0.2s;
                  }
                  .blog-content a:hover {
                    color: #3a8b7d;
                    text-decoration: underline;
                  }
                `}</style>
              </div>

              <div className="mt-5 pt-4 border-top">
                <Link to="/blog" className="btn btn-outline-secondary me-2">
                  <i className="bi bi-arrow-left me-1"></i> Kembali ke Blog
                </Link>
                <button className="btn btn-info">
                  <i className="bi bi-share me-1"></i> Bagikan
                </button>
              </div>
            </article>
          </div>

          {/* Sidebar */}
          <div className="col-lg-4">
            {/* Latest Blogs */}
            <div className="card shadow-sm mb-4 border-0">
              <div
                className="card-header"
                style={{
                  backgroundColor: "#f8f9fa",
                  color: "#212529",
                  borderBottom: "2px solid #4CAF9EFF",
                }}
              >
                <h5 className="mb-0">
                  <i className="bi bi-clock-history me-2"></i>Blog Terbaru
                </h5>
              </div>
              <ul className="list-group list-group-flush">
                {latestBlogs.map(renderBlogCard)}
              </ul>
              <div className="card-footer text-center">
                <Link to="/blog" className="text-decoration-none">
                  Lihat Semua Artikel <i className="bi bi-arrow-right"></i>
                </Link>
              </div>
            </div>

            {/* Related Blogs */}
            {relatedBlogs.length > 0 && (
              <div className="card shadow-sm mb-4 border-0">
                <div
                  className="card-header"
                  style={{
                    backgroundColor: "#f8f9fa",
                    color: "#212529",
                    borderBottom: "2px solid #4CAF9EFF",
                  }}
                >
                  <h5 className="mb-0">
                    <i className="bi bi-bookmarks me-2"></i>Artikel Terkait
                  </h5>
                </div>
                <ul className="list-group list-group-flush">
                  {relatedBlogs.map(renderBlogCard)}
                </ul>
              </div>
            )}

            {/* Topic Info */}
            <div className="card shadow-sm border-0">
              <div
                className="card-header"
                style={{
                  backgroundColor: "#f8f9fa",
                  color: "#212529",
                  borderBottom: "2px solid #4CAF9EFF",
                }}
              >
                <h5 className="mb-0">
                  <i className="bi bi-info-circle me-2"></i>Tentang Topik
                </h5>
              </div>
              <div className="card-body">
                <h6
                  style={{
                    color: "#4CAF9EFF",
                    fontWeight: "600",
                    marginBottom: "1rem",
                  }}
                >
                  {post.topic_name}
                </h6>
                <p className="text-muted" style={{ fontSize: "0.9rem" }}>
                  <strong>Informasi Topik:</strong> Artikel ini termasuk dalam
                  topik <span className="text-primary">{post.topic_name}</span>.
                  Temukan lebih banyak artikel serupa di blog kami untuk
                  memperdalam pengetahuan Anda.
                </p>
                <Link
                  to={`/blog?topic=${encodeURIComponent(post.topic_name)}`}
                  className="btn btn-sm btn-outline-info w-100"
                >
                  <i className="bi bi-collection me-1"></i> Lihat Semua Artikel
                  Topik Ini
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogDetail;
