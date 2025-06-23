import React, { useEffect, useState } from "react";
import { Container, Row, Col, Image, Card, Button } from "react-bootstrap";
import { motion, useAnimation, useScroll, useTransform } from "framer-motion";
import { useInView } from "react-intersection-observer";

// Enhanced Animation variants
const animations = {
  fadeInUp: {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  },
  slideInLeft: {
    hidden: { opacity: 0, x: -80 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  },
  slideInRight: {
    hidden: { opacity: 0, x: 80 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  },
  staggerContainer: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  },
  floatAnimation: {
    y: [0, -20, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

const AnimatedSection = ({
  children,
  variant = animations.fadeInUp,
  delay = 0,
}) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ threshold: 0.2, triggerOnce: true });

  useEffect(() => {
    if (inView) controls.start("visible");
  }, [controls, inView]);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={variant}
      custom={delay}
    >
      {children}
    </motion.div>
  );
};

const About = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  // Enhanced color theme
  const theme = {
    primary: "#E9A319",
    secondary: "#3D8D7A",
    accent: "#F15A29",
    light: "#F8F9FA",
    dark: "#212529",
    gradients: {
      primary: "linear-gradient(135deg, #E9A319 0%, #F4B942 100%)",
      secondary: "linear-gradient(135deg, #3D8D7A 0%, #4AA391 100%)",
      hero: "linear-gradient(135deg, rgba(61, 141, 122, 0.9), rgba(61, 141, 122, 0.7))",
      card: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
    },
    shadows: {
      card: "0 20px 60px rgba(0, 0, 0, 0.1)",
      hover: "0 30px 80px rgba(0, 0, 0, 0.15)",
      glow: "0 0 30px rgba(233, 163, 25, 0.3)",
    },
  };

  // Mouse movement handler for parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const statsData = [
    {
      icon: "fas fa-chart-line",
      value: "1000+",
      label: "Liters of Milk/Day",
      color: theme.primary,
    },
    {
      icon: "fas fa-user-graduate",
      value: "50+",
      label: "Trained Farmers",
      color: theme.secondary,
    },
    {
      icon: "fas fa-dna",
      value: "10+",
      label: "Genetic Research",
      color: theme.accent,
    },
    {
      icon: "fas fa-award",
      value: "5+",
      label: "Cattle Awards",
      color: theme.primary,
    },
  ];

  const featuresData = [
    {
      icon: "fas fa-glass-whiskey",
      title: "Sapi Perah",
      description:
        "Focus on high quality milk production through optimal management of nutrition, health and barn environment..",
      color: theme.secondary,
      link: "https://id.wikipedia.org/wiki/Sapi_perah", // Wikipedia Indonesia
    },
    {
      icon: "fas fa-dna",
      title: "Girolando",
      description:
        "Girolando cattle are a cross between Giro and Holstein cattle, combining tropical hardiness with high milk productivity..",
      color: theme.primary,
      link: "https://en.wikipedia.org/wiki/Girolando", // Wikipedia English (karena tidak tersedia versi Bahasa Indonesia)
    },
    {
      icon: "fas fa-stethoscope",
      title: "Kesehatan & Nutrisi",
      description:
        "TSTH² implements research-based animal health and nutrition standards to ensure cow welfare..",
      color: theme.accent,
      link: "https://www.fao.org/dairy-production-products/animal-health-and-welfare/en/", // FAO - Kesehatan & Kesejahteraan Hewan
    },
    {
      icon: "fas fa-leaf",
      title: "Lingkungan Hijau",
      description:
        "Commitment to sustainability by maintaining ecosystem balance and supporting environmentally friendly farming practices..",
      color: theme.primary,
      link: "https://www.fao.org/sustainability/en/", // FAO - Sustainability in Agriculture
    },
  ];

  const girolandoFeatures = [
    {
      icon: "fas fa-sun",
      title: "Climate Adaptability",
      description: "High tolerance to heat and humidity in tropical climates",
      // icon color white
    },
    {
      icon: "fas fa-shield-virus",
      title: "Disease Resistance",
      description: "Resistant to parasites and tropical diseases",
    },
    {
      icon: "fas fa-tint",
      title: "Milk Production",
      description: "Average 15-25 liters/day with 4-5% fat content",
    },
    {
      icon: "fas fa-calendar-alt",
      title: "Lactation Period",
      description: "Lactation period of 275-305 days with good persistence",
    },
  ];
  return (
    <div className="modern-about">
      {/* Enhanced Hero Section */}
      <section className="hero-section">
        <motion.div className="hero-background" style={{ y }}>
          <div className="hero-overlay"></div>

          {/* Floating particles */}
          <div className="particles-container">
            {Array.from({ length: 30 }).map((_, i) => (
              <motion.div
                key={i}
                className={`particle particle-${i % 3}`}
                animate={{
                  y: [0, -100, 0],
                  x: [0, Math.random() * 50 - 25, 0],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: 4 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          <Container className="hero-content">
            <Row className="align-items-center min-vh-100">
              <Col lg={8} className="hero-text">
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={animations.fadeInUp}
                >
                  <div className="hero-badge">
                    <i className="fas fa-paw me-2"></i>
                    Cattle Breeding Research Center
                  </div>
                  <h1 className="hero-title">
                    About Cows in
                    <span className="gradient-text"> TSTH²</span>
                  </h1>
                  <div className="title-divider"></div>
                  <p className="hero-description">
                    TSTH² not only focuses on herbal plants and horticulture,
                    but also becomes a center for dairy cattle development and
                    research. We are committed to sustainable and modern cattle
                    farming innovation..
                  </p>

                  <div className="hero-features">
                    {[
                      "Genetic Research",
                      "Modern Technology",
                      "Sustainability",
                    ].map((feature, i) => (
                      <motion.div
                        key={i}
                        className="hero-feature"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                      >
                        <i className="fas fa-check-circle"></i>
                        <span>{feature}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </Col>

              <Col lg={4} className="hero-visual">
                <motion.div
                  className="hero-icon-container"
                  animate={animations.floatAnimation}
                >
                  <div className="hero-icon-circle">
                    <div className="icon-glow"></div>
                    <i className="fas fa-paw"></i>
                  </div>

                  {/* Floating stats around icon */}
                  <motion.div
                    className="floating-stat stat-1"
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <div className="stat-content">
                      <div className="stat-number">200+</div>
                      <div className="stat-label text-dark">Cows</div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="floating-stat stat-2"
                    animate={{ rotate: -360 }}
                    transition={{
                      duration: 25,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <div className="stat-content">
                      <div className="stat-number">99%</div>
                      <div className="stat-label text-dark">Healthy</div>
                    </div>
                  </motion.div>
                </motion.div>
              </Col>
            </Row>
          </Container>
        </motion.div>
      </section>

      {/* Enhanced Intro Section */}
      <section className="intro-section">
        <Container>
          <Row className="justify-content-center">
            <Col md={10} className="text-center">
              <AnimatedSection>
                <div className="section-header">
                  <div className="section-badge">About Us</div>
                  <h2 className="section-title">
                    Research & Innovation Center
                    <span className="gradient-text"> Cattle farm</span>
                  </h2>
                  <div className="section-divider">
                    <div className="divider-line"></div>
                    <div className="divider-dot"></div>
                    <div className="divider-line"></div>
                  </div>
                  <p className="section-description">
                    TSTH² develops technology and management of cattle farming
                    based on data, nutrition, and animal health. We support
                    local farmers to improve the productivity and quality of
                    Indonesian cattle.
                  </p>
                </div>
              </AnimatedSection>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Enhanced Features Section */}
      <section className="features-section">
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={animations.staggerContainer}
          >
            <Row className="g-4">
              {featuresData.map((feature, index) => (
                <Col lg={3} md={6} key={index}>
                  <motion.div
                    variants={animations.scaleIn}
                    whileHover={{
                      y: -15,
                      transition: { duration: 0.3 },
                    }}
                    className="feature-card"
                  >
                    <div className="feature-card-inner">
                      <div className="feature-background">
                        <i className={feature.icon}></i>
                      </div>

                      <div
                        className="feature-icon"
                        style={{
                          background: `linear-gradient(135deg, ${feature.color}, ${feature.color}dd)`,
                          boxShadow: `0 10px 30px ${feature.color}40`,
                        }}
                      >
                        <i className={feature.icon}></i>
                      </div>

                      <h4 className="feature-title">{feature.title}</h4>
                      <p className="feature-description">
                        {feature.description}
                      </p>

                      <div className="feature-hover-overlay">
                        <Button
                          variant="light"
                          size="sm"
                          className="learn-more-btn"
                          as="a" // Make the button an anchor tag
                          href={feature.link} // Set the href to the feature link
                          target="_blank" // Open in new tab
                          rel="noopener noreferrer" // Security measure
                        >
                          Learn More <i className="fas fa-arrow-right ms-2"></i>
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </motion.div>
        </Container>
      </section>

      {/* Enhanced Stats Section */}
      <section className="stats-section">
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
              <AnimatedSection variant={animations.slideInLeft}>
                <div className="stats-image-container">
                  <div className="image-frame">
                    <Image
                      src={require("../../assets/about.png")}
                      alt="Sapi TSTH²"
                      className="stats-image"
                    />
                    <div className="image-overlay">
                      <div className="overlay-content">
                        <h5>Guaranteed Quality</h5>
                        <p>Healthy & productive cows</p>
                      </div>
                    </div>
                  </div>

                  {/* Floating achievement badge */}
                  <motion.div
                    className="achievement-badge"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="badge-icon">
                      <i className="fas fa-trophy"></i>
                    </div>
                    <div className="badge-content">
                      <div className="badge-number">200+</div>
                      <div className="badge-label">Cattle Population</div>
                    </div>
                  </motion.div>
                </div>
              </AnimatedSection>
            </Col>

            <Col lg={6} className="mt-5 mt-lg-0">
              <AnimatedSection variant={animations.slideInRight}>
                <div className="stats-content">
                  <h2 className="stats-title">
                    Inovasi Peternakan
                    <span className="gradient-text"> Sapi Modern</span>
                  </h2>
                  <div className="title-divider"></div>
                  <p className="stats-description">
                    We integrate digital technology for monitoring cattle,
                    recording milk production, growth, and health. TSTH² is also
                    active in training farmers and developing human resources
                    for cattle farming.
                  </p>

                  <motion.div
                    className="stats-grid"
                    variants={animations.staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                  >
                    {statsData.map((stat, index) => (
                      <motion.div
                        key={index}
                        variants={animations.scaleIn}
                        className="stat-item"
                        whileHover={{ scale: 1.05 }}
                      >
                        <div
                          className="stat-icon"
                          style={{
                            background: `${stat.color}20`,
                            color: stat.color,
                          }}
                        >
                          <i className={stat.icon}></i>
                        </div>
                        <div className="stat-info">
                          <motion.div
                            className="stat-number"
                            initial={{ opacity: 0, scale: 0.5 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            {stat.value}
                          </motion.div>
                          <div className="stat-label text-dark">
                            {stat.label}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              </AnimatedSection>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Enhanced Girolando Section */}
      <section className="girolando-section">
        <Container>
          <Row className="justify-content-center mb-5">
            <Col md={10} className="text-center">
              <AnimatedSection>
                <div className="section-header">
                  <div className="section-badge">Featured Breeds</div>
                  <h2 className="section-title">
                    Breed Development
                    <span className="gradient-text"> Girolando</span>
                  </h2>
                  <div className="section-divider">
                    <div className="divider-line"></div>
                    <div className="divider-dot"></div>
                    <div className="divider-line"></div>
                  </div>
                </div>
              </AnimatedSection>
            </Col>
          </Row>

          <Row className="align-items-center g-5">
            <Col lg={6}>
              <AnimatedSection variant={animations.slideInLeft}>
                <div className="video-container">
                  <div className="video-frame">
                    <iframe
                      src="https://www.youtube.com/embed/ajYPqE9p3LM"
                      title="Girolando Cattle Breed di TSTH²"
                      allowFullScreen
                      className="video-iframe"
                    ></iframe>
                  </div>

                  <motion.div
                    className="video-badge"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="video-badge-content">
                      <div className="badge-title">Featured Breeds</div>
                      <div className="badge-subtitle">TSTH²</div>
                    </div>
                  </motion.div>
                </div>
              </AnimatedSection>
            </Col>

            <Col lg={6}>
              <AnimatedSection variant={animations.slideInRight}>
                <div className="girolando-content">
                  <h3 className="content-title">
                    Girolando Breed Characteristics
                  </h3>
                  <p className="content-description">
                    Girolando was first developed in Brazil and is now one of
                    the main dairy cattle breeds in tropical regions. At TSTH²,
                    we choose Girolando because of its advantages in:
                  </p>
                  <motion.div
                    className="features-grid"
                    variants={animations.staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                  >
                    {girolandoFeatures.map((feature, index) => (
                      <motion.div
                        key={index}
                        variants={animations.scaleIn}
                        className="feature-item"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div
                          className="feature-item-icon"
                          style={{
                            background: theme.gradients.primary,
                            color: "#fff",
                          }}
                        >
                          <i
                            className={feature.icon}
                            style={{ color: "#fff" }}
                          ></i>
                        </div>
                        <div className="feature-item-content">
                          <h5 className="feature-item-title">
                            {feature.title}
                          </h5>
                          <p className="feature-item-description">
                            {feature.description}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                  <p className="additional-info">
                    Di TSTH², kami memelihara populasi Girolando dengan
                    perbandingan genetik 5/8 Holstein dan 3/8 Gir yang telah
                    terbukti optimal untuk kondisi iklim Indonesia.
                  </p>
                  <div className="action-buttons">
                    <motion.a
                      href="https://openknowledge.fao.org/bitstreams/94676ea4-7091-4c52-adea-d23f573d0b50/download"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary-gradient"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <i className="fas fa-book-open me-2"></i>
                      Download FAO Research
                    </motion.a>
                    <motion.a
                      href="https://www.embrapa.br/en/gado-de-leite"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline-secondary ms-3"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <i className="fas fa-external-link-alt me-2"></i>
                      Embrapa Research
                    </motion.a>
                  </div>
                </div>
              </AnimatedSection>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Enhanced Vision & Mission Section */}
      <section className="vision-mission-section">
        <Container>
          <AnimatedSection>
            <div className="section-header text-center mb-5">
              <div className="section-badge">Our Commitment</div>
              <h2 className="section-title">
                Vision & Mission of Cattle Farming
              </h2>
              <div className="section-divider">
                <div className="divider-line"></div>
                <div className="divider-dot"></div>
                <div className="divider-line"></div>
              </div>
              <p className="section-description">
                Becoming a leading center for research, innovation, and cattle
                development in Indonesia.
              </p>
            </div>
          </AnimatedSection>

          <Row className="g-5">
            <Col lg={5}>
              <AnimatedSection variant={animations.slideInLeft}>
                <motion.div
                  className="vision-card"
                  whileHover={{ y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="card-header">
                    <div className="card-icon vision-icon">
                      <i className="fas fa-lightbulb"></i>
                    </div>
                    <h3 className="card-title">Visi</h3>
                  </div>
                  <div className="card-content">
                    <p>
                      Becoming a center for cattle farming research and
                      innovation that produces technology and products to
                      support national food security. We are committed to being
                      a reference at the national and regional levels in the
                      development of sustainable and efficient cattle farming,
                      with the integration of modern technology for the welfare
                      of farmers and the independence of Indonesia's
                    </p>
                  </div>
                </motion.div>
              </AnimatedSection>
            </Col>

            <Col lg={7}>
              <AnimatedSection variant={animations.slideInRight}>
                <motion.div
                  className="mission-card"
                  whileHover={{ y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="card-header">
                    <div className="card-icon mission-icon">
                      <i className="fas fa-bullseye"></i>
                    </div>
                    <h3 className="card-title">Misi</h3>
                  </div>
                  <div className="card-content">
                    <motion.div
                      className="mission-list"
                      variants={animations.staggerContainer}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                    >
                      {[
                        "Developing a cattle maintenance system based on technology and data.",
                        "Conducting research on nutrition, health, and cattle genetics to increase productivity.",
                        "Enhancing farmers' capacity through training and mentoring.",
                        "Becoming a center for national and international collaboration in the field of cattle farming.",
                      ].map((mission, index) => (
                        <motion.div
                          key={index}
                          variants={animations.fadeInUp}
                          className="mission-item"
                          whileHover={{ x: 10 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="mission-icon">
                            <i className="fas fa-check-circle"></i>
                          </div>
                          <p>{mission}</p>
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                </motion.div>
              </AnimatedSection>
            </Col>
          </Row>
        </Container>
      </section>

      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap");

        .modern-about {
          font-family: "Inter", sans-serif;
          overflow-x: hidden;
        }

        /* Hero Section */
        .hero-section {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
        }

        .hero-background {
          background: linear-gradient(
              135deg,
              rgba(61, 141, 122, 0.9),
              rgba(61, 141, 122, 0.7)
            ),
            url(${require("../../assets/about.png")}) no-repeat center center;
          background-size: cover;
          min-height: 100vh;
          position: relative;
        }

        .hero-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(
            45deg,
            rgba(61, 141, 122, 0.8) 0%,
            rgba(233, 163, 25, 0.6) 100%
          );
          z-index: 1;
        }

        .particles-container {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 2;
          pointer-events: none;
        }

        .particle {
          position: absolute;
          border-radius: 50%;
        }

        .particle-0 {
          width: 4px;
          height: 4px;
          background: rgba(255, 255, 255, 0.6);
          top: 20%;
          left: 10%;
        }

        .particle-1 {
          width: 6px;
          height: 6px;
          background: rgba(233, 163, 25, 0.5);
          top: 40%;
          left: 80%;
        }

        .particle-2 {
          width: 3px;
          height: 3px;
          background: rgba(255, 255, 255, 0.4);
          top: 70%;
          left: 30%;
        }

        .hero-content {
          position: relative;
          z-index: 10;
          color: white;
        }

        .hero-badge {
          display: inline-block;
          background: rgba(255, 255, 255, 0.2);
          color: white;
          padding: 8px 20px;
          border-radius: 25px;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 1.5rem;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .hero-title {
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 800;
          line-height: 1.2;
          margin-bottom: 1.5rem;
        }

        .gradient-text {
          background: ${theme.gradients.primary};
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .title-divider {
          width: 80px;
          height: 4px;
          background: ${theme.gradients.primary};
          margin-bottom: 1.5rem;
          border-radius: 2px;
        }

        .hero-description {
          font-size: 1.2rem;
          line-height: 1.7;
          margin-bottom: 2rem;
          max-width: 600px;
          opacity: 0.95;
        }

        .hero-features {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .hero-feature {
          display: flex;
          align-items: center;
          gap: 1rem;
          font-weight: 500;
        }

        .hero-feature i {
          color: ${theme.primary};
          font-size: 1.2rem;
        }

        .hero-icon-container {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
        }

        .hero-icon-circle {
          width: 200px;
          height: 200px;
          background: rgba(255, 255, 255, 0.15);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          position: relative;
          overflow: hidden;
        }

        .hero-icon-circle i {
          font-size: 5rem;
          color: white;
          z-index: 2;
        }

        .icon-glow {
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(
            circle,
            rgba(233, 163, 25, 0.3) 0%,
            transparent 70%
          );
          animation: rotate 8s linear infinite;
        }

        @keyframes rotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        .floating-stat {
          position: absolute;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 15px;
          padding: 1rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(10px);
          color: ${theme.dark};
        }

        .stat-1 {
          top: 20%;
          left: -30%;
        }

        .stat-2 {
          bottom: 20%;
          right: -30%;
        }

        .stat-content {
          text-align: center;
        }

        .stat-number {
          font-size: 1.5rem;
          font-weight: 700;
          color: ${theme.primary};
          line-height: 1;
        }

        .stat-label {
          font-size: 0.8rem;
          color: black;
          font-weight: 500;
        }

        /* Section Styles */
        .intro-section,
        .features-section,
        .stats-section,
        .girolando-section,
        .vision-mission-section {
          padding: 120px 0;
        }
        .vision-card .card-content p {
          color: #333;
        }

        .features-section {
          background: ${theme.light};
        }

        .girolando-section {
          background: ${theme.light};
        }

        .vision-mission-section {
          background: linear-gradient(
            135deg,
            rgba(61, 141, 122, 0.05),
            rgba(233, 163, 25, 0.1)
          );
        }

        /* Section Headers */
        .section-header {
          margin-bottom: 4rem;
        }

        .section-badge {
          display: inline-block;
          background: ${theme.gradients.primary};
          color: white;
          padding: 8px 24px;
          border-radius: 25px;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 1rem;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .section-title {
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 700;
          color: black;
          margin-bottom: 1rem;
          line-height: 1.3;
        }

        .section-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .divider-line {
          width: 60px;
          height: 2px;
          background: ${theme.gradients.primary};
        }

        .divider-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: ${theme.primary};
        }

        .section-description {
          font-size: 1.1rem;
          color: #718096;
          max-width: 700px;
          margin: 0 auto;
          line-height: 1.7;
        }

        /* Feature Cards */
        .feature-card {
          background: white;
          border-radius: 20px;
          padding: 2.5rem;
          height: 100%;
          box-shadow: ${theme.shadows.card};
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          position: relative;
          overflow: hidden;
          cursor: pointer;
        }

        .feature-card:hover {
          box-shadow: ${theme.shadows.hover};
        }

        .feature-card-inner {
          position: relative;
          z-index: 2;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .feature-background {
          position: absolute;
          top: -20px;
          right: -20px;
          font-size: 6rem;
          color: rgba(233, 163, 25, 0.05);
          z-index: 1;
        }

        .feature-icon {
          width: 80px;
          height: 80px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
          font-size: 2rem;
          color: white;
        }

        .feature-title {
          font-size: 1.4rem;
          font-weight: 700;
          color: ${theme.dark};
          margin-bottom: 1rem;
        }

        .feature-description {
          color: #718096;
          line-height: 1.6;
          flex-grow: 1;
        }

        .feature-hover-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: ${theme.gradients.primary};
          padding: 1.5rem;
          transform: translateY(100%);
          transition: transform 0.3s ease;
          text-align: center;
        }

        .feature-card:hover .feature-hover-overlay {
          transform: translateY(0);
        }

        .learn-more-btn {
          background: white;
          color: ${theme.primary};
          border: none;
          font-weight: 600;
          padding: 0.75rem 1.5rem;
          border-radius: 25px;
        }

        /* Stats Section */
        .stats-image-container {
          position: relative;
        }

        .image-frame {
          position: relative;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: ${theme.shadows.card};
        }

        .stats-image {
          width: 100%;
          height: 400px;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        .image-frame:hover .stats-image {
          transform: scale(1.05);
        }

        .image-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
          padding: 2rem;
          color: white;
        }

        .overlay-content h5 {
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .overlay-content p {
          margin: 0;
          opacity: 0.9;
        }

        .achievement-badge {
          position: absolute;
          bottom: -20px;
          right: -20px;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 15px;
          padding: 1.5rem;
          box-shadow: ${theme.shadows.card};
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          gap: 1rem;
          max-width: 200px;
        }

        .badge-icon {
          width: 50px;
          height: 50px;
          background: ${theme.gradients.primary};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.2rem;
        }

        .badge-number {
          font-size: 1.8rem;
          font-weight: 700;
          color: ${theme.primary};
          line-height: 1;
        }

        .badge-label {
          font-size: 0.9rem;
          color: ${theme.dark};
          font-weight: 500;
        }

        .stats-content {
          padding-left: 2rem;
        }

        .stats-title {
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 700;
          color: ${theme.dark};
          margin-bottom: 1.5rem;
          line-height: 1.3;
        }

        .stats-description {
          font-size: 1.1rem;
          color: #718096;
          line-height: 1.7;
          margin-bottom: 2.5rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: white;
          padding: 1.5rem;
          border-radius: 15px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }

        .stat-item:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
        }

        .stat-icon {
          width: 60px;
          height: 60px;
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .stat-number {
          font-size: 1.8rem;
          font-weight: 700;
          color: ${theme.dark};
          line-height: 1;
        }

        .stat-label {
          font-size: 0.9rem;
          color: #718096;
          font-weight: 500;
        }

        /* Video Section */
        .video-container {
          position: relative;
        }

        .video-frame {
          position: relative;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: ${theme.shadows.card};
          aspect-ratio: 16/9;
        }

        .video-iframe {
          width: 100%;
          height: 100%;
          border: none;
        }

        .video-badge {
          position: absolute;
          bottom: -15px;
          right: -15px;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 15px;
          padding: 1rem 1.5rem;
          box-shadow: ${theme.shadows.card};
          backdrop-filter: blur(10px);
        }

        .video-badge-content {
          text-align: center;
        }

        .badge-title {
          font-weight: 700;
          color: ${theme.dark};
          font-size: 1rem;
        }

        .badge-subtitle {
          font-size: 0.8rem;
          color: #718096;
        }

        .girolando-content {
          padding-left: 2rem;
        }

        .content-title {
          font-size: 1.8rem;
          font-weight: 700;
          color: ${theme.dark};
          margin-bottom: 1.5rem;
        }

        .content-description {
          font-size: 1.1rem;
          color: #718096;
          line-height: 1.7;
          margin-bottom: 2rem;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .feature-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          background: white;
          padding: 1.5rem;
          border-radius: 15px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }

        .feature-item:hover {
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        .feature-item-icon {
          width: 50px;
          height: 50px;
          background: ${theme.gradients.primary};
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.2rem;
          flex-shrink: 0;
        }

        .feature-item-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: ${theme.dark};
          margin-bottom: 0.5rem;
        }

        .feature-item-description {
          font-size: 0.9rem;
          color: #718096;
          margin: 0;
          line-height: 1.5;
        }

        .additional-info {
          font-size: 1.1rem;
          color: #718096;
          line-height: 1.7;
          margin-bottom: 2rem;
        }

        .action-buttons {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .btn-primary-gradient {
          background: ${theme.gradients.primary};
          border: none;
          color: white;
          padding: 0.75rem 2rem;
          border-radius: 25px;
          font-weight: 600;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          box-shadow: 0 8px 25px rgba(233, 163, 25, 0.3);
          transition: all 0.3s ease;
        }

        .btn-primary-gradient:hover {
          color: white;
          text-decoration: none;
          box-shadow: ${theme.shadows.glow};
        }

        /* Vision Mission Cards */
        .vision-card,
        .mission-card {
          background: white;
          border-radius: 20px;
          padding: 2.5rem;
          height: 100%;
          box-shadow: ${theme.shadows.card};
          transition: all 0.4s ease;
          position: relative;
          overflow: hidden;
        }

        .vision-card {
          border-left: 5px solid ${theme.primary};
        }

        .mission-card {
          border-left: 5px solid ${theme.secondary};
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .card-icon {
          width: 60px;
          height: 60px;
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: white;
        }

        .vision-icon {
          background: ${theme.gradients.primary};
        }

        .mission-icon {
          background: ${theme.gradients.secondary};
        }

        .card-title {
          font-size: 1.8rem;
          font-weight: 700;
          color: ${theme.dark};
          margin: 0;
        }

        .card-content {
          font-size: 1.1rem;
          color: #718096;
          line-height: 1.7;
        }

        .mission-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .mission-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          transition: all 0.3s ease;
        }

        .mission-icon {
          width: 40px;
          height: 40px;
          background: ${theme.gradients.primary};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1rem;
          flex-shrink: 0;
          margin-top: 0.2rem;
        }

        .mission-item p {
          margin: 0;
          font-size: 1.1rem;
          line-height: 1.6;
          color: #333; /* Or any other color that provides sufficient contrast */
        }

        /* Responsive Design */
        @media (max-width: 991px) {
          .stats-content,
          .girolando-content {
            padding-left: 0;
            margin-top: 3rem;
          }

          .stats-grid,
          .features-grid {
            grid-template-columns: 1fr;
          }

          .action-buttons {
            justify-content: center;
          }

          .floating-stat {
            display: none;
          }
        }

        @media (max-width: 768px) {
          .intro-section,
          .features-section,
          .stats-section,
          .girolando-section,
          .vision-mission-section {
            padding: 80px 0;
          }

          .hero-features {
            margin-top: 2rem;
          }

          .section-title {
            text-align: center;
          }

          .feature-card {
            margin-bottom: 2rem;
          }
        }

        @media (max-width: 576px) {
          .hero-content {
            padding: 2rem 1rem;
          }

          .section-header {
            margin-bottom: 2rem;
          }

          .action-buttons {
            flex-direction: column;
            align-items: center;
          }
        }
      `}</style>
    </div>
  );
};

export default About;
