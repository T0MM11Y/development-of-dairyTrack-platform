import React from "react";
import susuSegarFullCream from "../../assets/image/sususegarfullcreamm.jpeg";
import susuPasteurisasi from "../../assets/image/SusuPasteurisasi.jpg";
import yogurtRasaBuah from "../../assets/image/YogurtRasaBuah.jpg";
import kejuMozzarellaCheddar from "../../assets/image/KejuMozzarellaCheddar.jpg";
import susuRendahLemak from "../../assets/image/SusuRendahLemak.jpeg";

const produkList = [
  { nama: "Susu Segar Full Cream", image: susuSegarFullCream, link: "produk-details.html", deskripsi: "Susu segar dengan kualitas terbaik untuk kesehatan Anda." },
  { nama: "Susu Pasteurisasi", image: susuPasteurisasi, link: "produk-details.html", deskripsi: "Susu pasteurisasi yang aman dan bergizi untuk keluarga." },
  { nama: "Yogurt Rasa Buah", image: yogurtRasaBuah, link: "produk-details.html", deskripsi: "Yogurt segar dengan berbagai pilihan rasa buah alami." },
  { nama: "Keju Mozzarella & Cheddar", image: kejuMozzarellaCheddar, link: "produk-details.html", deskripsi: "Keju berkualitas tinggi untuk hidangan lezat Anda." },
  { nama: "Susu Rendah Lemak", image: susuRendahLemak, link: "produk-details.html", deskripsi: "Pilihan terbaik untuk gaya hidup sehat Anda." }
];

const ProdukPage = () => {
  return (
    <div className="container mx-auto py-5">
      <h2 className="text-2xl font-bold text-center mb-70">Produk Susu Kami</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">
      {produkList.map((produk, index) => (
            <ProdukItem key={index} {...produk} />
          ))}
        </div>
      </div>
  );
};

const ProdukItem = ({ nama, image, link, deskripsi }) => {
  return (
    <div className="col-xl-11 col-lg-12 p-10">
      <div className="banner__content border rounded-lg shadow-lg bg-white transition-transform transform hover:scale-105 flex items-center">
        <div className="produk_inner_thumb w-1/2">
          <a href={link}>
            <img src={image} alt={nama} className="w-full h-full object-cover rounded-l-lg" /> 
          </a>
        </div>
        
        {/* Teks Nama & Deskripsi */}
        <div className="p-4 w-1/2 flex flex-col justify-center">
          <h2 className="title text- font-semibold mb-3">
            <a href={link}>{nama}</a>
          </h2>
          <p className="text-gray-600 mb-9">{deskripsi}</p>
          <a href={link} className="btn text-blue-500 hover:underline">View Details</a>
        </div>
      </div>
    </div>
  );
};


export default ProdukPage;