import React from "react";

function Footer() {
  return (
    <footer
      className="footer"
      style={{
        width: "100%",
      }}
    >
      <div className="container">
        <div className="row justify-content-between">
          {/* Contact Section */}
          <div className="col-lg-4">
            <div className="footer__widget">
              <div className="fw-title">
                <h5 className="sub-title">Contact Us</h5>
                <h4 className="title">+81383 766 284</h4>
              </div>
              <div className="footer__widget__text">
                <p>
                  There are many variations of passages of Lorem Ipsum
                  available, but the majority have suffered alteration in some
                  form.
                </p>
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="col-xl-3 col-lg-4 col-sm-6">
            <div className="footer__widget">
              <div className="fw-title">
                <h5 className="sub-title">My Address</h5>
                <h4 className="title">Australia</h4>
              </div>
              <address className="footer__widget__address">
                <p>
                  Level 13, 2 Elizabeth Street <br /> Melbourne, Victoria 3000
                </p>
                <a
                  href="mailto:noreply@envato.com"
                  className="mail"
                  rel="noopener noreferrer"
                >
                  noreply@envato.com
                </a>
              </address>
            </div>
          </div>

          {/* Social Media Section */}
          <div className="col-xl-3 col-lg-4 col-sm-6">
            <div className="footer__widget">
              <div className="fw-title">
                <h5 className="sub-title">Follow Me</h5>
                <h4 className="title">Socially Connect</h4>
              </div>
              <div className="footer__widget__social">
                <p>
                  Stay connected with us on social media for the latest updates.
                </p>
                <nav>
                  <ul className="footer__social__list">
                    <li>
                      <a
                        href="#"
                        aria-label="Facebook"
                        rel="noopener noreferrer"
                      >
                        <i className="fab fa-facebook-f"></i>
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        aria-label="Twitter"
                        rel="noopener noreferrer"
                      >
                        <i className="fab fa-twitter"></i>
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        aria-label="Behance"
                        rel="noopener noreferrer"
                      >
                        <i className="fab fa-behance"></i>
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        aria-label="LinkedIn"
                        rel="noopener noreferrer"
                      >
                        <i className="fab fa-linkedin-in"></i>
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
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="copyright__wrap">
          <div className="row">
            <div className="col-12">
              <div className="copyright__text text-center">
                <p>
                  Copyright &copy; {new Date().getFullYear()} All Rights
                  Reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
