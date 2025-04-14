import React from "react";

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="row justify-content-between">
          {/* Contact Section */}
          <div className="col-lg-4">
            <div className="footer__widget">
              <div className="fw-title">
                <h5 className="sub-title">Hubungi Kami</h5>
                <h4 className="title">+62 813 8376 6284</h4>
              </div>
              <div className="footer__widget__text">
                <p>
                  Taman Sains Teknologi Herbal dan Hortikultura (TSTH2) adalah
                  pusat penelitian dan pengembangan herbal dan hortikultura di
                  Sumatera Utara.
                </p>
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="col-xl-3 col-lg-4 col-sm-6">
            <div className="footer__widget">
              <div className="fw-title">
                <h5 className="sub-title">Alamat Kami</h5>
                <h4 className="title">Sumatera Utara</h4>
              </div>
              <div className="footer__widget__address">
                <p>
                  7JQG+F4H, Aek Nauli I, Kec. Pollung, <br />
                  Kabupaten Humbang Hasundutan, Sumatera Utara 22456
                </p>
                <a
                  href="mailto:info@tsth2.com"
                  className="mail"
                  rel="noopener noreferrer"
                >
                  info@tsth2.com
                </a>
              </div>
            </div>
          </div>

          {/* Social Media Section */}
          <div className="col-xl-3 col-lg-4 col-sm-6">
            <div className="footer__widget">
              <div className="fw-title">
                <h5 className="sub-title">Ikuti Kami</h5>
                <h4 className="title">Terhubung Sosial</h4>
              </div>
              <div className="footer__widget__social">
                <p>
                  Temukan informasi terbaru tentang TSTH2 di media sosial kami.
                </p>
                <ul className="footer__social__list">
                  <li>
                    <a href="#" aria-label="Facebook" rel="noopener noreferrer">
                      <i className="fab fa-facebook-f"></i>
                    </a>
                  </li>
                  <li>
                    <a href="#" aria-label="Twitter" rel="noopener noreferrer">
                      <i className="fab fa-twitter"></i>
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      aria-label="Instagram"
                      rel="noopener noreferrer"
                    >
                      <i className="fab fa-instagram"></i>
                    </a>
                  </li>
                  <li>
                    <a href="#" aria-label="LinkedIn" rel="noopener noreferrer">
                      <i className="fab fa-linkedin-in"></i>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="copyright__wrap">
          <div className="row">
            <div className="col-12">
              <div className="copyright__text text-center">
                <p>Copyright @ TSTH2 2023 All rights reserved</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
