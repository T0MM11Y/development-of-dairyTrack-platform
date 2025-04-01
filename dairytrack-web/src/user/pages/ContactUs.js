import React from "react";

const ContactUs = () => {
  return (
    <div className="container py-5">
      <h2 className="text-2xl font-bold mb-4">Hubungi Kami</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="text-lg font-semibold mb-2">Informasi Kontak</h3>
          <p>📍 Alamat: Jl. Sapi Sehat No.123, Kecamatan Peternakan, Kabupaten Susu</p>
          <p>📞 Telepon: <a href="tel:+6281234567890" className="text-blue-600 hover:underline">+62 812 3456 7890</a></p>
          <p>✉️ Email: <a href="mailto:info@peternakansusu.com" className="text-blue-600 hover:underline">info@peternakansusu.com</a></p>
          <p>🌐 Website: <a href="https://www.peternakansusu.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">www.peternakansusu.com</a></p>
          <p>📱 Instagram: <a href="https://instagram.com/peternakansusu" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">@peternakansusu</a></p>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Kirim Pesan</h3>
          <form className="grid gap-3">
            <input
              type="text"
              placeholder="Nama Anda"
              className="border rounded px-3 py-2"
              required
            />
            <input
              type="email"
              placeholder="Email Anda"
              className="border rounded px-3 py-2"
              required
            />
            <textarea
              placeholder="Pesan Anda"
              className="border rounded px-3 py-2"
              rows="4"
              required
            ></textarea>
            <button
              type="submit"
              className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
            >
              Kirim Pesan
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
