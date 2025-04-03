import React from 'react';
import './ContactUs.css';

const ContactUs = () => {
  return (
    <main>
      <section className="breadcrumb_wrap">
        <div className="container custom-container">
          <div className="row justify-content-center">
            <div className="col-xl-6 col-lg-8 col-md-10">
              <div className="breadcrumb_wrap_content">
                <div className="breadcrumb-text-container"> {/* Bungkus judul dan breadcrumb */}
                  <h2 className="title">Contact us</h2>
                  <nav aria-label="breadcrumb">
                    <ol className="breadcrumb">
                      <li className="breadcrumb-item">
                        <a href="/Dashboard">Home</a>
                      </li>
                      <li className="breadcrumb-item active" aria-current="page">
                        Contact
                      </li>
                    </ol>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="breadcrumb_wrap_icon">
          <ul>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
          </ul>
        </div>
        <div className="app-icon Pakan"></div>
        <div className="app-icon Kesehatan"></div>
        <div className="app-icon Susu"></div>
        <div className="app-icon Keuangan"></div>
        <div className="app-icon Sapi"></div>
        <div className="app-icon Ternak"></div>
      </section>

      <div className="contact-container">
        {/* Container untuk peta dan form */}
        <div className="map-form-container">
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

          {/* Formulir Kontak */}
          <div className="contact-form-container">
            <form className="contact-form">
              <input type="text" placeholder="Nama Anda" required />
              <input type="email" placeholder="Email Anda" required />
              <textarea placeholder="Pesan Anda" required></textarea>
              <button type="submit">Kirim Pesan</button>
            </form>
          </div>
        </div>

        {/* Header "Hubungi Kami" dipindahkan ke sini */}
        <h2 className="contact-header">Hubungi Kami</h2>

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
    </main>
  );
};

export default ContactUs;