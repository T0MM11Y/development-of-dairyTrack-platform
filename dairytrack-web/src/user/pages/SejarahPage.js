import React from "react";

const SejarahPage = () => {
  return (
    <div className="container py-5">
      <h2 className="text-2xl font-bold mb-4">Sejarah & Latar Belakang</h2>
      <p>Peternakan Sapi Sejahtera didirikan pada tahun 2005 oleh sekelompok peternak yang memiliki visi untuk menyediakan susu berkualitas tinggi di wilayah Sumatera Utara.</p>

      <div className="mt-4">
        <h4 className="font-semibold">Visi:</h4>
        <p>Menjadi peternakan sapi perah terbaik dan terpercaya di Indonesia.</p>

        <h4 className="font-semibold mt-3">Misi:</h4>
        <ul className="list-disc ml-6">
          <li>Memberikan produk susu sehat dan alami</li>
          <li>Meningkatkan kesejahteraan peternak</li>
          <li>Menjaga kelestarian lingkungan</li>
        </ul>

        <h4 className="font-semibold mt-3">Nilai-nilai:</h4>
        <ul className="list-disc ml-6">
          <li>Kesejahteraan hewan</li>
          <li>Transparansi dan kualitas</li>
          <li>Keberlanjutan produksi</li>
        </ul>
      </div>
    </div>
  );
};

export default SejarahPage;
