import React from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col, Button, Form, InputGroup } from "react-bootstrap";
import logo from "../../assets/logo.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // Modern color palette - matching Home.js
  const primaryColor = "#4F7942"; // Forest green
  const secondaryColor = "#FFB347"; // Pastel orange
  const accentColor = "#5F9EA0"; // Cadet blue
  const darkBg = "#1A202C"; // Dark background
  const darkText = "#2D3748";
  const lightText = "#E2E8F0";

  return (
    <footer className="footer-section">
      <div className="footer-top">
        <Container>
          <Row className="justify-content-between">
            <Col lg={4} md={6} className="mb-5 mb-lg-0 footer-info">
              <div className="footer-logo mb-4">
                <img src={logo} alt="DairyTrack Logo" className="logo-image" />
                <span className="logo-text">DairyTrack</span>
              </div>
              <p className="footer-description">
                Premium quality dairy products from farm to table, maintaining
                the highest standards of freshness and taste while supporting
                sustainable farming practices.
              </p>
              <div className="footer-social-links">
                <a href="https://facebook.com" className="social-link">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="https://twitter.com" className="social-link">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="https://instagram.com" className="social-link">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="https://linkedin.com" className="social-link">
                  <i className="fab fa-linkedin-in"></i>
                </a>
                <a href="https://youtube.com" className="social-link">
                  <i className="fab fa-youtube"></i>
                </a>
              </div>
            </Col>

            <Col lg={2} md={6} className="mb-5 mb-lg-0 footer-links">
              <h5 className="footer-heading">Quick Links</h5>
              <ul className="footer-menu">
                <li>
                  <Link to="/">
                    <i className="fas fa-chevron-right"></i> Home
                  </Link>
                </li>
                <li>
                  <Link to="/about">
                    <i className="fas fa-chevron-right"></i> About Us
                  </Link>
                </li>
                <li>
                  <Link to="/product">
                    <i className="fas fa-chevron-right"></i> Products
                  </Link>
                </li>
                <li>
                  <Link to="/blog">
                    <i className="fas fa-chevron-right"></i> Blog
                  </Link>
                </li>
                <li>
                  <Link to="/gallery">
                    <i className="fas fa-chevron-right"></i> Gallery
                  </Link>
                </li>
                <li>
                  <Link to="/order">
                    <i className="fas fa-chevron-right"></i> Order Now
                  </Link>
                </li>
              </ul>
            </Col>

            <Col lg={3} md={6} className="mb-5 mb-lg-0 footer-contact">
              <h5 className="footer-heading">Contact Us</h5>
              <ul className="footer-contact-list">
                <li>
                  <i className="fas fa-map-marker-alt"></i>
                  <span>
                    123 Dairy Farm Road, Suite 100
                    <br />
                    Yogyakarta, Indonesia 55281
                  </span>
                </li>
                <li>
                  <i className="fas fa-phone"></i>
                  <span>(123) 456-7890</span>
                </li>
                <li>
                  <i className="fas fa-envelope"></i>
                  <span>info@dairytrack.com</span>
                </li>
                <li>
                  <i className="fas fa-clock"></i>
                  <span>Mon-Fri: 8:00 AM - 6:00 PM</span>
                </li>
                <li>
                  <i className="fas fa-globe"></i>
                  <span>www.dairytrack.com</span>
                </li>
              </ul>
            </Col>

            <Col lg={3} md={6} className="footer-map">
              <h5 className="footer-heading">Find Us</h5>
              <div className="map-container">
                <iframe
                  src="https://maps.google.com/maps?width=600&height=400&hl=en&q=Taman%20Sains%20Teknologi%20Herbal%20dan%20Hortikultura%20(TSTH2)&t=p&z=6&ie=UTF8&iwloc=B&output=embed"
                  title="DairyTrack Location"
                  className="google-map"
                  loading="lazy"
                  frameBorder="0"
                  allowFullScreen=""
                ></iframe>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      <div className="footer-bottom">
        <Container>
          <Row className="align-items-center">
            <Col md={6} className="text-center text-md-start">
              <p className="copyright">
                &copy; {currentYear} <strong>DairyTrack</strong>. All Rights
                Reserved
              </p>
            </Col>
            <Col md={6} className="text-center text-md-end">
              <p className="credits">Designed with by DairyTrack Team</p>
            </Col>
          </Row>
        </Container>
      </div>

      <style jsx="true">{`
        /* Footer Styles */
        .footer-section {
          background-color: ${darkBg};
          color: ${lightText};
          font-family: "Inter", sans-serif;
        }

        .footer-top {
          padding: 80px 0 50px;
        }

        /* Logo */
        .footer-logo {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
        }

        .logo-image {
          width: 45px;
          height: 45px;
          background-color: white;
          border-radius: 8px;
          padding: 5px;
        }

        .logo-text {
          margin-left: 10px;
          font-size: 24px;
          font-weight: 700;
          color: white;
          letter-spacing: 0.5px;
        }

        .footer-description {
          color: rgba(255, 255, 255, 0.7);
          font-size: 15px;
          line-height: 1.8;
          margin-bottom: 25px;
        }

        /* Social Links */
        .footer-social-links {
          display: flex;
          gap: 15px;
          margin-top: 25px;
        }

        .social-link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background-color: rgba(255, 255, 255, 0.1);
          color: white;
          transition: all 0.3s ease;
        }

        .social-link:hover {
          background-color: ${primaryColor};
          transform: translateY(-3px);
          color: white;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
        }

        /* Footer Headings */
        .footer-heading {
          position: relative;
          color: white;
          font-weight: 600;
          font-size: 20px;
          margin-bottom: 25px;
          padding-bottom: 10px;
        }

        .footer-heading::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 0;
          width: 50px;
          height: 3px;
          background-color: ${secondaryColor};
        }

        /* Footer Links */
        .footer-menu {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-menu li {
          margin-bottom: 12px;
        }

        .footer-menu a {
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          transition: all 0.3s ease;
          display: inline-block;
        }

        .footer-menu a:hover {
          color: white;
          transform: translateX(5px);
        }

        .footer-menu i {
          color: ${secondaryColor};
          font-size: 12px;
          margin-right: 8px;
          transition: all 0.3s ease;
        }

        /* Contact Info */
        .footer-contact-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-contact-list li {
          display: flex;
          margin-bottom: 15px;
          color: rgba(255, 255, 255, 0.7);
        }

        .footer-contact-list i {
          color: ${secondaryColor};
          width: 20px;
          margin-right: 10px;
          margin-top: 5px;
        }

        /* Map */
        .map-container {
          position: relative;
          width: 100%;
          height: 0;
          padding-bottom: 75%;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        .google-map {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: none;
        }

        /* Footer Bottom */
        .footer-bottom {
          background-color: rgba(0, 0, 0, 0.2);
          padding: 20px 0;
          font-size: 14px;
        }

        .copyright {
          margin-bottom: 0;
          color: rgba(255, 255, 255, 0.6);
        }

        .copyright strong {
          color: ${secondaryColor};
        }

        .credits {
          margin-bottom: 0;
          color: rgba(255, 255, 255, 0.6);
        }

        /* Responsive */
        @media (max-width: 991px) {
          .footer-info,
          .footer-links,
          .footer-contact,
          .footer-map {
            margin-bottom: 40px;
          }
        }

        @media (max-width: 767px) {
          .footer-top {
            padding: 50px 0 30px;
          }

          .footer-heading {
            margin-top: 30px;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
