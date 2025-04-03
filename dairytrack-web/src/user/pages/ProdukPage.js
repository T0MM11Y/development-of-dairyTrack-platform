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
    link: "produk-details.html",
    deskripsi: "Susu segar dengan kualitas terbaik untuk kesehatan Anda.",
  },
  {
    nama: "Susu Pasteurisasi",
    image: susuPasteurisasi,
    link: "produk-details.html",
    deskripsi: "Susu pasteurisasi yang aman dan bergizi untuk keluarga.",
  },
  {
    nama: "Yogurt Rasa Buah",
    image: yogurtRasaBuah,
    link: "produk-details.html",
    deskripsi: "Yogurt segar dengan berbagai pilihan rasa buah alami.",
  },
  {
    nama: "Keju Mozzarella & Cheddar",
    image: kejuMozzarellaCheddar,
    link: "produk-details.html",
    deskripsi: "Keju berkualitas tinggi untuk hidangan lezat Anda.",
  },
  {
    nama: "Susu Rendah Lemak",
    image: susuRendahLemak,
    link: "produk-details.html",
    deskripsi: "Pilihan terbaik untuk gaya hidup sehat Anda.",
  },
  {
    nama: "Susu Sapi Organik",
    image: susuSegarFullCream,
    link: "produk-details.html",
    deskripsi:
      "Susu sapi segar yang dihasilkan dari sapi yang diberi pakan organik.",
  },
];

const ProdukPage = () => {
  return (
    <div className="container mx-auto py-5 px-4" style={{ marginTop: "120px" }}>
      <div
        className="p-5 mt-32"
        style={{ backgroundColor: "#f8f9fa", borderRadius: "8px" }}
      >
        <h2 className="text-2xl font-bold text-center text-gray-800">
          Produk Susu Kami
        </h2>
        <p
          className="text-gray-600 mt-3 text-center text-lg italic p-4 rounded-md shadow-sm inline-block"
          style={{ backgroundColor: "#e9ecef" }}
        >
          Produk susu berkualitas tinggi yang diolah dengan standar terbaik
          untuk memastikan kesegaran, rasa, dan manfaat gizi bagi Anda dan
          keluarga.
        </p>
      </div>

      {/* Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
        {produkList.map((produk, index) => (
          <ProdukItem key={index} {...produk} />
        ))}
      </div>
    </div>
  );
};

const ProdukItem = ({ nama, image, link, deskripsi }) => {
  return (
    <div
      className="shadow-lg rounded-lg overflow-hidden"
      style={{ backgroundColor: "#f8f9fa" }}
    >
      {/* Gambar */}
      <img src={image} alt={nama} className="w-full h-40 object-cover" />

      {/* Detail */}
      <div className="p-4">
        <h5 className="text-lg font-semibold text-gray-800">{nama}</h5>
        <p className="text-gray-600 mt-2">{deskripsi}</p>

        {/* Tombol di bawah */}
        <div className="mt-4 text-right">
          <a href={link} className="text-blue-500 hover:underline">
            View Details
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProdukPage;
