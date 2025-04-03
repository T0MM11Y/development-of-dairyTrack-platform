import React from "react";

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="row justify-content-between">
          <div className="col-lg-4">
            <div className="footer__widget">
              <div className="fw-title">
                <h5 className="sub-title">Contact us</h5>
                <h4 className="title">+81383 766 284</h4>
              </div>
              <div className="footer__widget__text">
                <p>
                  There are many variations of passages of lorem ipsum available
                  but the majority have suffered alteration in some form is also
                  here.
                </p>
              </div>
            </div>
          </div>
          <div className="col-xl-3 col-lg-4 col-sm-6">
            <div className="footer__widget">
              <div className="fw-title">
                <h5 className="sub-title">my address</h5>
                <h4 className="title">AUSTRALIA</h4>
              </div>
              <div className="footer__widget__address">
                <p>
                  Level 13, 2 Elizabeth Steereyt set <br /> Melbourne, Victoria
                  3000
                </p>
                <a href="mailto:noreply@envato.com" className="mail">
                  noreply@envato.com
                </a>
              </div>
            </div>
          </div>
          <div className="col-xl-3 col-lg-4 col-sm-6">
            <div className="footer__widget">
              <div className="fw-title">
                <h5 className="sub-title">Follow me</h5>
                <h4 className="title">socially connect</h4>
              </div>
              <div className="footer__widget__social">
                <p>
                  Lorem ipsum dolor sit amet enim. <br /> Etiam ullamcorper.
                </p>
                <ul className="footer__social__list">
                  <li>
                    <a href="#">
                      <i className="fab fa-facebook-f"></i>
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <i className="fab fa-twitter"></i>
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <i className="fab fa-behance"></i>
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <i className="fab fa-linkedin-in"></i>
                    </a>
                  </li>
                  <li>
                    <a href="#">
                      <i className="fab fa-instagram"></i>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="copyright__wrap">
          <div className="row">
            <div className="col-12">
              <div className="copyright__text text-center">
                <p>Copyright @ tsth 2025 All right Reserved</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
