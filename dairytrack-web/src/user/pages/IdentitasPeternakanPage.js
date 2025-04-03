import React from "react";

const IdentitasPeternakanPage = () => {
  return (
    <div className="container py-5">
      <h2 className="text-2xl font-bold mb-4">Identitas Peternakan</h2>
      <img src="/assets/images/logo.png" alt="Logo Peternakan" className="w-32 mb-2" />
      <p className="text-lg font-semibold">Peternakan Sapi Sejahtera</p>
      <p className="italic">"Susu segar dari alam untuk keluarga Indonesia"</p>

      <div className="mt-4">
        <h4 className="font-semibold">Lokasi:</h4>
        <p>Jl. Sapi Perah No. 123, Desa Ternak, Kecamatan Subur, Kabupaten Sejahtera</p>
      </div>

      <div className="mt-4">
        <h4 className="font-semibold">Kontak:</h4>
        <ul>
          <li>📞 0812-3456-7890</li>
          <li>✉️ email@peternakansejahtera.com</li>
          <li>🌐 www.peternakansejahtera.com</li>
          <li>📱 Instagram: @peternakansejahtera</li>
        </ul>
      </div>
    </div>
  );
};

export default IdentitasPeternakanPage;
