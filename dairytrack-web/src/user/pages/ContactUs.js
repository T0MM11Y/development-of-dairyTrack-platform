import React from 'react';
import './ContactUs.css';

const ContactUs = () => {
  return (
    <div className="contact-container">
      {/* Peta Lokasi */}
      <div className="contact-map">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3985.955655519632!2d98.6253594!3d2.2886875!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x302e0787e9196b01%3A0x67392c0157f55171!2s7JQG%2BF4H%2C%20Aek%20Nauli%20I%2C%20Kec.%20Pollung%2C%20Kabupaten%20Humbang%20Hasundutan%2C%20Sumatera%20Utara%2022456!5e0!3m2!1sen!2sid!4v1684305845722!5m2!1sen!2sid"
          width="100%"
          height="450"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          title="Peta Pollung Humbang Hasundutan"
        ></iframe>
      </div>

      {/* Header "Hubungi Kami" dipindahkan ke sini */}
      <h2 className="contact-header">Hubungi Kami</h2>

      {/* Formulir Kontak */}
      <div className="contact-form-container">
        <form className="contact-form">
          <input type="text" placeholder="Nama Anda" required />
          <input type="email" placeholder="Email Anda" required />
          <textarea placeholder="Pesan Anda" required></textarea>
          <button type="submit">Kirim Pesan</button>
        </form>
      </div>

      {/* Informasi Kontak */}
      <div className="contact-info-container">
        <div className="contact-info-box">
          <i className="fas fa-map-marker-alt"></i>
          <h3>Alamat</h3>
          <p>Pollung, Humbang Hasundutan, Sumatera Utara, Indonesia</p>
        </div>
        <div className="contact-info-box">
          <i className="fas fa-phone"></i>
          <h3>Telepon</h3>
          <p>+62 123 456 7890</p>
        </div>
        <div className="contact-info-box">
          <i className="fas fa-envelope"></i>
          <h3>Email</h3>
          <p>info@pollung.com</p>
        </div>
      </div>

      {/* Footer */}
      <div className="contact-footer">
        <p>Ada pertanyaan? Jangan ragu untuk menghubungi kami.</p>
        <p>
          <strong>Terima Kasih!!!</strong>
        </p>
      </div>
    </div>
  );
};

export default ContactUs;