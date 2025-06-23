import React from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col } from "react-bootstrap";
import { motion } from "framer-motion";
import logo from "../../assets/logo.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  // Enhanced theme
  const theme = {
    primary: "#4F7942", // Forest green
    secondary: "#FFB347", // Pastel orange
    accent: "#E9A319", // Gold accent
    dark: {
      bg: "#0F1419", // Darker background
      surface: "#1A202C", // Surface color
      border: "#2D3748", // Border color
    },
    light: {
      primary: "#E2E8F0", // Light text
      secondary: "rgba(255, 255, 255, 0.8)", // Subtle text
      muted: "rgba(255, 255, 255, 0.6)", // Muted text
    },
    gradients: {
      primary: "linear-gradient(135deg, #4F7942 0%, #6B8E5A 100%)",
      secondary: "linear-gradient(135deg, #FFB347 0%, #FF9E47 100%)",
      surface: "linear-gradient(145deg, #1A202C 0%, #2D3748 100%)",
      glow: "linear-gradient(135deg, rgba(233, 163, 25, 0.2) 0%, rgba(79, 121, 66, 0.2) 100%)",
    },
    shadows: {
      card: "0 10px 40px rgba(0, 0, 0, 0.3)",
      glow: "0 0 30px rgba(233, 163, 25, 0.2)",
      hover: "0 20px 60px rgba(0, 0, 0, 0.4)",
    },
  };

  // Animation variants
  const animations = {
    fadeInUp: {
      hidden: { opacity: 0, y: 60 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
      },
    },
    staggerContainer: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.15,
          delayChildren: 0.1,
        },
      },
    },
    scaleIn: {
      hidden: { opacity: 0, scale: 0.8 },
      visible: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.6, ease: "easeOut" },
      },
    },
    slideInLeft: {
      hidden: { opacity: 0, x: -50 },
      visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.6, ease: "easeOut" },
      },
    },
    slideInRight: {
      hidden: { opacity: 0, x: 50 },
      visible: {
        opacity: 1,
        x: 0,
        transition: { duration: 0.6, ease: "easeOut" },
      },
    },
    float: {
      y: [0, -10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const quickLinks = [
    { to: "/", label: "Home", icon: "fas fa-home" },
    { to: "/about", label: "About", icon: "fas fa-info-circle" },
    { to: "/blog", label: "Blog", icon: "fas fa-blog" },
    { to: "/gallery", label: "Gallery", icon: "fas fa-images" },
  ];

  const socialLinks = [
    {
      href: "https://facebook.com",
      icon: "fab fa-facebook-f",
      label: "Facebook",
      color: "#1877F2",
    },
    {
      href: "https://twitter.com",
      icon: "fab fa-twitter",
      label: "Twitter",
      color: "#1DA1F2",
    },
    {
      href: "https://instagram.com",
      icon: "fab fa-instagram",
      label: "Instagram",
      color: "#E4405F",
    },
    {
      href: "https://linkedin.com",
      icon: "fab fa-linkedin-in",
      label: "LinkedIn",
      color: "#0A66C2",
    },
    {
      href: "https://youtube.com",
      icon: "fab fa-youtube",
      label: "YouTube",
      color: "#FF0000",
    },
  ];

  const contactInfo = [
    {
      icon: "fas fa-map-marker-alt",
      title: "Address",
      content:
        "Kec. Pollung, Kab. Humbang Hasundutan\nSumatera Utara, Indonesia 22457",
    },
    {
      icon: "fas fa-phone",
      title: "Telephone",
      content: "(0623) 9876-5432",
    },
    {
      icon: "fas fa-envelope",
      title: "Email",
      content: "contact@tsth2pollung.id",
    },
    {
      icon: "fas fa-clock",
      title: "Operating Hours",
      content: "Senin - Jumat: 08:00 - 17:00\nSabtu: 08:00 - 14:00",
    },
  ];

  return (
    <footer className="modern-footer">
      {/* Animated background elements */}
      <div className="footer-background">
        <div className="bg-elements">
          {Array.from({ length: 15 }).map((_, i) => (
            <motion.div
              key={i}
              className={`bg-element element-${i % 3}`}
              animate={{
                y: [0, -30, 0],
                opacity: [0.1, 0.3, 0.1],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 4 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <Container className="footer-content">
          <motion.div
            variants={animations.staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <Row className="main-footer-content">
              {/* Company Info */}
              <Col lg={4} md={6} sm={12} className="mb-5">
                <motion.div
                  variants={animations.slideInLeft}
                  className="footer-section company-info"
                >
                  <div className="company-header">
                    <motion.div
                      className="logo-container"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="logo-wrapper">
                        <img
                          src={logo}
                          alt="DairyTrack Logo"
                          className="logo-image"
                        />
                        <div className="logo-glow"></div>
                      </div>
                      <div className="logo-text-container">
                        <h3 className="logo-text">DairyTrack</h3>
                        <span className="logo-tagline">
                          Quality Dairy Solutions
                        </span>
                      </div>
                    </motion.div>
                  </div>

                  <p className="company-description">
                    Providing premium quality dairy products from the farm to
                    your table, maintaining the highest standards of freshness
                    and taste while supporting sustainable farming practices for
                    a better future.
                  </p>

                  <div className="company-stats">
                    <motion.div
                      className="stat-item"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="stat-number">15+</div>
                      <div className="stat-label">Years of Experience</div>
                    </motion.div>
                    <motion.div
                      className="stat-item"
                      whileHover={{ scale: 1.05 }}
                    >
                      <div className="stat-number">1000+</div>
                      <div className="stat-label">Satisfied Customer</div>
                    </motion.div>
                  </div>

                  <div className="social-section">
                    <h6 className="social-title">
                      <i className="fas fa-share-alt me-2"></i>
                      Follow Us
                    </h6>
                    <div className="social-links">
                      {socialLinks.map((social, index) => (
                        <motion.a
                          key={index}
                          href={social.href}
                          className="social-link"
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{
                            scale: 1.2,
                            y: -5,
                            backgroundColor: social.color,
                          }}
                          whileTap={{ scale: 0.9 }}
                          title={social.label}
                        >
                          <i className={social.icon}></i>
                        </motion.a>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </Col>

              {/* Quick Links */}
              <Col lg={2} md={6} sm={6} className="mb-5">
                <motion.div
                  variants={animations.scaleIn}
                  className="footer-section"
                >
                  <h5 className="section-title">
                    <i className="fas fa-link me-2"></i>
                    Quick Links{" "}
                  </h5>
                  <motion.ul
                    className="footer-menu"
                    variants={animations.staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                  >
                    {quickLinks.map((link, index) => (
                      <motion.li
                        key={index}
                        variants={animations.fadeInUp}
                        whileHover={{ x: 10 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Link to={link.to} className="menu-link">
                          <i className={`${link.icon} me-2`}></i>
                          <span>{link.label}</span>
                          <i className="fas fa-chevron-right ms-auto"></i>
                        </Link>
                      </motion.li>
                    ))}
                  </motion.ul>
                </motion.div>
              </Col>

              {/* Contact Info */}
              <Col lg={3} md={6} sm={6} className="mb-5">
                <motion.div
                  variants={animations.slideInRight}
                  className="footer-section"
                >
                  <h5 className="section-title">
                    <i className="fas fa-address-book me-2"></i>
                    Contact us
                  </h5>
                  <motion.div
                    className="contact-list"
                    variants={animations.staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                  >
                    {contactInfo.map((contact, index) => (
                      <motion.div
                        key={index}
                        variants={animations.fadeInUp}
                        className="contact-item"
                        whileHover={{ scale: 1.02, x: 5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="contact-icon">
                          <i className={contact.icon}></i>
                        </div>
                        <div className="contact-content">
                          <h6 className="contact-title">{contact.title}</h6>
                          <p className="contact-text">{contact.content}</p>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              </Col>

              {/* Map & Location */}
              <Col lg={3} md={12} sm={12} className="mb-5">
                <motion.div
                  variants={animations.scaleIn}
                  className="footer-section"
                >
                  <h5 className="section-title">
                    <i className="fas fa-map-marked-alt me-2"></i>
                    Find Us
                  </h5>
                  <motion.div
                    className="map-container"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <iframe
                      src="https://maps.google.com/maps?width=600&height=400&hl=en&q=Taman%20Sains%20Teknologi%20Herbal%20dan%20Hortikultura%20(TSTH2)&t=p&z=6&ie=UTF8&iwloc=B&output=embed"
                      title="Lokasi DairyTrack"
                      className="google-map"
                      loading="lazy"
                      frameBorder="0"
                      allowFullScreen=""
                    ></iframe>
                  </motion.div>

                  <div className="location-features">
                    <motion.div
                      className="feature-item"
                      whileHover={{ scale: 1.05 }}
                    >
                      <i className="fas fa-parking"></i>
                      <span>Free Parking</span>
                    </motion.div>
                    <motion.div
                      className="feature-item"
                      whileHover={{ scale: 1.05 }}
                    >
                      <i className="fas fa-wheelchair"></i>
                      <span>Accessible</span>
                    </motion.div>
                    <motion.div
                      className="feature-item"
                      whileHover={{ scale: 1.05 }}
                    >
                      <i className="fas fa-wifi"></i>
                      <span>Free WiFi</span>
                    </motion.div>
                  </div>
                </motion.div>
              </Col>
            </Row>
          </motion.div>
        </Container>
      </div>

      {/* Enhanced Footer Bottom */}
      <motion.div
        className="footer-bottom"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <Container>
          <Row className="align-items-center">
            <Col md={6} className="text-center text-md-start">
              <div className="copyright-section">
                <p className="copyright-text">
                  &copy; {currentYear} <strong>DairyTrack</strong> by TSTH². All
                  rights reserved.
                </p>
                <div className="legal-links">
                  <Link to="/privacy" className="legal-link">
                    Privacy Policy
                  </Link>
                  <span className="separator">•</span>
                  <Link to="/terms" className="legal-link">
                    Terms of Service
                  </Link>
                  <span className="separator">•</span>
                  <Link to="/cookies" className="legal-link">
                    Cookie Policy
                  </Link>
                </div>
              </div>
            </Col>
            <Col md={6} className="text-center text-md-end">
              <div className="credits-section">
                <p className="credits-text">
                  Crafted with{" "}
                  <motion.i
                    className="fab fa-github"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  ></motion.i>{" "}
                  by Tim DairyTrack
                </p>
                <div className="tech-badges">
                  <span className="tech-badge">React</span>
                  <span className="tech-badge">Bootstrap</span>
                  <span className="tech-badge">Framer Motion</span>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </motion.div>

      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap");

        .modern-footer {
          font-family: "Inter", sans-serif;
          position: relative;
          overflow: hidden;
        }

        /* Background Elements */
        .footer-background {
          background: ${theme.gradients.surface};
          position: relative;
          padding: 80px 0 0;
        }

        .bg-elements {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
        }

        .bg-element {
          position: absolute;
          border-radius: 50%;
        }

        .element-0 {
          width: 100px;
          height: 100px;
          background: ${theme.gradients.glow};
          top: 10%;
          left: 5%;
        }

        .element-1 {
          width: 60px;
          height: 60px;
          background: rgba(255, 179, 71, 0.1);
          top: 30%;
          right: 10%;
        }

        .element-2 {
          width: 80px;
          height: 80px;
          background: rgba(79, 121, 66, 0.1);
          bottom: 20%;
          left: 15%;
        }

        .footer-content {
          position: relative;
          z-index: 2;
        }

        /* Company Info Section */
        .footer-section {
          height: 100%;
        }

        .company-info {
          padding-right: 2rem;
        }

        .company-header {
          margin-bottom: 2rem;
        }

        .logo-container {
          display: flex;
          align-items: center;
          gap: 1rem;
          cursor: pointer;
        }

        .logo-wrapper {
          position: relative;
          width: 60px;
          height: 60px;
        }

        .logo-image {
          width: 60px;
          height: 60px;
          border-radius: 15px;
          background: white;
          padding: 8px;
          box-shadow: ${theme.shadows.card};
          position: relative;
          z-index: 2;
        }

        .logo-glow {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: ${theme.gradients.primary};
          border-radius: 15px;
          opacity: 0.3;
          filter: blur(10px);
          animation: pulse 2s ease-in-out infinite alternate;
        }

        @keyframes pulse {
          from {
            transform: scale(0.95);
            opacity: 0.3;
          }
          to {
            transform: scale(1.05);
            opacity: 0.6;
          }
        }

        .logo-text-container {
          display: flex;
          flex-direction: column;
        }

        .logo-text {
          font-size: 1.8rem;
          font-weight: 800;
          color: ${theme.light.primary};
          margin: 0;
          line-height: 1;
        }

        .logo-tagline {
          font-size: 0.8rem;
          color: ${theme.light.muted};
          font-weight: 500;
          margin-top: 0.25rem;
        }

        .company-description {
          color: ${theme.light.secondary};
          font-size: 0.95rem;
          line-height: 1.7;
          margin-bottom: 2rem;
        }

        .company-stats {
          display: flex;
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .stat-item {
          text-align: center;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .stat-item:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-2px);
        }

        .stat-number {
          font-size: 1.5rem;
          font-weight: 700;
          color: ${theme.secondary};
          line-height: 1;
        }

        .stat-label {
          font-size: 0.8rem;
          color: ${theme.light.muted};
          margin-top: 0.25rem;
        }

        /* Social Section */
        .social-section {
          margin-top: 2rem;
        }

        .social-title {
          font-size: 1rem;
          font-weight: 600;
          color: ${theme.light.primary};
          margin-bottom: 1rem;
        }

        .social-links {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .social-link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 45px;
          height: 45px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.1);
          color: ${theme.light.primary};
          font-size: 1.2rem;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .social-link:hover {
          color: white;
          box-shadow: ${theme.shadows.glow};
        }

        /* Section Titles */
        .section-title {
          font-size: 1.3rem;
          font-weight: 700;
          color: ${theme.light.primary};
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          position: relative;
        }

        .section-title::after {
          content: "";
          position: absolute;
          bottom: -8px;
          left: 0;
          width: 40px;
          height: 3px;
          background: ${theme.gradients.primary};
          border-radius: 2px;
        }

        /* Quick Links */
        .footer-menu {
          list-style: none;
          padding: 0;
          margin-bottom: 2rem;
        }

        .footer-menu li {
          margin-bottom: 0.75rem;
        }

        .menu-link {
          display: flex;
          align-items: center;
          padding: 0.75rem 1rem;
          border-radius: 10px;
          color: ${theme.light.secondary};
          text-decoration: none;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .menu-link:hover {
          background: rgba(255, 255, 255, 0.1);
          color: ${theme.light.primary};
          border-color: rgba(255, 255, 255, 0.1);
        }

        .menu-link i:first-child {
          color: ${theme.secondary};
          width: 20px;
        }

        .menu-link .fa-chevron-right {
          font-size: 0.8rem;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .menu-link:hover .fa-chevron-right {
          opacity: 1;
        }

        /* Newsletter */
        .newsletter-signup {
          background: rgba(255, 255, 255, 0.05);
          padding: 1.5rem;
          border-radius: 15px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
        }

        .newsletter-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: ${theme.light.primary};
          margin-bottom: 0.5rem;
        }

        .newsletter-desc {
          font-size: 0.9rem;
          color: ${theme.light.muted};
          margin-bottom: 1rem;
        }

        .newsletter-form {
          display: flex;
          gap: 0.5rem;
        }

        .newsletter-input {
          flex: 1;
          padding: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.1);
          color: ${theme.light.primary};
          font-size: 0.9rem;
          backdrop-filter: blur(10px);
        }

        .newsletter-input::placeholder {
          color: ${theme.light.muted};
        }

        .newsletter-input:focus {
          outline: none;
          border-color: ${theme.secondary};
          box-shadow: 0 0 0 3px rgba(255, 179, 71, 0.2);
        }

        .newsletter-btn {
          padding: 0.75rem;
          border: none;
          border-radius: 8px;
          background: ${theme.gradients.secondary};
          color: white;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
          width: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .newsletter-btn:hover {
          box-shadow: ${theme.shadows.glow};
        }

        /* Contact Info */
        .contact-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .contact-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .contact-item:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .contact-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 45px;
          height: 45px;
          border-radius: 10px;
          background: ${theme.gradients.primary};
          color: white;
          font-size: 1.1rem;
          flex-shrink: 0;
        }

        .contact-content {
          flex: 1;
        }

        .contact-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: ${theme.light.primary};
          margin-bottom: 0.25rem;
        }

        .contact-text {
          font-size: 0.85rem;
          color: ${theme.light.secondary};
          margin: 0;
          line-height: 1.5;
          white-space: pre-line;
        }

        /* Map Section */
        .map-container {
          position: relative;
          border-radius: 15px;
          overflow: hidden;
          box-shadow: ${theme.shadows.card};
          margin-bottom: 1.5rem;
          height: 250px;
        }

        .map-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            45deg,
            rgba(0, 0, 0, 0.7) 0%,
            transparent 50%
          );
          z-index: 10;
          pointer-events: none;
        }

        .map-info {
          position: absolute;
          top: 1rem;
          left: 1rem;
          color: white;
          pointer-events: auto;
        }

        .google-map {
          width: 100%;
          height: 100%;
          border: none;
          filter: grayscale(20%) contrast(1.1);
        }

        .location-features {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 0.8rem;
          color: ${theme.light.secondary};
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .feature-item:hover {
          background: rgba(255, 255, 255, 0.1);
          color: ${theme.light.primary};
        }

        .feature-item i {
          color: ${theme.secondary};
          font-size: 0.9rem;
        }

        /* Footer Bottom */
        .footer-bottom {
          background: ${theme.dark.bg};
          padding: 2rem 0;
          border-top: 1px solid ${theme.dark.border};
        }

        .copyright-section {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .copyright-text {
          font-size: 0.9rem;
          color: ${theme.light.secondary};
          margin: 0;
        }

        .legal-links {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .legal-link {
          font-size: 0.8rem;
          color: ${theme.light.muted};
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .legal-link:hover {
          color: ${theme.secondary};
        }

        .separator {
          color: ${theme.light.muted};
          font-size: 0.8rem;
        }

        .credits-section {
          display: flex;
          flex-direction: column;
          align-items: end;
          gap: 0.5rem;
        }

        .credits-text {
          font-size: 0.9rem;
          color: ${theme.light.secondary};
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .heart-icon {
          color: #e53e3e;
        }

        .tech-badges {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .tech-badge {
          background: rgba(255, 255, 255, 0.1);
          color: ${theme.light.muted};
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 500;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
          .company-info {
            padding-right: 1rem;
          }

          .company-stats {
            gap: 1rem;
          }
        }

        @media (max-width: 992px) {
          .footer-background {
            padding: 60px 0 0;
          }

          .main-footer-content .col-lg-4,
          .main-footer-content .col-lg-3,
          .main-footer-content .col-lg-2 {
            margin-bottom: 3rem;
          }

          .company-info {
            padding-right: 0;
          }

          .credits-section {
            align-items: flex-start;
            margin-top: 1rem;
          }
        }

        @media (max-width: 768px) {
          .footer-background {
            padding: 40px 0 0;
          }

          .logo-container {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
          }

          .company-stats {
            justify-content: center;
            text-align: center;
          }

          .social-links {
            justify-content: center;
          }

          .location-features {
            justify-content: center;
          }

          .legal-links {
            justify-content: center;
          }

          .tech-badges {
            justify-content: center;
          }

          .map-container {
            height: 200px;
          }
        }

        @media (max-width: 576px) {
          .newsletter-form {
            flex-direction: column;
          }

          .newsletter-btn {
            width: 100%;
          }

          .company-stats {
            flex-direction: column;
            gap: 1rem;
          }

          .stat-item {
            padding: 0.75rem;
          }

          .contact-item {
            flex-direction: column;
            text-align: center;
          }

          .contact-icon {
            align-self: center;
          }
        }

        /* Accessibility */
        @media (prefers-reduced-motion: reduce) {
          .logo-glow,
          .heart-icon,
          .bg-element {
            animation: none;
          }
        }

        @media (prefers-contrast: high) {
          .footer-section {
            border: 2px solid ${theme.light.primary};
          }

          .social-link,
          .menu-link,
          .contact-item {
            border: 2px solid ${theme.light.muted};
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
