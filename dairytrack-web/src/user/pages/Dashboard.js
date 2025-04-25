import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import bannerImg from "../../assets/client/img/banner/banner_img.png";
import "../../assets/client/css/bootstrap.min.css";
import { getProductStocks } from "../../api/keuangan/product";
import { getBlogs, getBlogPhoto } from "../../api/peternakan/blog";

function Dashboard() {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loadingBlogs, setLoadingBlogs] = useState(true);
  const [blogError, setBlogError] = useState("");

  const [productData, setProductData] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productError, setProductError] = useState("");
  const [groupedProducts, setGroupedProducts] = useState({});

  const [isLoading, setIsLoading] = useState(true); // State untuk loading overlay

  useEffect(() => {
    const fetchBlogData = async () => {
      try {
        setLoadingBlogs(true);
        const blogs = await getBlogs();
        const blogsWithPhotos = await Promise.all(
          blogs.map(async (blog) => {
            try {
              const photoRes = await getBlogPhoto(blog.id);
              return { ...blog, photo: photoRes.photo_url };
            } catch {
              return { ...blog, photo: null };
            }
          })
        );
        setBlogPosts(blogsWithPhotos);
        setBlogError("");
      } catch (err) {
        console.error("Failed to fetch blog data:", err.message);
        setBlogError("Failed to load blog posts.");
      } finally {
        setLoadingBlogs(false);
      }
    };

    const fetchProductStocks = async () => {
      try {
        setLoadingProducts(true);
        const products = await getProductStocks();
        setProductData(products);
        const grouped = groupProductsByType(products);
        setGroupedProducts(grouped);
        setProductError("");
      } catch (err) {
        console.error("Failed to fetch product stocks:", err.message);
        setProductError("Failed to load products.");
      } finally {
        setLoadingProducts(false);
      }
    };

    const fetchData = async () => {
      await Promise.all([fetchBlogData(), fetchProductStocks()]);
      setIsLoading(false); // Set loading selesai setelah semua data diambil
    };

    fetchData();
  }, []);

  const groupProductsByType = (products) => {
    const grouped = {};
    products.forEach((product) => {
      const typeId = product.product_type;
      const typeDetails = product.product_type_detail;
      if (!grouped[typeId]) {
        grouped[typeId] = {
          typeDetails: typeDetails,
          totalAvailableQuantity: 0,
          products: [],
        };
      }
      grouped[typeId].products.push(product);
      if (product.status === "available") {
        grouped[typeId].totalAvailableQuantity += product.quantity;
      }
    });
    return grouped;
  };

  const stripHtmlTags = (html) => {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  };

  const truncateText = (text, maxLength = 100) => {
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  const formatPrice = (price) => {
    return `Rp ${parseFloat(price).toLocaleString("id-ID")}`;
  };

  return (
    <main style={{ overflowX: "hidden" }}>
      {/* Hero Banner Section */}
      <section
        className="banner"
        style={{
          background: "linear-gradient(135deg, #f5f7fa 0%, #e4f0f9 100%)",
          padding: "80px 0",
          position: "relative",
        }}
      >
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 order-lg-1 order-2">
              <div className="banner__content">
                <h1
                  className="display-4 fw-bold mb-4"
                  style={{ color: "#2c3e50", lineHeight: "1.3" }}
                >
                  <span style={{ color: "#3498db" }}>
                    Optimize Your Dairy Farm
                  </span>{" "}
                  with DairyTrack
                </h1>
                <p className="lead mb-4" style={{ color: "#7f8c8d" }}>
                  DairyTrack is a comprehensive platform designed to streamline
                  your dairy farm operations and boost productivity
                </p>
                <div className="d-flex gap-3">
                  <Link
                    to="/identitas-peternakan"
                    className="btn btn-primary btn-lg px-4 py-2 rounded-pill"
                    style={{ fontWeight: "600" }}
                  >
                    Learn More
                  </Link>
                  <Link
                    to="/produk"
                    className="btn btn-outline-primary btn-lg px-4 py-2 rounded-pill"
                    style={{ fontWeight: "600" }}
                  >
                    Our Products
                  </Link>
                </div>
              </div>
            </div>
            <div className="col-lg-6 order-lg-2 order-1 mb-4 mb-lg-0">
              <div className="text-center">
                <img
                  src={bannerImg}
                  alt="Banner"
                  className="img-fluid rounded-3 shadow"
                  style={{ maxHeight: "500px" }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="scroll__down text-center mt-5">
          <a href="#features" className="text-decoration-none">
            <div style={{ color: "#3498db", fontWeight: "500" }}>
              Scroll down
              <div className="mt-2">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M7 10L12 15L17 10"
                    stroke="#3498db"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-5"
        style={{ backgroundColor: "#ffffff" }}
      >
        <div className="container py-5">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3" style={{ color: "#2c3e50" }}>
              Mengapa Memilih Susu Kami?
            </h2>
            <p className="lead text-muted">
              Kualitas premium dengan standar tertinggi dalam industri susu
            </p>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm rounded-3 overflow-hidden">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="#3498db"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <h3 className="h5 mb-0" style={{ color: "#2c3e50" }}>
                      Kualitas Terjamin
                    </h3>
                  </div>
                  <p className="text-muted mb-0">
                    Setiap batch susu melalui 15 titik pemeriksaan kualitas
                    untuk memastikan kandungan nutrisi dan keamanan pangan.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm rounded-3 overflow-hidden">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="#3498db"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M12 8V12L15 15"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <h3 className="h5 mb-0" style={{ color: "#2c3e50" }}>
                      Segar Langsung dari Sapi
                    </h3>
                  </div>
                  <p className="text-muted mb-0">
                    Susu diproses dalam 2 jam setelah pemerahan untuk menjaga
                    kesegaran dan nutrisi alami.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm rounded-3 overflow-hidden">
                <div className="card-body p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="#3498db"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3.5 13H12M3.5 8H18M10.5 18H18M7.5 18V13M7.5 18C5.567 18 4 16.433 4 14.5V5.2C4 4.07989 4 3.51984 4.21799 3.09202C4.40973 2.71569 4.71569 2.40973 5.09202 2.21799C5.51984 2 6.0799 2 7.2 2H16.8C17.9201 2 18.4802 2 18.908 2.21799C19.2843 2.40973 19.5903 2.71569 19.782 3.09202C20 3.51984 20 4.07989 20 5.2V14.5C20 16.433 18.433 18 16.5 18H15.5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <h3 className="h5 mb-0" style={{ color: "#2c3e50" }}>
                      Kesejahteraan Hewan
                    </h3>
                  </div>
                  <p className="text-muted mb-0">
                    Sapi kami hidup dalam lingkungan nyaman dengan diet seimbang
                    dan perawatan kesehatan rutin.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-5" style={{ backgroundColor: "#f8f9fa" }}>
        <div className="container py-5">
          <div className="text-center mb-5">
            <span className="badge bg-primary bg-opacity-10 text-primary mb-2 px-3 py-2 rounded-pill">
              Our Products
            </span>
            <h2 className="display-5 fw-bold mb-3" style={{ color: "#2c3e50" }}>
              High-Quality Dairy Products
            </h2>
            <p className="lead text-muted">Fresh from our farm to your table</p>
          </div>

          {loadingProducts ? (
            <div className="text-center py-5">
              <div
                className="spinner-border text-primary"
                style={{ width: "3rem", height: "3rem" }}
                role="status"
              >
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 fs-5">Loading products...</p>
            </div>
          ) : productError ? (
            <div className="alert alert-danger text-center fs-5">
              {productError}
            </div>
          ) : Object.keys(groupedProducts).length === 0 ? (
            <div className="text-center py-5">
              <p className="fs-5">No products available at the moment.</p>
            </div>
          ) : (
            <div className="row g-4">
              {Object.values(groupedProducts)
                .slice(0, 3)
                .map((group, index) => (
                  <div className="col-md-4" key={index}>
                    <div className="card h-100 border-0 shadow-sm overflow-hidden">
                      <div className="position-relative">
                        <img
                          src={
                            group.typeDetails.image || "/placeholder-image.jpg"
                          }
                          alt={group.typeDetails.product_name}
                          className="card-img-top"
                          style={{ height: "250px", objectFit: "cover" }}
                        />
                        <div className="position-absolute top-0 end-0 m-3">
                          <span className="badge bg-success px-3 py-2 rounded-pill">
                            {group.totalAvailableQuantity}{" "}
                            {group.typeDetails.unit} available
                          </span>
                        </div>
                      </div>
                      <div className="card-body p-4">
                        <h5
                          className="card-title fw-bold"
                          style={{ color: "#2c3e50" }}
                        >
                          {group.typeDetails.product_name}
                        </h5>
                        <p className="card-text text-muted mb-4">
                          {truncateText(group.typeDetails.product_description)}
                        </p>
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="text-primary fw-bold fs-5">
                            {formatPrice(group.typeDetails.price)} /{" "}
                            {group.typeDetails.unit}
                          </span>
                        </div>
                      </div>
                      <div className="card-footer bg-transparent border-0 p-4 pt-0">
                        <Link
                          to="/pemesanan"
                          className="btn btn-primary w-100 py-2 rounded-pill"
                          style={{ fontWeight: "500" }}
                        >
                          Order Now
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
          <div className="text-center mt-5">
            <Link
              to="/produk"
              className="btn btn-outline-primary px-4 py-2 rounded-pill"
              style={{ fontWeight: "500" }}
            >
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-5" style={{ backgroundColor: "#ffffff" }}>
        <div className="container py-5">
          <div className="text-center mb-5">
            <span className="badge bg-primary bg-opacity-10 text-primary mb-2 px-3 py-2 rounded-pill">
              Latest News
            </span>
            <h2 className="display-5 fw-bold mb-3" style={{ color: "#2c3e50" }}>
              Dairy Farm Insights & Updates
            </h2>
            <p className="lead text-muted">
              Stay informed with our latest articles and tips
            </p>
          </div>

          {loadingBlogs ? (
            <div className="text-center py-5">
              <div
                className="spinner-border text-primary"
                style={{ width: "3rem", height: "3rem" }}
                role="status"
              >
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 fs-5">Loading blog posts...</p>
            </div>
          ) : blogError ? (
            <div className="alert alert-danger text-center fs-5">
              {blogError}
            </div>
          ) : blogPosts.length === 0 ? (
            <div className="text-center py-5">
              <p className="fs-5">No blog posts available at the moment.</p>
            </div>
          ) : (
            <div className="row g-4">
              {blogPosts.slice(0, 3).map((post, index) => (
                <div className="col-md-4" key={index}>
                  <div className="card h-100 border-0 shadow-sm overflow-hidden">
                    <div className="position-relative">
                      <img
                        src={post.photo || "/placeholder-image.jpg"}
                        alt={post.title}
                        className="card-img-top"
                        style={{ height: "250px", objectFit: "cover" }}
                      />
                      <div className="position-absolute bottom-0 start-0 m-3">
                        <span className="badge bg-info px-3 py-2 rounded-pill">
                          {post.topic_name}
                        </span>
                      </div>
                    </div>
                    <div className="card-body p-4">
                      <div className="d-flex justify-content-between mb-3">
                        <small className="text-muted">{post.date}</small>
                      </div>
                      <h5
                        className="card-title fw-bold"
                        style={{ color: "#2c3e50" }}
                      >
                        {post.title}
                      </h5>
                      <p className="card-text text-muted">
                        {truncateText(stripHtmlTags(post.description))}
                      </p>
                    </div>
                    <div className="card-footer bg-transparent border-0 p-4 pt-0">
                      <Link
                        to={`/blog/${post.id}`}
                        className="btn btn-outline-primary w-100 py-2 rounded-pill"
                        style={{ fontWeight: "500" }}
                      >
                        Read More
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="text-center mt-5">
            <Link
              to="/blog"
              className="btn btn-outline-primary px-4 py-2 rounded-pill"
              style={{ fontWeight: "500" }}
            >
              View All Articles
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-5" style={{ backgroundColor: "#3498db" }}>
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <h2 className="display-5 fw-bold text-white mb-4">
                Ready to experience our premium dairy products?
              </h2>
              <p className="lead text-white mb-5">
                Join thousands of satisfied customers who trust our quality and
                service.
              </p>
              <div className="d-flex gap-3 justify-content-center">
                <Link
                  to="/pemesanan"
                  className="btn btn-light btn-lg px-4 py-2 rounded-pill"
                  style={{ fontWeight: "600" }}
                >
                  Order Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Dashboard;
