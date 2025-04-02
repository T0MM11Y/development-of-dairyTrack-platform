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
    <div className="container py-5 mt-15">
  <header className="text-center mb-12"> {/* Menambahkan margin bottom yang lebih besar */}
    <h1 className="text-4xl font-bold text-green-600 mb-4">Blog Terbaru</h1> {/* Menambahkan margin bottom pada judul */}
  </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
        {blogPosts.slice(currentPage * postsPerPage, (currentPage + 1) * postsPerPage).map((post, index) => (
          <div key={index} className="border rounded-lg overflow-hidden shadow-lg p-4">
            <img 
              src={post.image} 
              alt={post.title} 
              className="w-full h-64 object-cover rounded-lg mb-4" 
              style={{ objectFit: 'cover', height: '350px' }} 
            />
            <h3 className="text-xl font-bold text-green-700">{post.title}</h3>
            <p className="text-sm text-gray-500 mb-2">{post.date}</p>
            <p className="text-gray-700 mb-4">{post.content}</p>
            <Link to={`/blog/${index}`} className="text-blue-600 font-semibold hover:underline">Baca Selengkapnya</Link>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-10 space-x-4">
        <button 
          onClick={handlePrevPage} 
          disabled={currentPage === 0} 
          className="px-4 py-2 bg-green-500 text-black rounded-lg disabled:opacity-50">
          Sebelumnya
        </button>
        <button 
          onClick={handleNextPage} 
          disabled={currentPage === totalPages - 1} 
          className="px-4 py-2 bg-green-500 text-black rounded-lg disabled:opacity-50">
          Artikel Berikutnya
        </button>
      </div>
    </div>
  );
};

export default BlogPage;
