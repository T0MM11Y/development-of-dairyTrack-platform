import React from "react";
import susuSegarFullCream from "../../assets/image/sususegarfullcreamm.jpeg";
import susuPasteurisasi from "../../assets/image/SusuPasteurisasi.jpg";
import yogurtRasaBuah from "../../assets/image/YogurtRasaBuah.jpg";
import kejuMozzarellaCheddar from "../../assets/image/KejuMozzarellaCheddar.jpg";
import susuRendahLemak from "../../assets/image/SusuRendahLemak.jpeg";
import "../../assets/client/css/publicUserProduct.css";

const produkList = [
  {
    nama: "Susu Segar Full Cream",
    image: susuSegarFullCream,
    link: "productdetails.js",
    deskripsi: "Susu segar dengan kualitas terbaik untuk kesehatan Anda.",
    harga: "Rp 30.000",
  },
  {
    nama: "Susu Pasteurisasi",
    image: susuSegarFullCream,
    link: "productdetails.js",
    deskripsi: "Susu pasteurisasi yang aman dan bergizi untuk keluarga.",
    harga: "Rp 25.000",
  },
  {
    nama: "Yogurt Rasa Buah",
    image: yogurtRasaBuah,
    link: "productdetails.js",
    deskripsi: "Yogurt segar dengan berbagai pilihan rasa buah alami.",
    harga: "Rp 20.000",
  },
  {
    nama: "Keju Mozzarella & Cheddar",
    image: kejuMozzarellaCheddar,
    link: "productdetails.js",
    deskripsi: "Keju berkualitas tinggi untuk hidangan lezat Anda.",
    harga: "Rp 40.000",
  },
  {
    nama: "Susu Rendah Lemak",
    image: susuSegarFullCream,
    link: "productdetails.js",
    deskripsi: "Pilihan terbaik untuk gaya hidup sehat Anda.",
    harga: "Rp 35.000",
  },
  {
    nama: "Susu Sapi Organik",
    image: susuSegarFullCream,
    link: "productdetails.js",
    deskripsi:
      "Susu sapi segar yang dihasilkan dari sapi yang diberi pakan organik.",
    harga: "Rp 50.000",
  },
];

const ProdukPage = () => {
  return (
    <div
      className="container mx-auto py-5"
      style={{ marginTop: "170px", marginBottom: "100px" }}
    >
      {/* Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
        {produkList.map((produk, index) => (
          <ProdukItem key={index} {...produk} />
        ))}
      </div>
    </div>
  );
};

const ProdukItem = ({ nama, image, link, deskripsi, harga }) => {
  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Gambar */}
      <img src={image} alt={nama} className="w-full h-40 object-cover" />

      {/* Detail */}
      <div className="p-4">
        <h5 className="product-name">{nama}</h5>
        {/* Deskripsi */}
        <p className="text-gray-600 mt-2">{deskripsi}</p>

        {/* Harga */}
        <div className="product-price">{harga}</div>

        {/* Rating dan Jumlah Terjual */}
        <div className="mt-2 flex items-center text-gray-700 text-sm">
          <span className="text-yellow-400 text-lg">⭐</span>
          <span className="ml-1 font-medium">4.9</span>
          <span className="mx-2">|</span>
          <span>5 terjual</span>
        </div>

        {/* Tombol View Details */}
        <div className="mt-4 text-center">
          <a
            href={`/blog/${nama.replace(/\s+/g, "-").toLowerCase()}`}
            className="view-details-btn"
          >
            View Details
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProdukPage;
