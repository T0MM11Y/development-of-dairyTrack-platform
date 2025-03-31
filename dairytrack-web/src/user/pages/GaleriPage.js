import React from "react";
import sapi1 from "../../assets/image/1.jpg"; // pastikan path ini benar

const GaleriPage = () => {
  return (
    <div className="container py-5">
      <h2 className="text-2xl font-bold mb-4">Galeri Foto & Video</h2>
      <div className="grid grid-cols-3 gap-4">
        <img src={sapi1} alt="Sapi 1" className="rounded w-full h-40 object-cover" />
        <img src={sapi1} alt="Sapi 2" className="rounded w-full h-40 object-cover" />
        <img src={sapi1} alt="Pemerahan" className="rounded w-full h-40 object-cover" />
      </div>
    </div>
  );
};

export default GaleriPage;
