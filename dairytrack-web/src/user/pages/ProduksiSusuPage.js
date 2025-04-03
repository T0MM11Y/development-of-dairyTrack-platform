import React from "react";

const ProduksiSusuPage = () => {
  return (
    <div className="container py-5">
      <h2 className="text-2xl font-bold mb-4">Proses Produksi Susu</h2>
      <p>
        Kami menerapkan standar tinggi dalam pemeliharaan sapi dan proses produksi susu. Proses pemerahan dilakukan dua kali sehari menggunakan alat otomatis, kemudian susu disimpan dalam suhu rendah untuk menjaga kesegarannya sebelum didistribusikan ke pasar.
      </p>

      <div className="grid grid-cols-3 gap-4 mt-4">
        <img src="/assets/images/pemeliharaan.jpg" alt="Pemeliharaan Sapi" className="w-full h-40 object-cover rounded" />
        <img src="/assets/images/pemerahan.jpg" alt="Pemerahan Susu" className="w-full h-40 object-cover rounded" />
        <img src="/assets/images/penyimpanan.jpg" alt="Penyimpanan Susu" className="w-full h-40 object-cover rounded" />
      </div>
    </div>
  );
};

export default ProduksiSusuPage;
