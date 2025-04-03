import React, { useState } from "react";
import { Link } from "react-router-dom";

import Merawat from "../../assets/image/merawat.jpg";
import Teknologi from "../../assets/image/teknologi.jpg";
import Makanan from "../../assets/image/makanan.jpg";
import Kesehatan from "../../assets/image/kesehatan.jpg";
import Stress from "../../assets/image/stress.jpg";
import Lingkungan from "../../assets/image/lingkungan.jpg";

const BlogPage = () => {
  const blogPosts = [
    {
      title: "Cara Merawat Sapi untuk Produksi Susu Berkualitas",
      date: "1 April 2025",
      topic: "Perawatan Sapi",
      content:
        "Merawat sapi dengan baik adalah kunci untuk menghasilkan susu berkualitas tinggi. Dalam artikel ini, kami akan membahas berbagai cara merawat sapi agar tetap sehat dan produktif.",
      image: Merawat,
      link: "#",
    },
    {
      title: "Pemanfaatan Teknologi dalam Peternakan Sapi",
      date: "25 Maret 2025",
      topic: "Teknologi Peternakan",
      content:
        "Teknologi memainkan peran penting dalam meningkatkan efisiensi peternakan sapi. Artikel ini akan menjelaskan beberapa inovasi terkini dalam bidang peternakan sapi.",
      image: Teknologi,
      link: "#",
    },
    {
      title: "Makanan Terbaik untuk Sapi Perah",
      date: "18 Maret 2025",
      topic: "Pakan Ternak",
      content:
        "Memilih pakan yang tepat sangat penting untuk sapi perah. Dalam artikel ini, kami akan membahas berbagai jenis pakan yang dapat meningkatkan kualitas susu sapi.",
      image: Makanan,
      link: "#",
    },
    {
      title: "Manajemen Kesehatan Sapi di Peternakan",
      date: "01 April 2025",
      topic: "Manajemen Kesehatan",
      content:
        "Menjaga kesehatan sapi adalah faktor kunci dalam keberhasilan peternakan. Artikel ini membahas cara terbaik dalam menangani kesehatan sapi secara optimal.",
      image: Kesehatan,
      link: "#",
    },
    {
      title: "Strategi Peningkatan Produksi Susu Sapi",
      date: "10 Maret 2025",
      topic: "Produksi Susu",
      content:
        "Artikel ini membahas strategi yang dapat diterapkan untuk meningkatkan produksi susu sapi secara efisien dan berkelanjutan.",
      image: Merawat,
      link: "#",
    },
    {
      title: "Teknologi IoT untuk Monitoring Peternakan",
      date: "5 Maret 2025",
      topic: "Teknologi Peternakan",
      content:
        "Penggunaan teknologi IoT dalam peternakan dapat membantu peternak memantau kondisi sapi secara real-time. Artikel ini menjelaskan manfaatnya.",
      image: Teknologi,
      link: "#",
    },
    {
      title: "Pakan Fermentasi untuk Sapi: Manfaat dan Cara Membuatnya",
      date: "28 Februari 2025",
      topic: "Pakan Ternak",
      content:
        "Pakan fermentasi dapat meningkatkan pencernaan sapi dan kualitas susu. Artikel ini membahas manfaat dan cara membuatnya.",
      image: Makanan,
      link: "#",
    },
    {
      title: "Pentingnya Vaksinasi untuk Sapi di Peternakan",
      date: "20 Februari 2025",
      topic: "Manajemen Kesehatan",
      content:
        "Vaksinasi adalah langkah penting dalam menjaga kesehatan sapi. Artikel ini menjelaskan jenis vaksin yang diperlukan dan jadwalnya.",
      image: Kesehatan,
      link: "#",
    },
    {
      title: "Mengelola Limbah Peternakan dengan Teknologi Modern",
      date: "15 Februari 2025",
      topic: "Teknologi Peternakan",
      content:
        "Limbah peternakan dapat dikelola dengan teknologi modern untuk mengurangi dampak lingkungan. Artikel ini membahas solusi inovatif.",
      image: Teknologi,
      link: "#",
    },
    {
      title: "Tips Memilih Bibit Sapi Berkualitas untuk Peternakan",
      date: "10 Februari 2025",
      topic: "Perawatan Sapi",
      content:
        "Memilih bibit sapi yang berkualitas adalah langkah awal untuk peternakan yang sukses. Artikel ini memberikan tips praktis untuk memilih bibit terbaik.",
      image: Merawat,
      link: "#",
    },
  ];

  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(0);
  const postsPerPage = 4;

  // Get all unique topics
  const allTopics = [
    "Semua",
    ...Array.from(new Set(blogPosts.map((post) => post.topic))),
  ];

  // Filter posts based on search term and selected topic
  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTopic =
      selectedTopic === "Semua" || post.topic === selectedTopic;
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
    <div className="container py-5">
      <div className="row">
        {/* Main Blog Content */}
        <div className="col-lg-8" style={{ marginTop: "120px" }}>
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

          {filteredPosts.length === 0 ? (
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
                className="btn btn-outline-success"
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
                          e.currentTarget.style.transform = "translateY(-5px)";
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
                            src={post.image}
                            alt={post.title}
                            className="card-img-top w-100 h-100"
                            style={{
                              objectFit: "cover",
                              transition: "transform 0.5s",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.transform = "scale(1.1)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.transform = "scale(1)")
                            }
                          />
                        </div>
                        <div className="card-body d-flex flex-column">
                          <span
                            className="badge mb-2"
                            style={{
                              backgroundColor: "#4caf50",
                              color: "white",
                              alignSelf: "flex-start",
                            }}
                          >
                            {post.topic}
                          </span>
                          <h5
                            className="card-title"
                            style={{ color: "#4caf50" }}
                          >
                            {post.title}
                          </h5>
                          <p className="card-text text-muted small">
                            {post.date}
                          </p>
                          <p className="card-text mb-4">{post.content}</p>
                          <Link
                            to={`/blog/${index}`}
                            className="btn mt-auto align-self-start"
                            style={{
                              backgroundColor: "#4caf50",
                              color: "white",
                              border: "none",
                              padding: "8px 16px",
                              borderRadius: "4px",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "#1b5e20")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.backgroundColor =
                                "#4caf50")
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
                  className="btn btn-success d-flex align-items-center"
                >
                  Berikutnya <i className="bi bi-chevron-right ms-1"></i>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Sidebar */}
        <div
          className="col-lg-4 d-none d-lg-block"
          style={{ marginTop: "120px" }}
        >
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
                  <button className="btn btn-success" type="button">
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
                <h6 className="mb-3" style={{ color: "#4caf50" }}>
                  Filter Berdasarkan Topik
                </h6>
                <div className="d-flex flex-wrap gap-2">
                  {allTopics.map((topic, index) => (
                    <button
                      key={index}
                      className={`btn btn-sm ${
                        selectedTopic === topic
                          ? "btn-success"
                          : "btn-outline-success"
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
                    to={`/blog/${index}`}
                    className="d-block text-decoration-none"
                    style={{ color: "#4caf50" }}
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
                          src={post.image}
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
                    {post.content.slice(0, 100)}...
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
                        color: selectedTopic === topic ? "#4caf50" : "#6c757d",
                        transition: "color 0.2s",
                      }}
                    ></i>
                    <span
                      style={{
                        color: selectedTopic === topic ? "#4caf50" : "#212529",
                      }}
                    >
                      {topic}
                    </span>
                    {selectedTopic === topic && (
                      <i
                        className="bi bi-check2 ms-auto"
                        style={{ color: "#4caf50" }}
                      ></i>
                    )}
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
