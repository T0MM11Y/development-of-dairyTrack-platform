import React from "react";
import sapi1 from "../../assets/image/1.jpg"; // pastikan path ini benar

const FasilitasPage = () => {
  return (
    <div className="container py-5">
      <h2 className="text-2xl font-bold mb-4">Fasilitas dan Lingkungan</h2>
      <p>Peternakan kami memiliki luas lahan 5 hektar yang dilengkapi dengan kandang modern, ruang pemerahan, ruang penyimpanan susu, dan area terbuka hijau untuk sapi.</p>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <img src={sapi1} alt="Kandang Sapi" className="w-full h-48 object-cover rounded" />
        <img src={sapi1} alt="Fasilitas Peternakan" className="w-full h-48 object-cover rounded" />
      </div>
    </div>
  );
};

export default FasilitasPage;
