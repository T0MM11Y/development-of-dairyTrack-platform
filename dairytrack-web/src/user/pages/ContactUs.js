import React from "react";

const ContactUs = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <h2 className="text-3xl font-bold mb-8 text-center md:text-left">Hubungi Kami</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Formulir (Sebelah Kiri) */}
        <div className="bg-gray-100 p-6 rounded-lg"> 
          <h3 className="text-xl font-semibold mb-4">Kirim Pesan</h3>
          <form className="grid gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama</label>
              <input
                type="text"
                id="name"
                placeholder="Nama Anda"
                className="mt-1 block w-full border rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="email"
                placeholder="Email Anda"
                className="mt-1 block w-full border rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">Pesan</label>
              <textarea
                id="message"
                placeholder="Pesan Anda"
                rows="4"
                className="mt-1 block w-full border rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              ></textarea>
            </div>
            <button
              type="submit"
              className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 w-full"
            >
              Kirim
            </button>
          </form>
        </div>

        {/* Informasi Kontak (Sebelah Kanan) */}
        <div className="bg-gray-100 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Informasi Kontak</h3>
          <div>
            <p className="mb-2">
              <strong>Alamat:</strong> Jl. Sapi Sehat No.123, Kecamatan Peternakan, Kabupaten Susu
            </p>
            <p className="mb-2">
              <strong>Telepon:</strong> <a href="tel:+6281234567890" className="text-blue-600 hover:underline">+62 812 3456 7890</a>
            </p>
            <p className="mb-2">
              <strong>Email:</strong> <a href="mailto:info@peternakansusu.com" className="text-blue-600 hover:underline">info@peternakansusu.com</a>
            </p>
            <p className="mb-2">
              <strong>Website:</strong> <a href="https://www.peternakansusu.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">www.peternakansusu.com</a>
            </p>
            <p>
              <strong>Instagram:</strong> <a href="https://instagram.com/peternakansusu" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">@peternakansusu</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;