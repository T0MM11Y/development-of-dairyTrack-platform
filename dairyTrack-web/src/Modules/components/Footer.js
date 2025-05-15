import React from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import logo from "../../assets/logo.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark text-light pt-5 pb-4">
      <Container>
        <Row className="mb-4">
          <Col lg={3} md={6} className="mb-4 mb-md-0">
            <div className="mb-3 d-flex align-items-center">
              <img
                src={logo}
                alt="DairyTrack Logo"
                width="40"
                height="40"
                className="d-inline-block logo-bg-white"
              />
              <span
                className="ms-2"
                style={{
                  fontWeight: 800,
                  fontSize: "20px",
                  fontFamily: "revert",
                  letterSpacing: "1.8px",
                }}
              >
                DairyTrack
              </span>
            </div>
            {/* Changed from "text-muted text-light" to just "text-light" */}
            <p className="text-light">
              Premium quality dairy products from farm to table, maintaining the
              highest standards of freshness and taste.
            </p>
            <div className="d-flex mt-3 social-icons">
              <a href="https://facebook.com" className="me-3 text-light">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="https://instagram.com" className="me-3 text-light">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://twitter.com" className="me-3 text-light">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="https://youtube.com" className="text-light">
                <i className="fab fa-youtube"></i>
              </a>
            </div>
          </Col>

          <Col lg={3} md={6} className="mb-4 mb-md-0">
            <h5 className="mb-3">Quick Links</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                {/* Consider changing all menu links from "text-muted" to "text-light text-opacity-75" */}
                <Link
                  to="/"
                  className="text-decoration-none text-light text-opacity-75"
                >
                  <i className="fas fa-angle-right me-2"></i>Home
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="/about"
                  className="text-decoration-none text-light text-opacity-75"
                >
                  <i className="fas fa-angle-right me-2"></i>About Us
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="/product"
                  className="text-decoration-none text-light text-opacity-75"
                >
                  <i className="fas fa-angle-right me-2"></i>Products
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="/blog"
                  className="text-decoration-none text-light text-opacity-75"
                >
                  <i className="fas fa-angle-right me-2"></i>Blog
                </Link>
              </li>
            </ul>
          </Col>

          <Col lg={3} md={6} className="mb-4 mb-md-0">
            <h5 className="mb-3">More Info</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link
                  to="/gallery"
                  className="text-decoration-none text-light text-opacity-75"
                >
                  <i className="fas fa-angle-right me-2"></i>Gallery
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="/order"
                  className="text-decoration-none text-light text-opacity-75"
                >
                  <i className="fas fa-angle-right me-2"></i>Order Now
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="/privacy"
                  className="text-decoration-none text-light text-opacity-75"
                >
                  <i className="fas fa-angle-right me-2"></i>Privacy Policy
                </Link>
              </li>
              <li className="mb-2">
                <Link
                  to="/terms"
                  className="text-decoration-none text-light text-opacity-75"
                >
                  <i className="fas fa-angle-right me-2"></i>Terms & Conditions
                </Link>
              </li>
            </ul>
          </Col>

          <Col lg={3} md={6}>
            <h5 className="mb-3">Contact Us</h5>
            <ul className="list-unstyled">
              <li className="mb-2 text-light text-opacity-75">
                <i className="fas fa-map-marker-alt me-2"></i>123 Dairy Farm
                Road, Suite 100
              </li>
              <li className="mb-2 text-light text-opacity-75">
                <i className="fas fa-phone me-2"></i>(123) 456-7890
              </li>
              <li className="mb-2 text-light text-opacity-75">
                <i className="fas fa-envelope me-2"></i>info@dairytrack.com
              </li>
              <li className="mb-2 text-light text-opacity-75">
                <i className="fas fa-clock me-2"></i>Mon-Fri: 8:00 AM - 6:00 PM
              </li>
            </ul>
          </Col>
        </Row>

        <hr className="mt-4 mb-4" style={{ backgroundColor: "#ffffff33" }} />

        <Row>
          <Col md={6} className="text-center text-md-start">
            <p className="small text-light text-opacity-75 mb-0">
              &copy; {currentYear} DairyTrack. All rights reserved.
            </p>
          </Col>
          <Col md={6} className="text-center text-md-end">
            <p className="small text-light text-opacity-75 mb-0">
              Designed with by Developers{" "}
            </p>
          </Col>
        </Row>
      </Container>

      {/* Custom CSS for Footer */}
      <style jsx="true">{`
        footer .social-icons a {
          transition: all 0.3s ease;
          opacity: 0.7;
        }

        footer .social-icons a:hover {
          opacity: 1;
          transform: translateY(-3px);
        }

        footer a.text-light.text-opacity-75:hover {
          opacity: 1 !important;
          color: #ffffff !important;
          text-decoration: none;
        }

        footer .logo-bg-white {
          background-color: white;
          border-radius: 5px;
          padding: 2px;
        }

        @media (max-width: 767px) {
          footer h5 {
            margin-top: 20px;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
