// PemesananComponents/ContactInfo.jsx
import React from "react";

const ContactInfo = () => {
  return (
    <>
      {/* Header */}
      <h2 className="contact-header">Hubungi Kami</h2>
      
      {/* Informasi Kontak
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
      </div> */}
      
      {/* Footer */}
      <div className="contact-footer">
        <p className="footer-text">Punya pertanyaan? <a href="mailto:info@pollung.com" className="footer-link">Hubungi kami sekarang!</a></p>
        <div className="social-icons">
          <a href="https://instagram.com/pollung" target="_blank" rel="noopener noreferrer" className="social-icon">
            <i className="fab fa-instagram"></i>
          </a>
          <a href="https://facebook.com/pollung" target="_blank" rel="noopener noreferrer" className="social-icon">
            <i className="fab fa-facebook-f"></i>
          </a>
          <a href="https://wa.me/621234567890" target="_blank" rel="noopener noreferrer" className="social-icon">
            <i className="fab fa-whatsapp"></i>
          </a>
        </div>
      </div>
    </>
  );
};

export default ContactInfo;