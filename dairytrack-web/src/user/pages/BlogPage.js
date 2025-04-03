import React, { useState } from "react";
import { Link } from "react-router-dom";

import Merawat from "../../assets/image/merawat.jpg";
import Teknologi from "../../assets/image/teknologi.jpg";
import Makanan from "../../assets/image/makanan.jpg";
import Kesehatan from "../../assets/image/kesehatan.jpg";
import Stress from "../../assets/image/stress.jpg";
import Lingkungan from "../../assets/image/lingkungan.jpg";

const blogPosts = [
  {
    title: "Cara Merawat Sapi untuk Produksi Susu Berkualitas",
    date: "1 April 2025",
    content:
      "Merawat sapi dengan baik adalah kunci untuk menghasilkan susu berkualitas tinggi. Dalam artikel ini, kami akan membahas berbagai cara merawat sapi agar tetap sehat dan produktif.",
    image: Merawat,
    link: "#",
  },
  {
    title: "Pemanfaatan Teknologi dalam Peternakan Sapi",
    date: "25 Maret 2025",
    content:
      "Teknologi memainkan peran penting dalam meningkatkan efisiensi peternakan sapi. Artikel ini akan menjelaskan beberapa inovasi terkini dalam bidang peternakan sapi.",
    image: Teknologi,
    link: "#",
  },
  {
    title: "Makanan Terbaik untuk Sapi Perah",
    date: "18 Maret 2025",
    content:
      "Memilih pakan yang tepat sangat penting untuk sapi perah. Dalam artikel ini, kami akan membahas berbagai jenis pakan yang dapat meningkatkan kualitas susu sapi.",
    image: Makanan,
    link: "#",
  },
  {
    title: "Manajemen Kesehatan Sapi di Peternakan",
    date: "01 April 2025",
    content:
      "Menjaga kesehatan sapi adalah faktor kunci dalam keberhasilan peternakan. Artikel ini membahas cara terbaik dalam menangani kesehatan sapi secara optimal.",
    image: Kesehatan,
    link: "#",
  },
  {
    title: "Pengaruh Stres pada Produksi Susu Sapi Perah",
    date: "02 April 2025",
    content:
      "Stres dapat berdampak negatif pada produksi susu sapi. Artikel ini membahas berbagai faktor yang dapat menyebabkan stres pada sapi perah dan bagaimana menanggulangi.",
    image: Stress,
    link: "#",
  },
  {
    title: "Sapi Perah dan Pengaruh Lingkungan terhadap Produksi Susu",
    date: "02 April 2025",
    content:
      "Lingkungan tempat sapi perah dipelihara dapat mempengaruhi produksinya. Artikel ini membahas faktor-faktor lingkungan yang harus dipertimbangkan, seperti suhu, kelembapan, dan kebersihan kandang, untuk menjaga produksi susu tetap optimal.",
    image: Lingkungan,
    link: "#",
  },
];

const BlogPage = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const postsPerPage = 6;
  const totalPages = Math.ceil(blogPosts.length / postsPerPage);

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
      {/* Header */}
      <header className="text-center mb-5" style={{ paddingTop: "100px" }}>
        <p className="text-muted">
          Temukan artikel terbaru tentang peternakan sapi dan teknologi
        </p>
      </header>

      {/* Blog Cards */}
      <div className="row g-4 mb-5">
        {blogPosts
          .slice(currentPage * postsPerPage, (currentPage + 1) * postsPerPage)
          .map((post, index) => (
            <div key={index} className="col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm">
                <img
                  src={post.image}
                  alt={post.title}
                  className="card-img-top"
                  style={{ height: "200px", objectFit: "cover" }}
                />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title text-success">{post.title}</h5>
                  <p className="card-text text-muted">{post.date}</p>
                  <p className="card-text mb-4">{post.content}</p>
                  <Link
                    to={`/blog/${index}`}
                    className="btn btn-success mt-auto align-self-start"
                  >
                    Baca Selengkapnya
                  </Link>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Pagination */}
      <div className="d-flex justify-content-center">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 0}
          className="btn btn-outline-secondary me-2"
        >
          Sebelumnya
        </button>
        <button
          onClick={handleNextPage}
          disabled={currentPage === totalPages - 1}
          className="btn btn-success"
        >
          Artikel Berikutnya
        </button>
      </div>
    </div>
  );
};

export default BlogPage;
