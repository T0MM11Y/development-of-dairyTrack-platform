import React from 'react';
import './ContactUs.css'; // Import file CSS

const ContactUs = () => {
  return (
    <div className="contact-container">
      <div className="contact-map">
        {/* Tambahkan peta Google Maps di sini */}
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3985.955655519632!2d98.7230903!3d2.3338904!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x302e0787e9196b01%3A0x67392c0157f55171!2sKecamatan%20Pollung%2C%20Kec.%20Pollung%2C%20Kabupaten%20Humbang%20Hasundutan%2C%20Sumatera%20Utara%2C%20Indonesia!5e0!3m2!1sen!2sid!4v1684305845722!5m2!1sen!2sid"
          width="100%"
          height="450"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          title="Peta Pollung Humbang Hasundutan"
        ></iframe>
      </div>
      <div className="contact-form-container">
        <div className="contact-form">
          <input type="text" placeholder="Nama Anda" />
          <input type="email" placeholder="Email Anda" />
          <textarea placeholder="Pesan Anda"></textarea>
          <button>Kirim Pesan</button>
        </div>
      </div>
      <div className="contact-info-container">
        <div className="contact-info">
          <div className="contact-info-item">
            <i className="fas fa-map-marker-alt"></i>
            <p>Alamat: Pollung, Humbang Hasundutan, Sumatera Utara, Indonesia</p>
          </div>
          <div className="contact-info-item">
            <i className="fas fa-phone"></i>
            <p>Telepon: +62 123 456 7890</p>
          </div>
          <div className="contact-info-item">
            <i className="fas fa-envelope"></i>
            <p>Email: info@pollung.com</p>
          </div>
        </div>
      </div>
      <div className="contact-footer">
        <p>Ada pertanyaan? Jangan ragu untuk menghubungi kami.</p>
        <p>info@pollung.com</p>
      </div>
    </div>
  );
};

export default ContactUs;